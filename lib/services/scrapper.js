#!/usr/bin/env node

/**
 * @author gclem
 * @description Provide task informations from OVH Task platform
 */


const cheerio = require('cheerio');
var r = require('request');
const rp = require('request-promise');
const _ = require('lodash/core');
const util = require('util');
const FeedParser = require('feedparser');
const Promise = require('bluebird');

/** System URL */
const URL = {
    "DEFAULT_BASE": "http://travaux.ovh.net/",
    "CATEGORIES": `?project=0&status=all&perpage=1`,
    "LIST": "?project=%s&status=all&pagenum=%s",
    "RSS": `rss.php?proj=%s`,
    "DETAIL": '?do=details&id=%s'
};

/** Category where all news are displayed */
const MAIN_CATEGORY = 0;

/**
 * Main TaskScrapper
 * @constructor
 */
var TaskScrapper = function (baseUrl) {
    var self = this;
    self.baseUrl = baseUrl || URL.DEFAULT_BASE;

    /**
     * Provide and generate the base url.
     */
    self.forgeUrl = function(...values) {
        return self.baseUrl + util.format.apply(this, values);
    };

    /**
     * Get all task categories
     */
    self.categories = () => {

        var projects = [];

        var options = {
            uri: self.forgeUrl(URL.categories),
            headers: {
                'User-Agent': 'ovh-task-broadcast-kikoo-IAAS'
            },
            json: true
        };

        return rp(options).then((context) => {
            const $ = cheerio.load(context);
            _.each($('.projectsmenupos'), (project) => {
                var item = $(project);
                var id = item.find('input[name="project"]').val();
                var name = item.find('.mainbutton').val();

                if (!id || id === 0)
                    return;

                projects.push({ "id": id, "name": name });
            });

            return projects;
        });
    };

    /**
     * Get all news, from rss reed
     */
    self.news = (projectid) => {

        if (projectId != undefined && projectId >= 0)
            throw new Error("INVALID_ARGUMENT_PROJECT_ID");

        return new Promise((resolve, reject) => {

            var feedparser = new FeedParser();
            var req = r(self.forgeUrl(URL.RSS, projectid));
            var items = [];
            var listen = false;

            req.on('error', function (error) {
                reject(error);
            });

            req.on('response', function (res) {
                var stream = this; // `this` is `req`, which is a stream

                if (res.statusCode !== 200) {
                    reject(new Error('Bad status code'));
                }
                else {
                    stream.pipe(feedparser);
                }
            });

            feedparser.on('error', function (error) {
                reject(error);
            });

            feedparser.on('readable', function () {
                // This is where the action is!
                var stream = this; // `this` is `feedparser`, which is a stream
                var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
                var item;

                while (item = stream.read()) {
                    items.push(item);
                }

                //// TODO : leak memory
                if (!listen) { stream.once('end', () => { resolve(items); }); listen = true; };
            });
        });
    };

    /**
     * Get all tasks, from main table list, for one specific page
     */
    self.get = (projectId, page = 1, options) => {

        if (isNaN(projectId) || projectId < 0)
            return Promise.reject("INVALID_ARGUMENT_PROJECT_ID");

        var self = this;

        var parameters = {
            url: self.forgeUrl(URL.LIST, projectId, page),
            headers: {
                'User-Agent': 'ovh-task-broadcast-kikoo-IAAS'
            },
            json: true
        };

        var results = [];

        return rp(parameters).then((context) => {
            const $ = cheerio.load(context);
            results.pagecount = parseInt(/\d+\d+/.exec($('#numbers').text())[0]);
            _.each($('tr[id^=task]'), (item) => {
                var task = $(item);
                var r = {};
                r.id = task.find('.task_id').text();
                r.type = task.find('.task_tasktype').text();
                r.project = task.find('.task_project').text();
                r.category = task.find('.task_category').text();
                r.summary = task.find('.task_summary > a').text();
                r.status = task.find('.task_status').text();
                r.opened = task.find('.task_dateopened').text();
                r.lastedit = task.find('.task_lastedit').text();
                r.projectId = projectId.toString();

                results.push(r);
            })

            if (options && options.withDetails) 
            {
                return Promise.map(results, function (r) {
                    console.log("Getting detail for task %s", r.id);
                    return self.detail(r.id).then((data) => { 
                        r.progress = data.progress; 
                        r.details = data.details;
                        r.comments = data.comments;
                        return r;
                    });
                });

            }
            else 
                return results;
        });
    };

    /**
     * Get all tasks, from main table list
     * @from : start page index
     * @to : stop page index
     */
    self.list = (projectId, options) => {
        var from = options && options.from ? options.from : 1;
        var to = options && options.to ? options.to : null;
        var maxPages = !to || to === 0 ? 0 : to;
        var concurrency = options && options.concurrency ? optoins.concurrency : 3;

        return self.get(projectId, 1)
                .then((r) => {
                    if(!r)
                        return undefined;
                    maxPages = maxPages === 0 || maxPages >= r.pagecount ? r.pagecount : maxPages;
                    var pages = Array.from(Array(maxPages+1).keys()).filter(i => i >= from && i <= (to || maxPages+1));

                    return Promise.map(pages, function (page) {
                        console.log("Getting page %s / %s ...", page, maxPages);
                        return self.get(projectId, page, options);
                    }, { concurrency: concurrency})
                    .call("reduce", function(a,b) { return a.concat(b); })
                    .catch((err) => console.error);
                });
    }

    /**
     * Get details information about a task, from detail page
     */
   self.detail = (taskid) => {

        if (!taskid)
            throw new Error("INVALID_ARGUMENT_TASKID");

        var options = {
            url: self.forgeUrl(URL.DETAIL, taskid),
            headers: {
                'User-Agent': 'ovh-task-broadcast-kikoo-IAAS'
            },
            json: true
        };

        return rp(options).then((detailctx) => {
            const $ = cheerio.load(detailctx);
            var r = {};

            //// Title
            var mn = $($('#taskdetails')[0]);
            r.title = mn.find('h2').text().trim();
            r.category = mn.find('#fineprint > a').text();

            //// Fields
            mn = $($('#taskfields1')[0]);
            r.id = taskid;
            r.type = mn.find('#tasktype').text();
            r.category = mn.find('#category').text().trim();
            r.status = mn.find('#status').text().trim();
            r.progress = mn.find('#percent > img').attr('alt');

            //// Content
            mn = $($('#taskdetailsfull')[0]);
            r.details = mn.text().trim();

            //// Content
            r.comments = [];
            mn = $('#comments > em');
            for (var i = 0; i < mn.length; i++) {
                var em = $(mn[i])

                var sp = em.text().split('-');
                var author = sp.length > 1 ? sp[0].replace('Comment by', '').trim() : 'N/C';
                var time = sp.length > 1 ? new Date(`${sp[1].split(',')[1]} ${sp[1].split(',')[2].replace(/[AP]M/, '')}`) : undefined;

                r.comments.push({ author : author, date: time, text: em.next().text() });
            }

            return r;
        });
    };

    /**
     * Get all task and informations, starting from the RSS feed, with all details, sort by task
     */
    self.newspaper = (category) => {

        var promises = []
        var self = this;
        var category = category || MAIN_CATEGORY;

        return self.news(category)
            .then((news) => {
                var reg = /id\=([0-9]*)/;
                _.each(news, (item) => {
                    var taskid = self.forgeUrl(URL.DETAIL, reg.exec(item.link)[1]);
                    promises.push(TaskProvider.detail(taskid));
                });

                return Promise.all(promises).then(console.log);
            });
    };
};

var Factory = {
    get : () => { return new TaskScrapper(); }
}

module.exports = Factory;