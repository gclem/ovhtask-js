'use strict'
/* 
* OVH Task JS
*
* Provide non official tools for interacting with Travaux OVH platform.
*
*/

module.exports = {
    scrapper : require('./services/scrapper'),
    import : require('./services/import'),
    feed : require('./services/taskfeed')
}