'use strict'

/*
* Db providers 
* Manage data storing to specific databases
*/
const EventEmitter = require('events');

class RethinkDatabaseProvider extends EventEmitter {

    constructor() {
        super();
        this.orm = require('thinky')();
        this.init();
    }

    init () {
        var type = this.orm.type;
        this.TaskModel = this.orm.createModel("Task", {
            id: type.string(),
            type: type.string(),
            project: type.string(),
            category: type.string(),
            summary: type.string(),
            status: type.string(),
            opened: type.date(),
            lastedit: type.date(),
            projectId: type.string()
        });

        this.TaskChangeModel = this.orm.createModel("TaskChange", {
            id : type.string(),
            taskId : type.string(),
            lastedit : type.date(),
            type : type.string(),
            time : type.date(),
            hash : type.string()
        });
    }
};

var Factory = {
    get : () => { return new RethinkDatabaseProvider(); }
}

module.exports = Factory;
