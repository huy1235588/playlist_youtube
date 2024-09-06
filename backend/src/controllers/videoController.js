const youtubeService = require('../services/youtubeService');

const { VideoModel, ChannelModel, PlaylistModel, PlaylistItemsModel } = require('../models/videoModel');

const fetchAndSaveVideos = async (req, res) => {
    try {
        // Khởi tạo đối tượng 
        const videoModel = new VideoModel();
        const channelModel = new ChannelModel();
        const playlistModel = new PlaylistModel();
        const playlistItemsModel = new PlaylistItemsModel();

        // Lấy playlistId từ input
        let playlistId = req.query.inputValue;
        // Format playlistId
        playlistId = playlistId.split("?list=")[1];

        // Lấy thông tin chi tiết của playlist
        const playlist = await youtubeService.getPlaylistDetails(playlistId);
        // Lưu các playlist vào bảng playlists
        await playlistModel.add(playlist);

        // Lấy playlistId, videoId, addAt, indexVideo của toàn bộ videos
        const playlistItems = await youtubeService.getPlaylistItems(playlistId);

        // Khởi tạo indexVideo
        let indexVideo = playlistItems.totalResults;

        for (const item of playlistItems.items) {
            // Lấy channelId
            const channelId = item.channelId;
            //  Kiểm tra xem có tồn tại channelId
            if (channelId) {
                // Lấy thông tin chi tiết của channel
                const channel = await youtubeService.getChannelDetails(channelId);
                // Lưu channel vào database
                await channelModel.add(channel);
            }

            // Lấy thông tin chi tiết của video
            const video = await youtubeService.getVideoDetails(item.videoId, playlistId);
            // Lưu video vào database
            await videoModel.add(video);

            // Lưu vào bảng PlaylistItems
            playlistItemsModel.add(item, playlistId, indexVideo);
            // Cập nhật indexvideo
            indexVideo -= 1;
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
