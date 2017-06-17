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
        .then((datas) => { console.log('%s items imported.', datas[0].length); process.exit(0); })
        .catch((err) => { console.error('Full imported faulted', err); process.exit(1); });
}

//// Refresh
if (program.refresh) {
    importer
        .import(0, { from : 1, to : 3, withDetails : true })
        .then((datas) => { console.log('Refreshed. %s items imported.', datas[0].length); process.exit(0); })
        .catch((err) => { console.error('Refresh faulted', err); process.exit(1); });
}


