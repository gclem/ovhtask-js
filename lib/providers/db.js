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
            lastedit: type.date()
        });

        this.TaskChangeModel = this.orm.createModel("TaskChange", {
            id : type.string(),
            label : type.string(),
            type : type.string(),
            time : type.date()
        });
    }
};

var Factory = {
    get : () => { return new RethinkDatabaseProvider(); }
}

module.exports = Factory;
