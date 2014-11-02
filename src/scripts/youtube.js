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

    robot.respond(/yf add(.*?)$/i, function(msg) {
        var name = msg.match[1];
    });

    robot.respond(/yf remove(.*?)$/i, function(msg) {
        var name = msg.match[1];
    });

    robot.respond(/yf list$/i, function(msg) {
        var name = msg.match[1];
    });
};