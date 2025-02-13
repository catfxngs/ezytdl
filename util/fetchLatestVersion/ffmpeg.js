let latest = null;

module.exports = () => {
    if(latest) {
        return Promise.resolve(latest)
    } else {
        latest = require(`../githubReleasesRequest`)(`BtbN`, `FFmpeg-Builds`);
        return latest;
    }
}