const youtubeService = require('../services/youtubeService');

const { VideoModel, ChannelModel, PlaylistModel } = require('../models/videoModel');

const fetchAndSaveVideos = async (req, res) => {
    try {
        // Khởi tạo đối tượng 
        const videoModel = new VideoModel();
        const channelModel = new ChannelModel();
        const playlistModel = new PlaylistModel();

        const playlistId = req.query.inputValue; // Lấy playlistId từ input

        const { channels, videos, playlists } = await youtubeService.getPlaylistVideos(playlistId.split("?list=")[1]);

        // Lưu các playlist vào bảng playlists
        playlistModel.add(playlists);

        // Lưu các channel vào bảng channels
        for (const channel of channels) {
            channelModel.add(channel);
        }

        // Lưu các video vào bảng videos
        for (const video of videos) {
            videoModel.add(video);
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
