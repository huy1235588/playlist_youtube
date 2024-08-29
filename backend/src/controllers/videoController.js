
const youtubeService = require('../services/youtubeService');
const videoModel = require('../models/videoModel');

const fetchAndSaveVideos = async (req, res) => {
    try {
        const playlistId = req.query.inputValue; // Lấy playlistId từ input

        const { channels, videos, playlists } = await youtubeService.getPlaylistVideos(playlistId.split("?list=")[1]);

        // Lưu các playlist vào bảng playlists
        await videoModel.addPlaylist(playlists);

        // Lưu các channel vào bảng channels
        for (const channel of channels) {
            await videoModel.addChannel(channel);
        }

        // Lưu các video vào bảng videos
        for (const video of videos) {
            await videoModel.addVideo(video);
        }

        res.status(200).json({ message: 'Videos fetched and saved successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching or saving videos', error });
        console.error('Error when fetching content:', error);
    }
}

module.exports = {
    fetchAndSaveVideos
};
