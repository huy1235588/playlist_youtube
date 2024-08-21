
const sql = require('mssql');
const { poolPromise } = require('../config/db');

// Hàm lưu dũ liệu vào database
const addVideo = async (video) => {
    try {
        // Kết nối đến SQL Server
        const pool = await poolPromise;
        const request = new pool.Request();

        // Chèn dữ liệu vào bảng
        const result = await request
            .input('VideoID', sql.NVarChar(50), video.VideoID)
            .input('Title', sql.NVarChar(255), video.Title)
            .input('ChannelID', sql.NVarChar(255), video.ChannelID)
            .input('ChannelTitle', sql.NVarChar(255), video.ChannelTitle)
            .input('PublishedAt', sql.DateTime, new Date(video.PublishedAt))
            .input('Thumbnail', sql.NVarChar(255), video.Thumbnail)
            .input('ThumbnailsMaxRes', sql.NVarChar(255), video.ThumbnailsMaxRes)
            .query(
                `INSERT INTO Video VALUES (@VideoID, @Title, @ChannelID, @ChannelTitle, @PublishedAt, @Thumbnail, @ThumbnailsMaxRes)`,
            );

        // Trả về true nếu ít nhất một hàng đã được chèn
        return result.rowAffected[0] > 0;

    } catch (error) {
        throw new Error(`Error saving to SQL Server: ${error.message}`);
    } finally {
        sql.close();
    }
};

module.exports = {
    addVideo
};