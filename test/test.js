var request = require('request');
var stream = require('stream');

var impurge = require('../impurge.js');

//This function tests impurge by getting 100 gonewild posts

function getImgurPosts() {
    var readStream = new stream.Readable({
        objectMode: true
    });
    var usernames = [];
    try {
        request({
            url: 'http://www.reddit.com/r/gonewild.json?limit=100&after=',
            json: true
        }, function(err, res, obj) {

            //needs to check to see if this is a 404 json
            obj.data.children.forEach(function(item) {
                if (item.kind === 't3') readStream.emit('url', item.data.url);
            });
        });
    } catch (error) {
        callback("Error retrieving " + test, null)
    }
    readStream._read = function(n) {
        if (!started) loop();
        if (!started) userJSON(username);
        started = true;
    };
    return readStream
};

//need to look into converting this to the transform type in blog post below 
//http://strongloop.com/strongblog/practical-examples-of-the-new-node-js-streams-api/
getImgurPosts()
    .on('url', function(url) {
        if (!impurge.is_imgur(url)) {
            console.log('**e**NOT IMGUR', url);
        } else {
            impurge.determine_link_type(url, function(err, type, id, i_url) {
                if (err) {
                    console.log('**e**' + err, url);
                    //throw new Error('unknown imgur link type: ' + url)
                } else {
                    //console.log(url, 'is a ', type, 'with id:', id, 'and url', i_url);
                }

            });
        }
    });

var testUserObj = {};
var buffer = [];
var scrape = require('reddit-user-dump'); //this sets up the user objects for parsing

scrape('dirtymilf')
    .on('user', function(userObj) {
        testUserObj = userObj;
    }).on('data', function(post) {
        buffer.push(post)
    })
    .on('submission', function(submission) {
        testSubmission = submission.data;
    })
    .on('comment', function(comment) {
        parseComment(comment.data)
    })
    .on('end', function() {

    })

function parseComment(comment) {
    //console.log(comment.body_html)
    impurge.purge(impurge.get_text_imgur_links(comment.body + ' ' + comment.body));


};

setInterval(function() {
    try {
        var reqsPerSec = impurge.requests_per_second();
        console.log('reddit api calls per second (should be <.5)', reqsPerSec);
    } catch (err) {
        console.log(err)
    }
}, 5000); //outputs the metrics every 5 seconds