const youtubeAction = require('../services/youtubeAction');

const replaceVideoInPlaylist = async (req, res) => {
    const { QueryModel } = require('../models/queryModel');
    try {
        // Khởi tạo đối tượng truy vấn
        const queryModel = new QueryModel();

        // Lấy videoId từ input
        let videoId = req.query.inputValue;

        if (!videoId.includes("youtube.com/watch?v=")) {
            return await res.json({
                isReplaced: false,
                message: 'Incorrect URL video'
            });
        }

        // Format videoId
        videoId = videoId.split("watch?v=")[1];

        // Kiểm tra xem có tồn tại playlistId hay chưa
        const checkVideoId = await queryModel.checkExistingVideoId(videoId)

        if (checkVideoId) {
            return await res.json({
                isReplaced: false,
                message: 'VideoId is already exist',
            });
        }

        // // Xóa video cũ
        // await youtubeAction.deleteVideoFromPlaylist(
        //     req.query.playlistItemId,
        // );

        // // Thêm video mới
        // await youtubeAction.addVideoToPlaylist(
        //     req.query.playlistId,
        //     videoId
        // );

        return await res.json({
            isReplaced: true,
            message: 'Videos fetched and saved successfully'
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching or saving videos', error });
        console.error('Error when fetching content:', error);
    }
}

module.exports = {
    replaceVideoInPlaylist,
}