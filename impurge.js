var $ = require("cheerio"),
    request = require("request")
    var impurge = [];

module.exports = impurge;

//pattern used for extraction of the links from the html
var imgur_url_pattern = RegExp("^http://((www)|(i)\.)?imgur.com/[./a-zA-Z0-9&,]+", "ig");

//patterns used to check URL patterns
var imgur_album_url_pattern = RegExp("^http://(?:www\.)?imgur\.com/a/([a-zA-Z0-9]+)", "i");
var imgur_gallery_url_pattern = RegExp("^http://(?:www\.)?imgur\.com/gallery/([a-zA-Z0-9]+)", "i");
var imgur_hashes_pattern = RegExp("imgur\.com/(([a-zA-Z0-9]{5,7}[&,]?)+)", "i");
var imgur_image_pattern = RegExp("^http://(www\.)?(i\.)?imgur\.com/.{3,7}\.((jpg)|(gif)|(png))", "ig");

impurge.get_text_imgur_links = function(text) {
    var imgur_url_pattern = RegExp("http(s)?://((m)\.|(www)\.|((i)\.))?imgur.com/(a/)?[a-zA-Z0-9&]+((\.jpg)|(\.gif)|(\.png))?", "igm");
    var matches = imgur_url_pattern.exec(text);
    var urls = []
    while ((matches = imgur_url_pattern.exec(text)) !== null) {
        urls.push(matches[0]);
    };

    console.log(urls);
}

impurge.is_imgur = function(url) {
    var imgur_url_pattern = RegExp("http(s)?://((m\.)|((www)\.)|((i)\.))?imgur.com/(a/)?[a-zA-Z0-9&]+((\.jpg)|(\.gif)|(\.png))?", "i");
    var match = imgur_url_pattern.exec(url);
    if (match) {
        return true; //console.log(test[0], url);
    } else {
        //console.log('NOT FOUND:', url);
    };
}

//determines the link provided to module
impurge.determine_link_type = function(url, callback) {
    if (imgur_image_pattern.exec(url)) {
        callback(null, 'image_url', null, url);
    } else if (imgur_album_url_pattern.exec(url)) {
        var match = imgur_album_url_pattern.exec(url);
        if (match) {
            var hashes = match[1].split(/[,&]/)
        }
        callback(null, 'album_url', hashes);
    } else if (imgur_gallery_url_pattern.exec(url)) {
        var match = imgur_gallery_url_pattern.exec(url);
        if (match) {
            var hashes = match[1].split(/[,&]/);
        }
        callback(null, 'gallery_url', hashes);
    } else if (imgur_hashes_pattern.exec(url)) {
        var match = imgur_hashes_pattern.exec(url);
        if (match) {
            var hashes = match[1].split(/[,&]/);
        }
        callback(null, 'hash_url', hashes);
    } else {
        callback('unidentified_type');
    }

}

impurge.purge = function(url, callback) {
    impurge.determine_link_type(url, function(error, type, id, url) {
        if (error) {
            callback(error)
        } else {
            var links = [];
            if (type === 'image_url') {
                callback(null, [url])
                return;
            } else if (type === 'album_url') {
                var url = 'http://api.imgur.com/2/album/' + id + ".json"
            } else if (type === 'hash_url') {
                var url = 'http://api.imgur.com/2/image/' + id + ".json"
            } else if (type === 'gallery_url') {
                var url = 'http://api.imgur.com/2/album/' + id + ".json"
            } else {
                callback("unknown_link_error")
            }
            request(url, function(err, res, body) {
                try {
                    var api_json = JSON.parse(body);
                } catch (err) {
                    callback("impurge: JSON parsing error w/following URL:  " + url);
                }

                for (var type in api_json) {
                    //console.log(type)
                    if (type === 'image') {
                        links.push(api_json[type]['links']['original']);
                        callback(null, links);
                    }
                    if (type === 'album') {

                        var images_json = api_json[type]['images'];
                        for (var image in images_json) {
                            //console.log(images_json[image]['links']['original']);
                            links.push(images_json[image]['links']['original']);
                        }
                        callback(null, links);
                    }
                }
                return;
            })
        }
        //console.log("type: "+ type)
    })

}