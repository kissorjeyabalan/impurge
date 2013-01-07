This is a simple module meant to extract image URLS from imgur

<pre><code>var impurge = require('impurge');
  impurge.purge("http://imgur.com/IvpcP", function  (e,r) {
  console.log(r)
});
</code>

will give you 

<code>http://i.imgur.com/IvpcP.jpg

This works for the three type of Imgur links i have encounted, and will spit out all links for albums as well
