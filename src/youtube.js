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