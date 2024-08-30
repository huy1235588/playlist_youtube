
const sql = require('mssql');
const { sqlConfig } = require('../config/db');

// Hàm lưu vào bảng channels
const addChannel = async (channel) => {
    let pool;
    try {
        // Kết nối đến SQL Server
        pool = await sql.connect(sqlConfig);
        const request = pool.request();

        // Biến iểm tra đã tồn tại ChannelId trong database
        const existingChannel = await request
            .input('CheckChannelId', sql.VarChar(50), channel.channelId)
            .query(`SELECT COUNT(*) AS Count FROM Channels WHERE ChannelId = @CheckChannelId`);

        // Nếu đã tồn tại, bỏ qua thao tác chèn.
        if (existingChannel.recordset[0].Count === 0) {
            // Chèn dữ liệu vào bảng
            const result = await request
                .input('ChannelId', sql.VarChar(50), channel.channelId)
                .input('Title', sql.NVarChar(255), channel.title)
                .input('Thumbnail', sql.NVarChar(255), channel.thumbnails)
                .input('SubscriberCount', sql.Int, channel.subscriberCount)
                .input('VideoCount', sql.Int, channel.videoCount)
                .query(
                    `INSERT INTO Channels
                VALUES (@ChannelId, @Title, @Thumbnail, @SubscriberCount, @VideoCount)`,
                );
        }

    } catch (error) {
        throw new Error(`Error saving to SQL Server: ${error.message}`);
    } finally {
        // Đóng kết nối khi không còn cần thiết
        if (pool && pool.close) {
            await pool.close();
        }
    }
};

// Hàm lưu dũ liệu vào bảng videos
const addVideo = async (video) => {
    let pool;
    try {
        // Kết nối đến SQL Server
        pool = await sql.connect(sqlConfig);
        const request = pool.request();

        // Chèn dữ liệu vào bảng
        const result = await request
            .input('VideoId', sql.VarChar(50), video.videoId)
            .input('Title', sql.NVarChar(255), video.title)
            .input('PublishedAt', sql.DateTime, new Date(video.publishedAt).toISOString().slice(0, 19).replace('T', ' '))
            .input('Thumbnail', sql.NVarChar(255), video.thumbnails)
            .input('ViewCount', sql.BigInt, video.viewCount)
            .input('Duration', sql.VarChar(20), video.duration)
            .input('AddAt', sql.DateTime, new Date(video.addAt).toISOString().slice(0, 19).replace('T', ' '))
            .input('ChannelId', sql.NVarChar(50), video.channelId)
            .input('PlaylistId', sql.VarChar(50), video.playlistId)
            .query(
                `INSERT INTO Videos
                VALUES (@VideoId, @Title, @PublishedAt, @Thumbnail, @ViewCount, @Duration, @AddAt, @ChannelId, @PlaylistId)`,
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

// Hàm lưu vào bảng playlists
const addPlaylist = async (playlist) => {
    let pool;
    try {
        // Kết nối đến SQL Server
        pool = await sql.connect(sqlConfig);
        const request = pool.request();

        // Chèn dữ liệu vào bảng
        const result = await request
            .input('PlaylistId', sql.VarChar(50), playlist.playlistId)
            .input('Title', sql.NVarChar(255), playlist.title)
            .input('PublishedAt', sql.DateTime, new Date(playlist.publishedAt).toISOString().slice(0, 19).replace('T', ' '))
            .input('Thumbnails', sql.NVarChar(255), playlist.thumbnails)
            .input('ChannelTitle', sql.NVarChar(255), playlist.channelTitle)
            .query(
                `INSERT INTO Playlists
                VALUES (@PlaylistId, @Title, @PublishedAt, @Thumbnails, @ChannelTitle)`,
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
    addChannel,
    addVideo,
    addPlaylist,
};