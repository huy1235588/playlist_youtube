const youtubeService = require('../services/youtubeService');

const { VideoModel, ChannelModel, PlaylistModel } = require('../models/videoModel');

const fetchAndSaveVideos = async (req, res) => {
    try {
        // Khởi tạo đối tượng 
        const videoModel = new VideoModel();
        const channelModel = new ChannelModel();
        const playlistModel = new PlaylistModel();

        // Lấy playlistId từ input
        let playlistId = req.query.inputValue; 
        // Format playlistId
        playlistId = playlistId.split("?list=")[1];

        // Lấy playlistId, videoId, addAt, indexVideo của toàn bộ videos
        const playlistItems = await youtubeService.getPlaylistVideos(playlistId);

        for (const item of playlistItems.items){
            // Lấy thông tin chi tiết của video
            const video = await youtubeService.getVideoDetails(item.videoId, playlistId);
            // Lưu video vào database
            videoModel.add(video);

            const channelId = video.channelId;

            //  Kiểm tra xem có tồn tại channelId
            if (channelId) {
                // Lấy thông tin chi tiết của channel
                const channel = await youtubeService.getChannelDetails(video.channelId);
                // Lưu channel vào database
                channelModel.add(channel);
            }
        }

        // Lấy thông tin chi tiết của playlist
        const playlist = await youtubeService.getPlaylistDetails(playlistId);

        // Lưu các playlist vào bảng playlists
        playlistModel.add(playlist);

        res.status(200).json({ message: 'Videos fetched and saved successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching or saving videos', error });
        console.error('Error when fetching content:', error);
    }
}

module.exports = {
    fetchAndSaveVideos
};
