// Description:
//   Youtube Feeds
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
//// Commands:
//   hubot yf add <username>
//   hubot yf remove <username>
//   hubot yf list
//
// Author:
//   Eluinhost

module.exports = function(robot) {

    var notifcations = getNotifications();

    /**
     * @returns {Array} list of all saved notifications
     */
    function getNotifications() {
        var list = robot.brain.get('youtube-feed.notifications');
        return list || [];
    }

    /**
     * @param user
     * @param channel
     * @constructor
     */
    function YoutubeNotification(user, channel) {
        this.user = user;
        this.channel = channel;
    }

    /**
     * @param id
     * @param link
     * @constructor
     */
    function YoutubeVideo(id, link) {
        this.id = id;
        this.link = link;
    }

    /**
     * @param {String} user
     * @returns {YoutubeVideo[]}
     */
    function getYoutubeVideos(user) {
        robot.http('https://gdata.youtube.com/feeds/api/users/' + user + '/uploads?alt=json')
            .header('Accept', 'application/json')
            .get(function (err, res, body) {
                if (err) return;
                var videos = [];
                JSON.parse(body).feed.entry.forEach(function(element) {
                    videos.push(new YoutubeVideo(element.id, element.link[0]));
                });
                return videos;
            });
    }

    function saveNotifications() {
        robot.brain.set('youtube-feed.users', notifcations);
    }

    /**
     * @param {YoutubeNotification} not
     * @return {bool} true if added, false if was already in list
     */
    function addNotification(not) {
        // TODO check if notification is already in list
        notifcations.push(user);
        saveNotifications();
        return true;
    }

    /**
     * @param {YoutubeNotification} not
     * @return {bool} true if removed, false if not in list
     */
    function removeNotification(not) {
        //TODO remove the notification
        saveNotifications();
        return true;
    }

    /**
     * @param {YoutubeNotification} not
     */
    function checkForNewVideos(not) {
        var videos = getYoutubeVideos(not.user);

        //TODO check against last version and send messages for new videos
    }

    function checkAll() {
        notifcations.forEach(checkForNewVideos);
    }

    robot.respond(/yf add(.*?)$/i, function(msg) {
        var name = msg.match[1];
        if(addNotification(new YoutubeNotification(name, msg.room))) {
            msg.reply('Added notifications for: ' + name);
        } else {
            msg.reply(name + ' is already set for notifications in this channel');
        }
    });

    robot.respond(/yf remove(.*?)$/i, function(msg) {
        var name = msg.match[1];
        if(removeNotification(new YoutubeNotification(name, msg.room))) {
            msg.reply('Removed notifications for: ' + name);
        } else {
            msg.reply(name + ' is not set for notifications in this channel');
        }
    });

    robot.respond(/yf list$/i, function(msg) {
        if(notifcations.length === 0) {
            msg.reply('No notifications set for this channel');
            return;
        }
        var userList = notifcations.map(function(element) {
            return element.user;
        }).join(', ');

        msg.reply('Notifications for: ' + userList);
    });
};