var importer = (require('../lib/ovhtask')).import.get();
var _ = require('lodash/core');
var program = require('commander');

program
  .option('-a, --all', 'Import all tasks')
  .option('-r, --refresh', 'Refresh with last 200 tasks')
  .parse(process.argv);
 
console.log("OVH Task CLI Importer.");

 //// All 
if (program.all) {
    importer.importAll({ withDetails : false })
        .then((datas) => { console.log('%s items imported.', datas.length); })
        .catch((err) => { console.error('Full imported faulted', err); });
}

//// Refresh
if (program.refresh) {
    importer
        .import(0, 200, { withDetails : true })
        .then((datas) => { console.log('Refreshed. %s items imported.', datas.length); })
        .catch((err) => { console.error('Refresh faulted', err); });
}


