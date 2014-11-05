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

var VideoFetcher = require('./lib/video-fetcher.js');
var NotificationList = require('./lib/notification-list.js');

module.exports = function(robot) {

    var notificationList = new NotificationList(robot.brain, new VideoFetcher());

    var checkForUpdates = function() {
        notificationList.getNewNotifications().then(function(data) {
            data.forEach(
                /**
                 * @param {Object} element
                 * @param {string} element.username
                 * @param {string} element.channels
                 * @param {{id: string, link: string}[]} element.videos
                 */
                function success(element) {
                    element.videos.forEach(
                        /**
                         * @param {Object} video
                         * @param {string} video.id
                         * @param {string} video.link
                         */
                        function(video) {
                            element.channels.forEach(function(channel) {
                                robot.messageRoom(channel, element.username + ' has uploaded a video: ' + video.link);
                            });
                        }
                    );
                }
            );
        })
    };
    setInterval(checkForUpdates, 1024 * 60 * 5);

    robot.respond(/yf add (.*?)$/i, function(msg) {
        var name = msg.match[1];
        if(notificationList.addNotificationsFor(name, msg.room)) {
            msg.reply('Added notifications for: ' + name);
        } else {
            msg.reply(name + ' is already set for notifications in this channel');
        }
    });

    robot.respond(/yf remove (.*?)$/i, function(msg) {
        var name = msg.match[1];
        if(notificationList.removeNotificationsFor(name, msg.room)) {
            msg.reply('Removed notifications for: ' + name);
        } else {
            msg.reply(name + ' is not set for notifications in this channel');
        }
    });

    robot.respond(/yf list$/i, function(msg) {
        if(notificationList.notifications.length === 0) {
            msg.reply('No notifications are set for this channel');
            return;
        }
        var userList = notificationList.notifications.map(function(element) {
            return element.username;
        }).join(', ');

        msg.reply('Notifications for this channel: ' + userList);
    });
};