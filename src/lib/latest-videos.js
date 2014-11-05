var q = require('q');
var listKey = 'youtubeFeed.latestVideos';

/**
 * Keeps track of the latest videos for youtubers
 *
 * @param brain - The brain to store data in
 * @param fetcher - The fetcher to use to fetch the data
 * @constructor
 */
function LatestVideos(brain, fetcher) {
    this.brain = brain;
    this.fetcher = fetcher;

    this.saveVideos = function() {
        brain.set(listKey, this.latestVideos);
    };

    this.latestVideos = brain.get(listKey);

    // make sure the data is set if we didn't already have any
    if(this.latestVideos === null) {
        this.latestVideos = [];
        this.saveVideos();
    }
}

LatestVideos.prototype = {
    /**
     * @returns {string[]} list of all the usernames we have videos for
     */
    getUserList: function() {
        return this.latestVideos.map(function(element) {
            return element.name;
        });
    },
    removeUser: function(username) {
        this.latestVideos = this.latestVideos.filter(function(element) {
            return element.name !== username;
        });
        this.saveVideos();
    },
    /**
     * Checks for the latest vidoes for the given username and stores it internally. Returns the new videos since the last check
     *
     * @param {string} username
     * @returns {promise} A promise that resolves into {videos: {id: string, link: string}[], newUser: boolean} -> new videos and
     * a boolean signifying if it is the first check for the given username or not
     */
    getLatestVideos: function(username) {
        var def = q.defer();
        var self = this;
        var userObject;
        var newUser = !this.latestVideos.some(function(element) {
            userObject = element;
            return element.name === username;
        });

        if(newUser) {
            userObject = {
                name: username,
                videos: []
            };
        }

        this.fetcher.fetchVideosForUser(username).then(
            function success (data) {
                // filter so we only have vids left that arnt in our internal list already
                var newVids = data.filter(function(newVid) {

                    //don't include in the filtered array if any video we already know about has an identical ID
                    return !userObject.videos.some(function(element) {
                        return element.id === newVid.id;
                    });
                });

                //set the videos list to the new list
                userObject.videos = data;

                if(newUser) {
                    self.latestVideos.push(userObject);
                }

                self.saveVideos();

                //return the new ones to the callee
                def.resolve({
                    videos: newVids,
                    newUser: newUser
                });
            },
            function fail(err) {
                def.reject(err);
            }
        );

        return def.promise;
    },
    get: function() {
        return this.latestVideos;
    }
};


module.exports = LatestVideos;