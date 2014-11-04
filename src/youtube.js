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

    var notificationList = require('./lib/notification-list.js')(robot.brain);
    var videoFetcher = require('./lib/video-fetcher.js')(robot);


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