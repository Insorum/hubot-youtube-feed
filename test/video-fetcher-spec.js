(function() {
    var chai = require('chai');
    var sinon = require('sinon');
    chai.use(require('sinon-chai'));
    var expect = chai.expect;
    var nock = require('nock');
    var Robot = require('hubot').Robot;
    var VideoFetcher = require('../src/lib/video-fetcher');

    describe('video-fetcher', function() {

        var fetcher;

        beforeEach(function() {
            var robot = new Robot(null, 'mock-adapter', false, 'Test');
            fetcher = new VideoFetcher(robot);
        });

        it('should return array of valid videos for a good username', function(done) {

            //mock the data with an old version
            nock('https://gdata.youtube.com')
                .get('/feeds/api/users/Eluinhost/uploads?alt=json')
                .replyWithFile(200, __dirname + '/data/Eluinhost.json');

            fetcher.fetchVideosForUser('Eluinhost').then(
                function onSuccess(vids) {
                    try {
                        expect(vids).to.have.length(25);

                        expect(vids[0].id).to.be.equal('http://gdata.youtube.com/feeds/api/videos/m2N6GJBJJi4');
                        expect(vids[0].link).to.be.equal('https://www.youtube.com/watch?v=m2N6GJBJJi4&feature=youtube_gdata');

                        expect(vids[15].id).to.be.equal('http://gdata.youtube.com/feeds/api/videos/Km263MIIBpI');
                        expect(vids[15].link).to.be.equal('https://www.youtube.com/watch?v=Km263MIIBpI&feature=youtube_gdata');

                        done();
                    } catch(e) {
                        done(e);
                    }
                },
                function onFail(err) {
                    done(err);
                }
            );
        });

        it('should fail the promise if the username is invalid', function(done) {
            //mock the return data
            nock('https://gdata.youtube.com')
                .get('/feeds/api/users/invalid/uploads?alt=json')
                .reply(404, 'User not found');

            fetcher.fetchVideosForUser('invalid').then(
                function onSuccess() {
                    done('Should not had success from the promise');
                },
                function onFail() {
                    done();
                }
            );
        });

        it('should fail the promise if the username is invalid format', function(done) {
            //mock the return data
            nock('https://gdata.youtube.com')
                .get('/feeds/api/users/bad_format/uploads?alt=json')
                .reply(400, 'Invalid value for parameter: username');

            fetcher.fetchVideosForUser('bad_format').then(
                function onSuccess() {
                    done('Should not had success from the promise');
                },
                function onFail() {
                    done();
                }
            );
        });
    });

}).call(this);