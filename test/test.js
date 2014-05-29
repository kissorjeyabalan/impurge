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
                    throw new Error('unknown imgur link type: ' + url)
                } else {
                    //console.log(url, 'is a ', type, 'with id:', id, 'and url', i_url);
                }
            });
        }
    });

//this is a test for text it should return 5 links 
// var testTextAlbum = 'http://imgur.com/a/o7AVs is a  album_url with id: [ o7AVs ] and url undefined ';
// var testTextImage = 'http://i.imgur.com/4aCgHc7.jpg is a  image_url with id: null and url http://i.imgur.com/4aCgHc7.jpg ';
// var testTextHash = 'http://i.imgur.com/oM1mFEd.jpg is a  hash_url with id: [ oM1mFEd] and url undefined ';
// var testTextAlbum2 = 'http://imgur.com/a/h4gt1 is a  album_url with id: [ h4gt1 ] and url undefined';
// var testText = testTextAlbum + testTextImage + testTextHash + testTextAlbum2;
// console.log(testText);
// var comment_links = impurge.get_text_imgur_links(testText);