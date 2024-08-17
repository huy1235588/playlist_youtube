
const youtubeService = require('../services/youtubeService');
const videoService = require('../services/videoService');

const fetchAndSaveVideos = async (req, res) => {
    try {
        const { playlistID } = req.body; // Lấy playlistID từ request body
        const videos = await youtubeService.getPlaylistVideos(playlistID);

        // Lưu các video vào database
        const savedVideos = await videoService.savedVideos(videos);
        res.status(201).json(savedVideos);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching or saving videos', error });
    }
}

module.exports = {
    fetchAndSaveVideos
};
