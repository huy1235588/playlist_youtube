const getPlaylists = async (req, res) => {
    const { QueryModel } = require('../models/queryModel');
    try {
        // Khởi tạo đối tượng
        const queryModel = new QueryModel();

        // Lấy video từ datbase
        const playlists = await queryModel.getPlaylists();

        // Trả về giá trị
        res.json({
            playlists
        })

    } catch (error) {
        res.status(500).json({ message: 'Error getting playlist', error });
        console.error('Error when getting playlist:', error);
    }
}

// Lấy playlist by playlistId
const getPlaylistById = async (req, res) => {
    const { QueryModel } = require('../models/queryModel');

    try {
        // Khởi tạo đối tượng
        const queryModel = new QueryModel();

        // Lấy playlist by playlistId
        const playlist = await queryModel.getPlaylistById(req.params.playlistId);

        // Trả về giá trị
        res.json({
            playlist
        })

    } catch (error) {
        res.status(500).json({ message: 'Error getting playlist', error });
        console.error('Error when getting playlist:', error);
    }
}

module.exports = {
    getPlaylists,
    getPlaylistById,
};