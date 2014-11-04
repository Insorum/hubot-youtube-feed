/**
 * @param brain - the brain to store the list in
 * @constructor
 */
var listKey = 'youtubeFeed.notifyFor';

module.exports = function NotificationList(brain) {
    var notifications = brain.get(listKey);

    /**
     * Saves the notifications to the brain
     */
    var saveNotifications = function() {
        brain.set(listKey, notifications);
    };

    // make sure the data is set if we didn't already have any
    if(notifications === null) {
        notifications = [];
        saveNotifications();
    }

    /**
     * Adds the given username to the list of names for notifications
     *
     * @param {string} username - The account name to check for
     * @param {string} channel - The channel to send the notification to
     * @returns {boolean} true if added, false if already in the list
     */
    var addNotificationsFor = function(username, channel) {
        if(isNotifyingFor(username, channel)) {
            return false;
        }
        notifications.push({
            username: username,
            channel: channel
        });
        saveNotifications();
        return true;
    };

    /**
     * Removes the given username from the list of names for notifications
     *
     * @param {string} username - The account name to check for
     * @param {string} channel - The channel to send notifications to
     * @returns {boolean} true if removed, false if didn't exist
     */
    var removeNotificationsFor = function(username, channel) {
        var index = findIndexOf(username, channel);
        if(index < 0) {
            return false;
        }
        notifications.splice(index, 1);
        saveNotifications();
        return true;
    };

    /**
     * Finds the index of the given notification
     *
     * @param {string} username - The account name to check for
     * @param {string} channel - The channel to send notifcations to
     * @returns {number} index of the notification or -1 if not found
     */
    var findIndexOf = function(username, channel) {
        var foundIndex = -1;
        notifications.some(function(element, index) {
            if(element.username === username && element.channel === channel) {
                foundIndex = index;
                return true;
            }
            return false;
        });
        return foundIndex;
    };

    /**
     * Is the username setup for notifications?
     *
     * @param {string} username - The account name to check for
     * @param {string} channel - The channel to notify in
     * @returns {boolean} true if in list, false otherwise
     */
    var isNotifyingFor = function(username, channel) {
        return findIndexOf(username, channel) > -1;
    };

    return {
        addNotificationsFor: addNotificationsFor,
        removeNotificationsFor: removeNotificationsFor,
        isNotifyingFor: isNotifyingFor,
        notifications: notifications
    }
};

