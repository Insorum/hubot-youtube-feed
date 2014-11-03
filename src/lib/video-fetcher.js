module.exports = function VideoFetcher(robot) {

    /**
     * Fetches latest video list for the given user
     * @param {string} username - The account to check
     * @returns {{id: string, link: string}[]} list of id's and links for each video
     */
    var fetchVideosForUser = function(username) {
        robot.http('https://gdata.youtube.com/feeds/api/users/' + username + '/uploads?alt=json')
            .header('Accept', 'application/json')
            .get(function (err, res, body) {
                if (err) return;
                var videos = [];
                JSON.parse(body).feed.entry.forEach(function(element) {
                    videos.push({
                        id: element.id,
                        link: element.link[0]
                    });
                });
                return videos;
            });
    };

    return {
        fetchVideosForUser: fetchVideosForUser
    }
};