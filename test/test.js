var should = require('should');
var impurge = require('../impurge.js');

describe('impurge', function(){
	describe('image url', function  () {
		it('should find 1 picture', function(done){
			impurge.purge("http://i.imgur.com/AXvN0Mq.png", function  (e,r) {
				r.length.should.equal(1)
				r[0].should.equal('http://i.imgur.com/AXvN0Mq.png');
				
				done();
			})    	
    	});
	});
	describe('image hash url', function  () {
		it('should find 1 picture', function(done){
			impurge.purge("http://imgur.com/WWm8Cl6", function  (e,r) {
				r.length.should.equal(1);
				r[0].should.equal('http://i.imgur.com/WWm8Cl6.jpg');
				done();
			})    	
    	});
	});
	describe('album url', function  () {
		it('should find 2 pictures', function(done){
			impurge.purge("http://imgur.com/a/9uIQf", function  (e,r) {
				r.length.should.equal(2);
				r[0].should.equal('http://i.imgur.com/Z6ft3xZ.jpg');
				r[1].should.equal('http://i.imgur.com/xSW842C.jpg');
				done();
			})    	
    	});
	});
	describe('image hash url', function  () {
		it('should find 1 picture', function(done){
			impurge.purge("http://imgur.com/SKiDPaz", function  (e,r) {
				r.length.should.equal(1);
				r[0].should.equal('http://i.imgur.com/SKiDPaz.jpg');
				done();
			})    	
    	});
	});
	describe('gallery hash url', function  () {
		it('should find 4 pictures', function(done){
			impurge.purge("http://imgur.com/gallery/Ptn4M", function  (e,r) {
			    r.length.should.equal(4);
				r[0].should.equal('http://i.imgur.com/tYx0Ebf.gif');
				done();
			})    	
    	});
	});
});


