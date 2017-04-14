var provider = new (require('../lib/task-provider'))();
var _ = require('lodash/core');

//// Getting all recents news from all projects
provider.list(0).then((data) => console.log(data.length));