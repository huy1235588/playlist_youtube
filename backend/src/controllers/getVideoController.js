const { QueryModel } = require('../models/queryModel');

const getVideoInfo = async (req, res) => {
    try {
        // Khởi tạo đối tượng
        const queryModel = new QueryModel();

        // Lấy video từ datbase
        const videos = await queryModel.select50Video()

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
    getVideoInfo
};