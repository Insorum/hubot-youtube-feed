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
            .get()(function (err, res, body) {
                if (err) {
                    result.reject(err);
                    return;
                }

                if(res.statusCode > 400) {
                    result.reject(body);
                    return;
                }

                var parsed;
                try {
                    parsed = JSON.parse(body);
                } catch (e) {
                    result.reject(e);
                }

                var videos = parsed.feed.entry.map(function(element) {
                    return {
                        id: element.id.$t,
                        link: element.link[0].href
                    }
                });

                result.resolve(videos);
            });
        return result.promise;
    };

    return {
        fetchVideosForUser: fetchVideosForUser
    }
};