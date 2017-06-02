var scrapper = (require('../lib/ovhtask')).scrapper.get();
var _ = require('lodash/core');

var Menu = require('terminal-menu');
var menu = Menu({ width: 29, x: 4, y: 2 });
menu.reset();
menu.write('OVH Task JS - Samples \n');
menu.write('-------------------------\n');

menu.add('Get last 55 tasks');
menu.add('Get all tasks from all projects');
menu.add('Get categories');
menu.add('Exit');

menu.on('select', function (label, index) {
    menu.close();

    switch(index){
        case 0 : 
            scrapper.list(0,55).then(console.log);
            break;
        case 1 :
            scrapper.list(0).then(console.log);
            break;
        case 2 :
            scrapper.categories().then(console.log);
            break;
    }
});

process.stdin.pipe(menu.createStream()).pipe(process.stdout);
process.stdin.setRawMode(true);

menu.on('close', function () {
    process.stdin.setRawMode(false);
    process.stdin.end();
});