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

module.exports = {
    getPlaylists,
};