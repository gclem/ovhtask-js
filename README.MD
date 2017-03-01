# OVH Task Provider

Parses and extracts official tasks from OVH Task Platform.

You can : 
* get all task categories
* get all task from a category
* get all new events (feed from rss)
* get all new event (feed from table list, based on update time)
* get detail of a task

## Install

```javascript
npm install ovh-task
```

## Use
```javascript
var TaskProvider = require('ovhtask-js');
var provider = new TaskProvider([baseurl]);

//// Category list
provider.categories().then(console.log);

//// Task list from all or one project
provider.list([categoryId]).then(console.log);

//// Details from a task
provider.details([taskId]).then(console.log);

//// Task list with detail on one or many projects
provider.newspaper([categoryId]).then(console.log)
```

## Contributions

Feel free to contribute to this repo. 
