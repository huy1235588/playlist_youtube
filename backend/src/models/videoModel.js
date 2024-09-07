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

            // Biến iểm tra đã tồn tại VideoId trong database
            const existingVideo = await request
                .input('CheckVideoId', sql.VarChar(50), video.videoId)
                .query(`SELECT COUNT(*) AS Count FROM Videos WHERE VideoId = @CheckVideoId`);

            // Nếu đã tồn tại, bỏ qua thao tác chèn.
            if (existingVideo.recordset[0].Count === 0) {
                // Chèn dữ liệu vào bảng
                await request
                    .input('VideoId', sql.VarChar(50), video.videoId)
                    .input('Title', sql.NVarChar(255), video.title)
                    .input('PublishedAt', sql.DateTime, new Date(video.publishedAt).toISOString().slice(0, 19).replace('T', ' '))
                    .input('Thumbnail', sql.NVarChar(255), video.thumbnails)
                    .input('ViewCount', sql.BigInt, video.viewCount)
                    .input('Duration', sql.VarChar(20), video.duration)
                    .input('ChannelId', sql.NVarChar(50), video.channelId)
                    .query(
                        `INSERT INTO Videos VALUES 
                    (@VideoId, @Title, @PublishedAt, @Thumbnail, @ViewCount, @Duration, @ChannelId)`,
                    );
            }

        } catch (error) {
            throw new Error(`Error saving to SQL Server ${error.message}`);
        } finally {
            // Đảm bảo kết nối được đóng dù có lỗi xảy ra hay không.
            await this.disconnect();
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
                await request
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
            await request
                .input('PlaylistId', sql.VarChar(50), playlist.playlistId)
                .input('Title', sql.NVarChar(255), playlist.title)
                .input('PublishedAt', sql.DateTime, new Date(playlist.publishedAt).toISOString().slice(0, 19).replace('T', ' '))
                .input('Thumbnails', sql.NVarChar(255), playlist.thumbnails)
                .input('ChannelId', sql.NVarChar(50), playlist.channelId)
                .input('ChannelTitle', sql.NVarChar(255), playlist.channelTitle)
                .input('ItemCount', sql.Int, playlist.itemCount)
                .query(
                    `INSERT INTO Playlists
                    VALUES (@PlaylistId, @Title, @PublishedAt, @Thumbnails, @ChannelId, @ChannelTitle, @ItemCount)`,
                );

        } catch (error) {
            throw new Error(`Error saving to SQL Server: ${error.message}`);
        } finally {
            // Đóng kết nối khi không còn cần thiết
            await this.disconnect();
        }
    }
}

class PlaylistItemsModel {
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
    async add(playlistItems, playlistId, indexVideo) {
        try {
            // Kết nối đến SQL Server
            await this.connect(sqlConfig);
            const request = this.pool.request();

            // Chèn dữ liệu vào bảng
            await request
                .input('Id', sql.VarChar(100), playlistItems.id)
                .input('VideoId', sql.VarChar(50), playlistItems.videoId)
                .input('PlaylistId', sql.VarChar(50), playlistId)
                .input('AddAt', sql.DateTime, new Date(playlistItems.addAt).toISOString().slice(0, 19).replace('T', ' '))
                .input('IndexVideo', sql.Int, indexVideo)
                .query(
                    `INSERT INTO PlaylistItems VALUES 
                    (@Id, @VideoId, @PlaylistId, @AddAt, @IndexVideo)`,
                );

        } catch (error) {
            throw new Error(`Error saving to SQL Server: ${error.message}`);
        } finally {
            // Đảm bảo kết nối được đóng dù có lỗi xảy ra hay không.
            await this.disconnect();
        }

    }
}

module.exports = {
    VideoModel,
    ChannelModel,
    PlaylistModel,
    PlaylistItemsModel,
};