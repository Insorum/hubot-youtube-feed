(function () {
    var chai = require('chai');
    var sinon = require('sinon');
    chai.use(require('sinon-chai'));
    var expect = chai.expect;
    var q = require('q');
    var LatestVideos = require('../src/lib/latest-videos');
    var Brain = require('../node_modules/hubot/src/brain');

    describe('latest-videos', function () {

        var latest, parsedData, withMissing, missingData, initialData;

        var fetcher = {};
        var brain;

        var listKey = 'youtubeFeed.latestVideos';

        beforeEach(function () {
            parsedData = require('./data/parsed.json');

            //version of the data with 2 missing elements
            withMissing = parsedData.slice(0, -2);
            missingData = parsedData.slice(-2);

            initialData = [
                {
                    name: 'Eluinhost',
                    videos: withMissing // leave a couple off for the diff to work
                }
            ];

            brain = new Brain({on: sinon.stub()});

            //set the initial data
            brain.set(listKey, initialData);

            //create a fake promise with all the data
            var dataPromise = q.defer();
            dataPromise.resolve(parsedData);

            //create a failed promise
            var failPromise = q.defer();
            failPromise.reject();

            fetcher.fetchVideosForUser = sinon.stub();

            //make fetching 'Eluinhost' return the full data promise
            fetcher.fetchVideosForUser.withArgs('Eluinhost').returns(dataPromise.promise);

            //make fetching 'fail' return a failed promise
            fetcher.fetchVideosForUser.withArgs('fail').returns(failPromise.promise);

            latest = new LatestVideos(brain, fetcher);
        });

        it('gets the initial information from the brain', function() {
            expect(latest.get()).to.be.deep.equal(initialData);
        });

        it('should set initial data if none already set', function() {
            var customBrain = new Brain({on: sinon.stub()});

            latest = new LatestVideos(customBrain, fetcher);

            expect(customBrain.get(listKey)).to.be.deep.equal([]);
        });

        it('updates videos and returns the differences', function(done) {
            latest.getLatestVideos('Eluinhost').then(
                function success(data) {
                    try {
                        expect(data.newUser).to.not.be.true;
                        expect(data.videos).to.have.length(2);
                        expect(data.videos).to.be.deep.equal(missingData);
                        expect(fetcher.fetchVideosForUser).to.have.been.calledWithExactly('Eluinhost');
                        expect(brain.get(listKey)).to.be.deep.equal(
                            [
                                {
                                    name: 'Eluinhost',
                                    videos: parsedData
                                }
                            ]
                        );
                        expect(latest.get()).to.have.length(1);
                        done();
                    } catch(e) {
                        done(e);
                    }
                },
                function failure(err) {
                    done(err);
                }
            );
        });

        it('creates a new user on first fetch', function(done) {
            //initialize an empty version
            var customBrain = new Brain({on: sinon.stub()});
            customBrain.set(listKey, []);

            latest = new LatestVideos(customBrain, fetcher);

            latest.getLatestVideos('Eluinhost').then(
                function success(data) {
                    try {
                        expect(data.newUser).to.be.true;
                        expect(data.videos).to.have.length(25);
                        expect(data.videos).to.be.deep.equal(parsedData);
                        expect(fetcher.fetchVideosForUser).to.have.been.calledWithExactly('Eluinhost');
                        expect(customBrain.get(listKey)).to.be.deep.equal(
                            [
                                {
                                    name: 'Eluinhost',
                                    videos: parsedData
                                }
                            ]
                        );
                        expect(latest.get()).to.have.length(1);
                        done();
                    } catch(e) {
                        done(e);
                    }
                },
                function failure(err) {
                    done(err);
                }
            );
        });

        it('should fail if the fetch fails and not change data', function(done) {
            latest.getLatestVideos('fail').then(
                function success() {
                    done('Should not pass when fetch fails');
                },
                function fail(err) {
                    try {
                        expect(latest.get()).to.be.length(1);
                        expect(latest.get()).to.be.deep.equal(initialData);
                    } catch(e) {
                        done(e);
                        return;
                    }
                    done();
                }
            )
        });

        it('should return a list of all the usernames stored', function() {
            var users = latest.getUserList();

            expect(users).to.be.deep.equal(['Eluinhost']);
        });

        it('should remove data from list', function() {
            expect(latest.get()).to.be.length(1);
            latest.removeUser('Eluinhost');
            expect(latest.get()).to.be.length(0);
        })
    });

}).call(this);
