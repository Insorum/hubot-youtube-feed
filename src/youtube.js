// Description:
//   Youtube Feeds
//
// Dependencies:
//   q: ^1.0.1
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
var LatestVideos = require('./lib/latest-videos.js');
var NotificationList = require('./lib/notification-list.js');

module.exports = function(robot) {

    var notificationList;

    robot.brain.on('loaded', function() {
        if(!notificationList) {
            notificationList = new NotificationList(robot.brain, new LatestVideos(robot.brain, new VideoFetcher(robot)));

            checkForUpdates();
            setInterval(checkForUpdates, 1024 * 60 * 5);
        }
    });

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

    robot.respond(/yf add (.*?)$/i, function(msg) {
        var name = msg.match[1];
        if(notificationList.addNotificationsFor(name, msg.message.room)) {
            msg.reply('Added notifications for: ' + name);
        } else {
            msg.reply(name + ' is already set for notifications in this channel');
        }
    });

    robot.respond(/yf remove (.*?)$/i, function(msg) {
        var name = msg.match[1];
        if(notificationList.removeNotificationsFor(name, msg.message.room)) {
            msg.reply('Removed notifications for: ' + name);
        } else {
            msg.reply(name + ' is not set for notifications in this channel');
        }
    });

    robot.respond(/yf list$/i, function(msg) {
        if(notificationList.get().length === 0) {
            msg.reply('No notifications are set for this channel');
            return;
        }
        var userList = notificationList.get().map(function(element) {
            return element.username;
        }).join(', ');

        msg.reply('Notifications for this channel: ' + userList);
    });

    robot.respond(/yf check$/i, function() {
        checkForUpdates();
    });
};