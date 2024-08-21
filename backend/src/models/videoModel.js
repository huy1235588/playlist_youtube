
const sql = require('mssql');
const { sqlConfig } = require('../config/db');

// Hàm lưu dũ liệu vào database
const addVideo = async (video) => {
    let pool;
    try {
        // Kết nối đến SQL Server
        pool = await sql.connect(sqlConfig);
        const request = pool.request();

        // Chèn dữ liệu vào bảng
        const result = await request
            .input('VideoId', sql.NVarChar(50), video.videoId)
            .input('Title', sql.NVarChar(255), video.title)
            .input('ChannelId', sql.NVarChar(255), video.channelId)
            .input('ChannelTitle', sql.NVarChar(255), video.channelTitle)
            .input('PublishedAt', sql.DateTime, new Date(video.publishedAt).toISOString().slice(0, 19).replace('T', ' '))
            .input('Thumbnail', sql.NVarChar(255), video.thumbnails)
            .query(
                `INSERT INTO Videos
                VALUES (@VideoId, @Title, @ChannelId, @ChannelTitle, @PublishedAt, @Thumbnail)`,
            );

    } catch (error) {
        throw new Error(`Error saving to SQL Server: ${error.message}`);
    } finally {
        // Đóng kết nối khi không còn cần thiết
        if (pool && pool.close) {
            await pool.close();
        }
    }
};

module.exports = {
    addVideo
};