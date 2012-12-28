var should = require('should');
var impurge = require('../impurge.js');

describe('impurge', function(){
	describe('image url', function  () {
		it('should find 1 picture', function(done){
			impurge.purge("http://i.imgur.com/IvpcP.jpg", function  (e,r) {
				r.length.should.equal(1)
				done();
			})    	
    	});
	});
	describe('image hash url', function  () {
		it('should find 1 picture', function(done){
			impurge.purge("http://imgur.com/wB6Rh", function  (e,r) {
				r.length.should.equal(1)
				done();
			})    	
    	});
	});
	describe('album url', function  () {
		it('should find 12 pictures', function(done){
			impurge.purge("http://imgur.com/a/L4gQ7", function  (e,r) {
				r.length.should.equal(12)
				done();
			})    	
    	});
	});
});


