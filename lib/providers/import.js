'use strict'

/*
* Import providers 
* Manage import/data storing to specific databases
*/

const EventEmitter = require('events');
const uuidV1 = require('uuid/v1');
var hash = require('md5');

class RethinkImportProvider extends EventEmitter {

    constructor() {
        super();
        this.db = require('./db').get();
    }

    store (tasks) {
        tasks = tasks && !Array.isArray(tasks) ? [tasks] : tasks;
        return Promise.all([
            this.db.TaskModel.save(tasks, {conflict: 'update'}),
            this.archive(tasks)
        ]);
    }

    archive (tasks) {
        tasks = tasks && !Array.isArray(tasks) ? [tasks] : tasks;

        var changes = tasks.map((item) => {
            return {
                taskId : item.id,
                item : item,
                lastedit : item.lastedit,
                type : item.type,
                time : Date.now(),
                id : hash(JSON.stringify(item))
            }
        });

        return this.db.TaskChangeModel.save(changes, {conflict: 'update'});
    }
};

var Factory = {
    get : () => { return new RethinkImportProvider(); }
}

module.exports = Factory;


