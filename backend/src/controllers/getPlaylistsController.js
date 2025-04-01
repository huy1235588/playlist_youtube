const { QueryModel } = require('../models/queryModel');

class PlaylistsController {
    // Lấy tất cả các playlist từ database
    static async getPlaylists(req, res) {
        try {
            // Khởi tạo đối tượng
            const queryModel = new QueryModel();

            // Lấy video từ database
            const playlists = await queryModel.getPlaylists();

            // Trả về giá trị
            res.json({
                playlists
            });

        } catch (error) {
            res.status(500).json({ message: 'Error getting playlist', error });
            console.error('Error when getting playlist:', error);
        }
    }

    // Lấy playlist theo id
    static async getPlaylistById(req, res) {
        try {
            const { playlistId } = req.params;

            // Khởi tạo đối tượng
            const queryModel = new QueryModel();

            // Lấy playlist theo playlistId từ database
            const playlist = await queryModel.getPlaylist(playlistId);

            if (!playlist) {
                return res.status(404).json({ message: 'Playlist not found' });
            }

            // Trả về giá trị
            res.json({
                playlist
            });

        } catch (error) {
            res.status(500).json({ message: 'Error getting playlist by ID', error });
            console.error('Error when getting playlist by ID:', error);
        }
    }
}

module.exports = PlaylistsController;