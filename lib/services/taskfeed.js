'use strict'

var db = require('../providers/db');
const EventEmitter = require('events');
var ImportProvider = require('../providers/import');

class TaskFeedService extends EventEmitter {

    constructor() {
        super();
        this.db = db.get();
        this.TaskModel = this.db.TaskModel;
        this.TaskChangeModel = this.db.TaskChangeModel;
        this.provider = ImportProvider.get();
    }

    listen() {
        var self = this;
        return this.TaskModel.changes()
            .then(function (feed) {
                feed.each(function (error, doc) {

                    var state = '';

                    if (error) {
                        console.error(error);
                    }

                    if (doc.isSaved() === false) {
                        state = 'delete';
                        self.emit(state, doc);
                    }
                    else if (doc.getOldValue() == null) {
                        state = 'new';
                        self.emit(state, doc);
                    }
                    else {
                        state = 'update';
                        self.emit(state, doc.getOldValue(), doc);
                    }
                });
            })
            .error(function (error) {
                console.error(error);
                return error;
            });
    }

    get(id) {
        if(!id)
            Promise.reject('INVALID_ARGUMENT_ID');

        return this.TaskModel
            .filter({'id' : id.toString()});
    }

    list(from, to) {
        if(!from || !to)
            Promise.reject('INVALID_ARGUMENT_TO_AND_FROM');

        return this.TaskModel
            .orderBy('lastedit')
            .slice(from, to);
    }

    last(count = 100) {
        return this.TaskChangeModel
            .distinct()
            .orderBy('time')
            .limit(count);
    }
};

var Factory = {
    get : () => { return new TaskFeedService(); }
}

module.exports = Factory;