var ImportProvider = require('../providers/import');
var OvhTaskScrapper = require('./scrapper');

var ImportService = function() {

    var self = this;
    var ovhtask = OvhTaskScrapper.get();
    var provider = ImportProvider.get();
    
    self.import = (categoryId, count = 50, options) => {
        return ovhtask.list(categoryId, count, options)
            .then((datas) => {
                return provider.store(datas);
            });
    };

    self.importAll = (options) => {
        return ovhtask.list(0, null, options)
            .then((datas) => {
                return provider.store(datas);
            });
    }

};

var Factory = {
    get : () => { return new ImportService(); }
}

module.exports = Factory;