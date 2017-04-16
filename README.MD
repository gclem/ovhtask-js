# OVH Task JS

Provide tools to get/subscribe on new/updated tasks from Travaux OVH.

You can : 
* access to list, details, categories/projects
* subscribe to specific tasks activites, or projects activities

## Install

```javascript
npm install ovhtask-js
```

## Dependencies
* https://rethinkdb.com (Easy install : https://www.rethinkdb.com/install/)

## Notes
Every services return promises.
Main ORM is https://thinky.io. If RethinkDB is not on your localhost, update the db config into `db.js`

## Access to tasks datas
```javascript
var scrapper = (require('ovhtask-js')).scrapper.get();

//// Category list
scrapper.categories()

//// Task list from all or one project
scrapper.list([categoryId])

//// Details from a task
scrapper.details([taskId])

//// Task list with detail on one or many projects (From RSS Feed - I don't like this)
scrapper.newspaper([categoryId])
```

## Install & subscribe to change feeds
* Rethink DB needs to be installed, and running.

### Import
* For testing purposes, you need to import datas into your RethinkDB. Sample available in samples/.
* Default is RethinkDB provider. You can do your own import provider. Only follow the signature methods.

Samples (you will access to a cli menu ) : 
```javascript
node (node_modules/ovhtask-js/)samples/import.js
```

Snippet as easy as possible :
``` javascript
var importer = (require('ovhtask-js')).import.get();
importer.importAll() //// Will import all the task 
importer.import(0, 100) //// Will import only 100 tasks from project 0 (main thread) 
```

### Subscribe
* For testing purposes, you need to import datas into your RethinkDB. Sample available in samples/. 

Samples (you will access to a cli menu ) :
```javascript
node (node_modules/ovhtask-js/)samples/feeds.js
```

Snippet as easy as possible : 
```javascript
var feed = (require('ovhtask-js')).feed.get();

            feed.listen();
            feed.on('new', (data) => { console.log("New data")} )
            feed.on('update', (old, data) => { console.log("Updated")} )
            feed.on('delete', (data) => { console.log("Deleted")} )
```

## Contributions
Feel free to contribute to this repo. 
