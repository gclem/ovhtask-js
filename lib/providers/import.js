'use strict'

/*
* Import providers 
* Manage import/data storing to specific databases
*/

const EventEmitter = require('events');

class RethinkImportProvider extends EventEmitter {

    constructor() {
        super();
        this.db = require('./db').get();
    }

    store (tasks) {
        tasks = tasks && !Array.isArray(tasks) ? [tasks] : tasks;
        return this.db.TaskModel.save(tasks, {conflict: 'update'});
    }
};

var Factory = {
    get : () => { return new RethinkImportProvider(); }
}

module.exports = Factory;


