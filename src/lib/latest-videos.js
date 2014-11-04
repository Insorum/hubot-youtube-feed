var q = require('q');
var listKey = 'youtubeFeed.latestVideos';

/**
 * Keeps track of the latest videos for youtubers
 *
 * @param brain - The brain to store data in
 * @param fetcher - The fetcher to use to fetch the data
 * @constructor
 */
module.exports = function LatestVideos(brain, fetcher) {
    var latestVideos = brain.get(listKey);

    /**
     * Saves the latest videos to the brain
     */
    var saveVideos = function() {
        brain.set(listKey, latestVideos);
    };

    // make sure the data is set if we didn't already have any
    if(latestVideos === null) {
        latestVideos = [];
        saveVideos();
    }

    return {
        /**
         * @returns {string[]} list of all the usernames we have videos for
         */
        getUserList: function() {
            return latestVideos.map(function(element) {
                return element.name;
            });
        },
        removeUser: function(username) {
            latestVideos = latestVideos.filter(function(element) {
                return element.name !== username;
            });
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
            var userObject;
            var newUser = !latestVideos.some(function(element) {
                userObject = element;
                return element.name === username;
            });

            if(newUser) {
                userObject = {
                    name: username,
                    videos: []
                };
            }

            fetcher.fetchVideosForUser(username).then(
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
                        latestVideos.push(userObject);
                    }

                    saveVideos();

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
            return latestVideos;
        }
    };
};