const getVideoInfo = async (req, res) => {
    const { QueryModel } = require('../models/queryModel');
    try {
        // Khởi tạo đối tượng
        const queryModel = new QueryModel();

        // Lấy video từ datbase
        const videos = await queryModel.select50VideoBySortColumn(
            req.query.PageNumber,
            req.query.PageSize,
            req.query.column,
            req.query.order,
            req.query.playlistId,
            res,
        )

    } catch (error) {
        res.status(500).json({ message: 'Error getting video', error });
        console.error('Error when getting content:', error);
    }
}

module.exports = {
    getVideoInfo,
};