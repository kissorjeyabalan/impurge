This is a simple module meant to extract image URLS from imgur

<pre><code>var impurge = require('impurge');
  impurge.purge("http://i.imgur.com/IvpcP.jpg", function  (e,r) {
  console.log(r)
});
</code>
