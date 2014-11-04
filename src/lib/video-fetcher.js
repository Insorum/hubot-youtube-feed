var q = require('q');

module.exports = function VideoFetcher(robot) {

    /**
     * Fetches latest video list for the given user
     * @param {string} username - The account to check
     * @returns {promise} promise that resolves to {id: string, link: string}[], a list of id's and links for each video
     */
    var fetchVideosForUser = function(username) {
        var result = q.defer();
        robot.http('https://gdata.youtube.com/feeds/api/users/' + username + '/uploads?alt=json')
            .header('Accept', 'application/json')
            .get(function (err, res, body) {
                if (err) {
                    result.reject(err);
                    return;
                }
                var videos = [];
                JSON.parse(body).feed.entry.forEach(function(element) {
                    videos.push({
                        id: element.id,
                        link: element.link[0]
                    });
                });
                result.resolve(videos);
            });
        return result.promise;
    };

    return {
        fetchVideosForUser: fetchVideosForUser
    }
};