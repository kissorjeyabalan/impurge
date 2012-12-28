var should = require('should');
var impurge = require('../impurge.js');

describe('impurge', function(){
	describe('image url', function  () {
		it('should find 1 picture', function(done){
			impurge.purge("http://i.imgur.com/ndzyY.jpg", function  (e,r) {
				if (r.length === 1){
					done();
				}
			})    	
    	});
	});
	describe('image hash url', function  () {
		it('should find 1 picture', function(done){
			impurge.purge("http://imgur.com/Wj8j4", function  (e,r) {
				if (r.length === 1){
					done();
				}
			})    	
    	});
	});
	describe('album url', function  () {
		it('should find 18 pictures', function(done){
			impurge.purge("http://imgur.com/a/mmMXw", function  (e,r) {
				if (r.length === 18){
					done();
				}
			})    	
    	});
	});
});


