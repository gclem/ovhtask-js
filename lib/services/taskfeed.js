'use strict'

var db = require('../providers/db');
const EventEmitter = require('events');

class TaskFeedService extends EventEmitter {

    constructor() {
        super();
        this.db = db.get();
        this.TaskModel = this.db.TaskModel;
        this.TaskChange = this.db.TaskChange;
    }

    listen() {
        var self = this;
        return this.TaskModel.changes()
            .then(function (feed) {
                feed.each(function (error, doc) {
                    if (error) {
                        console.error(error);
                    }

                    if (doc.isSaved() === false) {
                        self.emit('delete', doc);
                    }
                    else if (doc.getOldValue() == null) {
                        self.emit('new', doc);
                    }
                    else {
                        self.emit('update', doc.getOldValue(), doc);
                    }
                });
            })
            .error(function (error) {
                console.error(error);
                return error;
            });
    }
};

var Factory = {
    get : () => { return new TaskFeedService(); }
}

module.exports = Factory;