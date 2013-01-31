var cheerio = require("cheerio")
,	request = require("request")
impurge = []

module.exports = impurge;

//pattern used for extraction of the links from the html
imgur_url_pattern = RegExp("^http://((www)|(i)\.)?imgur.com/[./a-zA-Z0-9&,]+","ig")

//patterns used to check URL patterns
imgur_album_url_pattern = RegExp("^http://(?:www\.)?imgur\.com/a/([a-zA-Z0-9]+)","i")
imgur_hashes_pattern = RegExp("imgur\.com/(([a-zA-Z0-9]{5}[&,]?)+)","i")
imgur_image_pattern = RegExp("^http://(www\.)?(i\.)?imgur\.com/.{3,7}\.((jpg)|(gif))","ig")

//determines the link provided to module
determine_link_type = function  (url, callback) {
	if ( imgur_image_pattern.exec(url) ) {
		callback(null,'image_url',null,url);
	}
	else if ( imgur_album_url_pattern.exec(url) ) {
		var match = imgur_album_url_pattern.exec(url)
	    if (match){
	    	var hashes = match[1].split(/[,&]/);
	    }
		callback(null,'album_url',hashes);
	}
	else if ( imgur_hashes_pattern.exec(url) ) {
		var match = imgur_hashes_pattern.exec(url)
	    if (match){
	    	var hashes = match[1].split(/[,&]/);
	    } 
		callback(null,'hash_url',hashes);
	}
	else {
		callback('unidentified_type');
	}

}

impurge.purge = function  (url, callback) {
	determine_link_type(url, function (error, type, id,url) {
		if (error) {
			callback(error)
		}
		else{
			var links = [];
			if (type === 'image_url'){
				callback(null, [url])
				return;
			}
			else if (type === 'album_url'){
				var url = 'http://api.imgur.com/2/album/'+id+".json"
			}
			else if (type === 'hash_url'){
				var url = 'http://api.imgur.com/2/image/'+id+".json"
			}
			else {
				callback("unknown_link_error")
			}
			request(url, function  (err, res, body) {		
				try{
					var api_json = JSON.parse(body);	
				}	catch (err) {
					callback("impurge: JSON parsing error");
				}
				
				for (var type in api_json){
					//console.log(type)
					if (type === 'image'){
						links.push(api_json[type]['links']['original']);
						callback(null, links ) ;
					}
					if (type === 'album'){
						
						var images_json = api_json[type]['images'];
						for (var image in images_json){
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
