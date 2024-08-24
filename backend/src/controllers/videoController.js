
const youtubeService = require('../services/youtubeService');
const videoModel = require('../models/videoModel');

const fetchAndSaveVideos = async (req, res) => {
    try {
        const playlistId = req.query.inputValue; // Lấy playlistId từ input
        console.log(playlistId);

        const ha = playlistId + " ha"

        res.json( ha );

        // const playlistVideos = await youtubeService.getPlaylistVideos(playlistId.split("?list=")[1]);

        // // Lưu các video vào database
        // for (const video of playlistVideos) {
        //     await videoModel.addVideo(video);
        // }

        // res.status(200).json({ message: 'Videos fetched and saved successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching or saving videos', error });
        console.error('Error when fetching content:', error);
    }
}

module.exports = {
    fetchAndSaveVideos
};
