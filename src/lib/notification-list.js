var listKey = 'youtubeFeed.notifyFor';
var q = require('q');

/**
 * @param brain - the brain to store the list in
 * @param {LatestVideos} latestVideos - keeps track of the latest videos for users
 * @constructor
 */
function NotificationList(brain, latestVideos) {
    this.brain = brain;
    this.latestVideos = latestVideos;

    this.saveNotifications = function () {
        this.brain.set(listKey, this.notifications);
    };

    /** @type {{username: string, channels: string[]}[]} notifications */
    this.notifications = brain.get(listKey);

    // make sure the data is set if we didn't already have any
    if (this.notifications === null) {
        this.notifications = [];
        this.saveNotifications();
    }
}

NotificationList.prototype = {
    /**
     * Adds the given username to the list of names for notifications
     *
     * @param {string} username - The account name to check for
     * @param {string} channel - The channel to send the notification to
     * @returns {boolean} true if added, false if already in the list
     */
    addNotificationsFor: function (username, channel) {
        var userChannels = this.getUserNotifications(username);

        // if the user doesn't already have an entry add one
        if (userChannels === null) {
            userChannels = [];

            // update the user to add them to the latest videos list
            this.latestVideos.getLatestVideos(username);

            this.notifications.push({
                username: username,
                channels: userChannels
            });
        }

        // dont allow duplicate channel names
        if (userChannels.indexOf(channel) !== -1) {
            return false;
        }

        // add the channel to the user and save data
        userChannels.push(channel);
        this.saveNotifications();
        return true;
    },

    /**
     * Removes the given username from the list of names for notifications
     *
     * @param {string} username - The account name to check for
     * @param {string} channel - The channel to send notifications to
     * @returns {boolean} true if removed, false if didn't exist
     */
    removeNotificationsFor: function (username, channel) {
        var userChannels = this.getUserNotifications(username);

        // dont remove if they dont exist
        if (userChannels === null) {
            return false;
        }

        var index = userChannels.indexOf(channel);

        // dont remove if the channel doesnt exist
        if (index < 0) {
            return false;
        }

        // remove the channel
        userChannels.splice(index, 1);

        //if no channels left remove the entire user
        if (userChannels.length === 0) {
            var userIndex = -1;
            this.notifications.some(function (element, index) {
                if (element.username === username) {
                    userIndex = index;
                    return true;
                }
                return false;
            });
            this.notifications.splice(userIndex, 1);
            this.latestVideos.removeUser(username);
        }

        // save the new data
        this.saveNotifications();
        return true;
    },
    /**
     * Is the username setup for notifications?
     *
     * @param {string} username - The account name to check for
     * @param {string} channel - The channel to notify in
     * @returns {boolean} true if in list, false otherwise
     */
    isNotifyingFor: function (username, channel) {
        var list = this.getUserNotifications(username);
        // if we are not tracking the user there is no notifications
        if (list === null) {
            return false;
        }

        // return if the channel is in the users list
        return list.indexOf(channel) >= 0;
    },
    /**
     * Returns a list of channels the user is notifying for or null if not found
     *
     * @param {string} username
     * @returns {string[]|null}
     */
    getUserNotifications: function (username) {
        var channels = null;
        // get the user's object
        this.notifications.some(function (element) {
            if (element.username === username) {
                channels = element.channels;
                return true;
            }
            return false;
        });
        return channels;
    },
    /**
     * @returns {Q.promise} resolves to [{username: string, channels: string[], videos: {id: string, link: string}}]
     */
    getNewNotifications: function() {
        var promises = [];
        var notifications = [];
        var self = this;
        this.notifications.forEach(function(element) {

            var promise = self.latestVideos.getLatestVideos(element.username);
            promise.then(
                function(data) {
                    //skip if for some reason it is a first check
                    if(data.newUser) return;

                    notifications.push({
                        username: element.username,
                        channels: element.channels,
                        videos: data.videos
                    });
                }
            );

            // add promise to the list of promises to wait for
            promises.push(promise);
        });

        return q.allSettled(promises);
    }
};


module.exports = NotificationList;