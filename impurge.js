var cheerio = require("cheerio")
,	request = require("request");

module.exports = impurge;

impurge.purge = function  (url, callback) {
    request({url:url, text: true}, function (e, r, b) {
    	console.log(response)
    }
}
