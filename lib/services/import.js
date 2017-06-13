var ImportProvider = require('../providers/import');
var OvhTaskScrapper = require('./scrapper');

var ImportService = function() {

    var self = this;
    var ovhtask = OvhTaskScrapper.get();
    var provider = ImportProvider.get();
    
    self.import = (categoryId, options) => {
        return ovhtask.list(categoryId, options)
            .then((datas) => {
                return provider.store(datas);
            });
    };

    self.importAll = (options) => {
        return ovhtask.list(0, options)
            .then((datas) => {
                return provider.store(datas);
            });
    }

};

var Factory = {
    get : () => { return new ImportService(); }
}

module.exports = Factory;