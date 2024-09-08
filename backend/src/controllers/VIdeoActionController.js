const deleteVideo = async (req, res) => {
    const { DeleteModel } = require('../models/deleteModel');
    const { QueryModel } = require('../models/queryModel');
    try {
        // Khởi tạo đối tượng truy vấn
        const queryModel = new QueryModel();
        const deleteModel = new DeleteModel();

        // Lấy videoId từ input
        let videoId = req.query.videoId;

        // Kiểm tra xem có tồn tại videoId
        if (queryModel.checkExistingVideoId(videoId)) {
            return await res.json({
                isDeleted: false,
                message: 'VideoId does not exist'
            });
        }

        deleteModel.deleteByVideoId(videoId);

        return await res.json({
            isDeleted: true,
            message: 'Video deleted from Database'
        });

    } catch (error) {
        res.status(500).json({ message: 'Error deleting video', error });
        console.error('Error when deleting video:', error);
    }
}

module.exports = {
    deleteVideo
};
