const sql = require('mssql');
const { sqlConfig } = require('../config/db');

class VideoModel {
    constructor() {
        this.pool = null;
    }

    // Tạo kết nối đến SQL Server nếu chưa có
    async connect() {
        if (!this.pool) {
            this.pool = await sql.connect(sqlConfig);
        }
    }

    //  Đóng kết nối khi không còn sử dụng nữa.
    async disconnect() {
        if (this.pool) {
            await this.pool.close();
            this.pool = null;
        }
    }

    // Insert vào bảng
    async add(video) {
        try {
            // Kết nối đến SQL Server
            await this.connect(sqlConfig);
            const request = this.pool.request();

            // Chèn dữ liệu vào bảng
            await request
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
                    `INSERT INTO Videos VALUES 
                    (@VideoId, @Title, @PublishedAt, @Thumbnail, @ViewCount, @Duration, @AddAt, @ChannelId, @PlaylistId)`,
                );

        } catch (error) {
            throw new Error(`Errror saving to SQL Server ${error.message}`);
        } finally {
            // Đảm bảo kết nối được đóng dù có lỗi xảy ra hay không.
            await this.disconnect();
        }

    }

    async select() {
        try {
            await this.connect();
            const request = this.pool.request();

            const result = await request
                .query(`SELECT * 
                        FROM Display50Video`
                );

            // Trả về đối tượng các cột đã chọn
            return result.recordset[0];
        } catch (error) {

        }
    }
}

class ChannelModel {
    constructor() {
        this.pool = null;
    }

    // Tạo kết nối đến SQL Server nếu chưa có
    async connect() {
        if (!this.pool) {
            this.pool = await sql.connect(sqlConfig);
        }
    }

    //  Đóng kết nối khi không còn sử dụng nữa.
    async disconnect() {
        if (this.pool) {
            await this.pool.close();
            this.pool = null;
        }
    }

    // Insert vào bảng
    async add(channel) {
        try {
            // Kết nối đến SQL Server
            await this.connect();
            const request = this.pool.request();

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
            await this.disconnect();
        }
    }

    async select() {
        try {
            await this.connect();
            const request = this.pool.request();

            const result = await request
                .query(`select ChannelId, Title
                        from Channels`
                );

            // Trả về đối tượng các cột đã chọn
            return result.recordset[0];
        } catch (error) {

        }
    }
}

class PlaylistModel {
    constructor() {
        this.pool = null;
    }

    // Tạo kết nối đến SQL Server nếu chưa có
    async connect() {
        if (!this.pool) {
            this.pool = await sql.connect(sqlConfig);
        }
    }

    //  Đóng kết nối khi không còn sử dụng nữa.
    async disconnect() {
        if (this.pool) {
            await this.pool.close();
            this.pool = null;
        }
    }

    // Insert vào bảng
    async add(playlist) {
        try {
            await this.connect();
            const request = this.pool.request();

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
            await this.disconnect();
        }
    }
}

module.exports = {
    VideoModel,
    ChannelModel,
    PlaylistModel,
};