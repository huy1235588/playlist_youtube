const { QueryModel } = require('../models/queryModel');

const getVideoInfo = async (req, res) => {
    try {
        // Khởi tạo đối tượng
        const queryModel = new QueryModel();

        // Lấy video từ datbase
        const videos = await queryModel.select50VideoBySortColumn(
            req.query.start,
            req.query.end,
            req.query.column,
            req.query.order
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
    getVideoInfo
};