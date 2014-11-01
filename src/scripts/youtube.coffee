# Description:
#   Youtube Feeds
#
# Dependencies:
#   None
#
# Configuration:
#   None
#
## Commands:
#   hubot yf add <username>
#   hubot yf remove <username>
#   hubot yf list
#
# Author:
#   Eluinhost

module.exports = (robot) ->

  robot.respond /yf add (.*?)$/i, (msg) ->
    # do stuff

  robot.respond /yf remove (.*?)$/i, (msg) ->
    # do stuff

  robot.respond /yf list$/i, (msg) ->
    # do stuff