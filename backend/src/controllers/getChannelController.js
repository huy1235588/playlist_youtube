const getChannelPlaylists = async (req, res) => {
    const { QueryModel } = require('../models/queryModel');
    try {
        // Khởi tạo đối tượng
        const queryModel = new QueryModel();

        // Lấy video từ datbase
        const channelPlaylists = await queryModel.getChannelPlaylists();

        // Trả về giá trị
        res.json({
            channelPlaylists
        })

    } catch (error) {
        res.status(500).json({ message: 'Error getting playlist', error });
        console.error('Error when getting playlist:', error);
    }
}

module.exports = {
    getChannelPlaylists,
};