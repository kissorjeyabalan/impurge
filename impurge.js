var request = require("request")
var xray = require("x-ray")
var async = require("async")
var impurge = [];

module.exports = impurge;

var imgurStats = require('measured').createCollection();

//pattern used for extraction of the links from the html
var imgur_url_pattern = RegExp("^https?://((www)|(i)|(m)\.)?imgur.com/[./a-zA-Z0-9&,]+", "ig");

//patterns used to check URL patterns
var imgur_album_url_pattern = RegExp("^https?://(?:m\.)?(?:www\.)?imgur\.com/a/([a-zA-Z0-9]+)", "i");
var imgur_gallery_url_pattern = RegExp("^https?://(?:www\.)?imgur\.com/gallery/([a-zA-Z0-9]+)", "i");
var imgur_hashes_pattern = RegExp("imgur\.com/(([a-zA-Z0-9]{5,7}[&,]?)+)", "i");
var imgur_image_pattern = RegExp("^https?://(www\.)?(i\.)?(m\.)?imgur\.com/.{3,7}\.((jpg)|(gif)|(png))", "ig");
var gfycat_pattern = RegExp("^https?:\/\/(?:thumbs\.)?(?:www\.)?gfycat\.com\/([a-zA-Z0-9]+)", "i");
var eroshare_pattern = RegExp("^https?:\/\/(?:www\.)?eroshare\.com\/([a-zA-Z0-9]+)", "i");
var reddituploads_pattern = RegExp("^https?:\/\/(?:i\.)?reddituploads\.com\/", "i");
impurge.requests_per_second = function() {
    try {
        var reqsPerSec = imgurStats.toJSON().requestsPerSecond.mean;
    } catch (err) {
        var reqsPerSec = 0;
    }
    return reqsPerSec;
}

impurge.get_text_imgur_links = function(text) {
    var imgur_url_pattern = RegExp("(http)(s)?://(((m)\.)|(www)\.|((i)\.))?imgur.com/(a/)?[a-zA-Z0-9&]+((\.jpg)|(\.gif)|(\.png))?", "igm");
    var matches = text.match(imgur_url_pattern);
    return matches;
}

impurge.is_imgur = function(url) {
    var imgur_url_pattern = RegExp("http(s)?://(((m)\.)|((www)\.)|((i)\.))?imgur.com/(a/)?[a-zA-Z0-9&]+((\.jpg)|(\.gif)|(\.png))?", "i");
    var match = imgur_url_pattern.exec(url);
    if (match) {
        return true; //console.log(test[0], url);
    } else if (gfycat_pattern.exec(url))
    {
        return true//console.log('NOT FOUND:', url);
    } else if (eroshare_pattern.exec(url))
    {
        return true//console.log('NOT FOUND:', url);
    } else if (reddituploads_pattern.exec(url))
    {
        return true//console.log('NOT FOUND:', url);
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
    } else if (gfycat_pattern.exec(url)){
        var match = gfycat_pattern.exec(url);
        if (match) {
            var hashes = match[1].split(/[,&]/);
        }
        callback(null, 'gfycat_url', hashes);
    } else if (eroshare_pattern.exec(url)){
        var match = eroshare_pattern.exec(url);
        callback(null, 'eroshare_url',null, url);
    } else if (reddituploads_pattern.exec(url)){
        var match = reddituploads_pattern.exec(url);
        callback(null, 'reddituploads_url',null, url);
    } 
    else {
        callback('unidentified_type');
    }

}

impurge.purge = function(url, callback) {
    imgurStats.meter('requestsPerSecond').mark();
    impurge.determine_link_type(url, function(error, type, id, url) {
        if (error) {
            callback(error)
        } else {
            var links = [];
            if (type === 'image_url') {
                callback(null, [url])
                return;
            } else if (type === 'album_url') {
                var url = 'http://imgur.com/a/'+ id
                xray(url)
                    .select([".post-image img[src]"])
                    .run(function(err, array) {
                        for (var i in array) {
                            array[i] =  "http://"+array[i].slice(18) //need to remove the extra imgur name 'http://imgur.com//i.imgur.com/L09GyzP.jpg'
                        }
                        callback(err,array);
                        return;
                    });
            } else if (type === 'hash_url' && id.length > 1) {
                for (var i in id) {
                    id[i] =  "http://imgur.com/"+id[i]
                }
                async.map(id, impurge.purge, function(err,array){
                    var merged= [];
                    merged = merged.concat.apply(merged, array);//flattens array of arrays
                    callback(err,merged)
                })
            } else if (type === 'hash_url') {

                url = "http://imgur.com/"+id
                xray(url)
                    .select(".post-image img[src]")
                    .run(function(err, item) {
                        item = "http://"+item.slice(18)
                        callback(err,[item]);
                        return;
                    });
            } else if (type === 'gallery_url') {
                var url = 'http://imgur.com/gallery/'+ id
                xray(url)
                    .select([".post-image img[src]"])
                    .run(function(err, array) {
                        for (var i in array) {
                            array[i] =  "http://"+array[i].slice(18) //need to remove the extra imgur name 'http://imgur.com//i.imgur.com/L09GyzP.jpg'
                        }
                        callback(err,array);
                        return;
                    });
            } else if (type === 'gfycat_url') {
                var url = 'http://giant.gfycat.com/'+ id +'.mp4'
                callback(null,[url])
                return;
            } else if (type === 'eroshare_url') {
                try{
                    request(url, function(error, response, body) {
                        array = [];
                        var jsons = body.split("var album =")[1].split("</script>")[0].split(";")[0]; //TrailerParkBoys dirhuhuhuhuhrty way of getting the json 
                        eroshareJSON = JSON.parse(jsons);
                        var arrayLength = eroshareJSON.items.length;
                        for (var i = 0; i < arrayLength; i++) {
                            //console.log(eroshareJSON.items[i]);
                            if (eroshareJSON.items[i].type === "Video"){
                                array.push(eroshareJSON.items[i].url_mp4);
                            } else {
                                array.push("https:"+eroshareJSON.items[i].url_orig);
                            }
                        }
                        callback(null,array);
                    });
                } catch (err){
                    console.log("error getting url: "+url);
                    callback("error_eroshare");
                }
                
                return 
            } else if (type === 'reddituploads_url') {
                url = url.split("&amp;").join("&");
                callback(null,[url]);

                return;

            } else {
                callback("unknown_link_error")
                return;
            }
            imgurStats.meter('requestsPerSecond').mark();

        }
        //console.log("type: "+ type)
    })

}
