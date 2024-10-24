const sql = require('mssql');
const { sqlConfig } = require('../config/db');

class QueryModel {
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

    // Selct 50 Video đầu tiên theo thứ tự thêm vào 
    async select50VideoBySortColumn(PageNumber, PageSize, column, order, playlistId, res) {
        try {
            await this.connect();
            const request = this.pool.request();

            // Chọn dữ liệu từ procedure Display50Video
            const result = await request
                .input('PageNumber', sql.Int, PageNumber)
                .input('PageSize', sql.Int, PageSize)
                .input('column', sql.VarChar, column)
                .input('order', sql.VarChar, order)
                .input('playlistId', sql.VarChar, playlistId)
                .query(`exec [Get 50 Videos By Sort Column] @PageNumber, @PageSize, @column, @order, @playlistId`);

            // Trả về dữ liệu nếu có
            if (result.recordset.length > 0) {
                // Trả về dữ liệu
                res.json({
                    videos: result.recordset,
                    isOverVideo: result.recordsets[1][0].NoMoreVideos,
                });
            } else {
                res.json({ message: 'Videos not found' });
            }

        } catch (error) {
            throw new Error(`Error querying SQL Server ${error.message}`);
        } finally {
            // Đảm bảo kết nối được đóng dù có lỗi xảy ra hay không.
            await this.disconnect();
        }
    }

    // Tìm video theo tên
    async searchVideo(input, playlistId) {
        try {
            await this.connect();
            const request = this.pool.request();

            // Chọn dữ liệu từ procedure Display50Video
            const result = await request
                .input('input', sql.VarChar, input)
                .input('playlistId', sql.VarChar(50), playlistId)
                .query(`exec [Search 50 Videos By TitleVideo] @input, @playlistId`);

            // Trả về dữ liệu nếu có
            return result.recordset;

        } catch (error) {
            throw new Error(`Error search Video from SQL Server ${error.message}`);
        } finally {
            await this.disconnect();
        }
    }

    // Select các video bị lỗi
    async selectHiddenVideo(playlistId) {
        try {
            await this.connect();
            const request = this.pool.request();

            // Chọn dữ liệu từ bảng Video nhưng lọc các cột Title = null
            const result = await request
                .query(`exec [Get Hidden Video Procedure] ${playlistId}`);

            // Trả về dữ liệu
            return result.recordset;

        } catch (error) {
            throw new Error(`Error while select hidden video: ${error.message}`);
        } finally {
            await this.disconnect();
        }
    }

    // Select playlist
    async getPlaylists() {
        try {
            // Kết nối đến SQL Server
            await this.connect();
            const request = this.pool.request();

            const result = await request
                .query(`SELECT * FROM Playlists`);

            // Trả về dữ liệu
            return result.recordset;

        } catch (error) {
            throw new Error(`Error getting playlists in SQL Server: ${error.message}`);
        } finally {
            // Đóng kết nối khi không còn cần thiết
            await this.disconnect();
        }
    }

    // Select channel playlist
    async getChannel(ChannelId) {
        try {
            // Kết nối đến SQL Server
            await this.connect();
            const request = this.pool.request();

            const result = await request
                .query(`exec [Get Channel by ChannelId] ${ChannelId}`);

            // Trả về dữ liệu
            return result.recordset;

        } catch (error) {
            throw new Error(`Error getting playlists in SQL Server: ${error.message}`);
        } finally {
            // Đóng kết nối khi không còn cần thiết
            await this.disconnect();
        }
    }

    // Kiểm tra videoId trong bảng Playlist
    async checkExistingVideoId(VideoId) {
        try {
            // Kết nối đến SQL Server
            await this.connect();
            const request = this.pool.request();

            // Biến iểm tra đã tồn tại PlaylistId trong database
            const existingChannel = await request
                .input('CheckVideoId', sql.VarChar(50), VideoId)
                .query(`SELECT COUNT(*) AS Count FROM Videos WHERE VideoId = @CheckVideoId`);

            // Nếu đã tồn tại, thì return true
            if (existingChannel.recordset[0].Count === 0) {
                return false;
            }
            else {
                return true;
            }

        } catch (error) {
            throw new Error(`Error checking playlists in SQL Server: ${error.message}`);
        } finally {
            // Đóng kết nối khi không còn cần thiết
            await this.disconnect();
        }
    }

    // Kiểm tra PlaylistId trong bảng Playlist
    async checkExistingPlaylist(PlaylistId) {
        try {
            // Kết nối đến SQL Server
            await this.connect();
            const request = this.pool.request();

            // Biến iểm tra đã tồn tại PlaylistId trong database
            const existingChannel = await request
                .input('CheckPlaylistId', sql.VarChar(50), PlaylistId)
                .query(`SELECT COUNT(*) AS Count FROM Playlists WHERE PlaylistId = @CheckPlaylistId`);

            // Nếu đã tồn tại, thì return true
            if (existingChannel.recordset[0].Count === 0) {
                return false;
            }
            else {
                return true;
            }

        } catch (error) {
            throw new Error(`Error checking playlists in SQL Server: ${error.message}`);
        } finally {
            // Đóng kết nối khi không còn cần thiết
            await this.disconnect();
        }
    }
}

module.exports = {
    QueryModel
}