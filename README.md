#impurge

This is a simple module meant to extract image URLS from imgur images in a standard format despite differences in URL format


Example:
```js
var impurge = require('impurge');
  impurge.purge("http://imgur.com/IvpcP", function  (e,r) {
  console.log(r)
});
```

will result in:

```js
http://i.imgur.com/IvpcP.jpg
```

or for multiple images

```js
var impurge = require('impurge');
  impurge.purge("http://imgur.com/a/QgHRA", function  (e,r) {
  console.log(r)
});
```

will result in:
```js
[ 'http://i.imgur.com/OzAiFJ5.jpg',
  'http://i.imgur.com/AS76Rhx.jpg',
  'http://i.imgur.com/gx436Y2.jpg' ]
```

It currently supports:
 - album urls ie: http://imgur.com/a/{HASH}
 - gallery_url  http://imgur.com/gallery/{HASH}
 - hash_url  http://imgur.com/{HASH}
 - hash_url 9multiple)  http://imgur.com/{HASH},{HASH},{HASH},
 - image_url  http://i.imgur.com/{hash}.jpg?1

The new test file included will check the currency of the regular expressions against live reddit data to ensure imgur is not changing link formats and will look for any it does not recognize


I have added a few additional methods that I used for testing the accuracy of my regex's
```js
impurge.is_imgur(url); //will output true if the url is imgur
```

the following takes a string input and will return an array of imgur links contained within
```js
impurge.get_text_imgur_links(text); // will return an array of links
```

and finally I exposed a function to determine the link type (previously used internally)
```js
impurge.determine_link_type(url, function(err, type, id, i_url){
	//err is given if link is not recognized
	//type is image_url, album_url, gallery_url, hash_url
	//id is the id for the link (if applicable)
	//i_url is the image url if this is a direct image
});
```
