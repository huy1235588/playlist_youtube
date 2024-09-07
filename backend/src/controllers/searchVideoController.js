const searchVideoTitle = async (req, res) => {
    const { QueryModel } = require('../models/queryModel');
    try {
        // Khởi tạo đối tượng
        const queryModel = new QueryModel();

        // Lấy video từ datbase
        const videos = await queryModel.searchVideo(
            req.query.input,
            req.query.playlistId,
        )

        // Trả về giá trị
        res.json({
            videos
        })

    } catch (error) {
        res.status(500).json({ message: 'Error getting video', error });
        console.error('Error when getting content:', error);
    }
}

module.exports = {
    searchVideoTitle
};