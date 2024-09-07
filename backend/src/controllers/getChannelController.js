const getChannel = async (req, res) => {
    const { QueryModel } = require('../models/queryModel');
    try {
        // Khởi tạo đối tượng
        const queryModel = new QueryModel();

        const channelId = req.query.channelId;

        // Lấy video từ datbase
        const channel = await queryModel.getChannel(channelId);

        // Trả về giá trị
        res.json({
            channel
        })

    } catch (error) {
        res.status(500).json({ message: 'Error getting playlist', error });
        console.error('Error when getting playlist:', error);
    }
}

module.exports = {
    getChannel,
};