const youtubeAction = require('../services/youtubeAction');

const replaceVideoInPlaylist = async (req, res) => {
    // Xóa video cũ
    await youtubeAction.deleteVideoFromPlaylist(
        req.query.playlistItemId,
    );
    // Thêm video mới
    await youtubeAction.addVideoToPlaylist(
        req.query.playlistId,
        req.query.videoId,
    );
}

module.exports = {
    replaceVideoInPlaylist,
}