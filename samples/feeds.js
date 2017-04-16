var feed = (require('../lib/ovhtask')).feed.get();
var _ = require('lodash/core');

var Menu = require('terminal-menu');
var menu = Menu({ width: 29, x: 4, y: 2 });
menu.reset();
menu.write('OVH Task JS - Importer Tools \n');
menu.write('-------------------------\n');

menu.add('Listen for activities');
menu.add('Exit');

menu.on('select', function (label, index) {
    menu.close();

    switch(index){
        case 0 : 
            feed.listen();
            feed.on('new', (data) => { console.log("New data")} )
            feed.on('update', (old, data) => { console.log("Updated")} )
            feed.on('delete', (data) => { console.log("Deleted")} )
            break;
    }
});

process.stdin.pipe(menu.createStream()).pipe(process.stdout);
process.stdin.setRawMode(true);

menu.on('close', function () {
    process.stdin.setRawMode(false);
    process.stdin.end();
});