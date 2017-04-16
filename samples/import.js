var importer = (require('../lib/ovhtask')).import.get();
var _ = require('lodash/core');

var Menu = require('terminal-menu');
var menu = Menu({ width: 29, x: 4, y: 2 });
menu.reset();
menu.write('OVH Task JS - Importer Tools \n');
menu.write('-------------------------\n');

menu.add('Import all tasks');
menu.add('Import last 100 tasks');
menu.add('Exit');

menu.on('select', function (label, index) {
    menu.close();

    switch(index){
        case 0 : 
            importer.importAll().then(console.log);
        case 1 : 
            importer.import(0, 100).then(console.log);
            break;
    }
});

process.stdin.pipe(menu.createStream()).pipe(process.stdout);
process.stdin.setRawMode(true);

menu.on('close', function () {
    process.stdin.setRawMode(false);
    process.stdin.end();
});