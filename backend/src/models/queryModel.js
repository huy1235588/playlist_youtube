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

    // Select 50 Video đầu tiên theo thứ tự thêm vào 
    async select50VideoBySortColumn(
        PageNumber,
        PageSize,
        column = 'PublishedAt',
        order = 'DESC',
        playlistId
    ) {
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
                return {
                    success: true,
                    data: {
                        videos: result.recordset,
                        isOverVideo: result.recordsets[1][0].NoMoreVideos,
                    }
                };
            } else {
                return {
                    success: false,
                    error: 'Videos not found'
                };
            }

        } catch (error) {
            return {
                success: false,
                error: `Error querying SQL Server: ${error.message}`
            };
        } finally {
            await this.disconnect();
        }
    }

    // Tìm video theo tên
    async searchVideo(input, playlistId) {
        try {
            await this.connect();
            const request = this.pool.request();

            const result = await request
                .input('input', sql.VarChar, input)
                .input('playlistId', sql.VarChar(50), playlistId)
                .query(`exec [Search 50 Videos By TitleVideo] @input, @playlistId`);

            return {
                success: true,
                data: result.recordset
            };

        } catch (error) {
            return {
                success: false,
                error: `Error search Video from SQL Server: ${error.message}`
            };
        } finally {
            await this.disconnect();
        }
    }

    // Select các video bị lỗi
    async selectHiddenVideo(playlistId) {
        try {
            await this.connect();
            const request = this.pool.request();

            const result = await request
                .query(`exec [Get Hidden Video Procedure] ${playlistId}`);

            return {
                success: true,
                data: result.recordset
            };

        } catch (error) {
            return {
                success: false,
                error: `Error while select hidden video: ${error.message}`
            };
        } finally {
            await this.disconnect();
        }
    }

    // Select playlist
    async getPlaylists() {
        try {
            await this.connect();
            const request = this.pool.request();

            const result = await request
                .query(`SELECT * FROM Playlists`);

            return {
                success: true,
                data: result.recordset
            };

        } catch (error) {
            return {
                success: false,
                error: `Error getting playlists in SQL Server: ${error.message}`
            };
        } finally {
            await this.disconnect();
        }
    }

    // Select playlist by playlistId
    async getPlaylistById(playlistId) {
        try {
            await this.connect();
            const request = this.pool.request();

            const result = await request
                .input('playlistId', sql.VarChar(50), playlistId)
                .query(`SELECT TOP 1 * FROM Playlists WHERE PlaylistId = @playlistId`);

            if (result.recordset.length > 0) {
                return {
                    success: true,
                    data: result.recordset[0]
                };
            } else {
                return {
                    success: false,
                    error: 'Playlist not found'
                };
            }

        } catch (error) {
            return {
                success: false,
                error: `Error getting playlist by playlistId in SQL Server: ${error.message}`
            };
        } finally {
            await this.disconnect();
        }
    }

    // Select channel
    async getChannels() {
        try {
            await this.connect();
            const request = this.pool.request();

            const result = await request
                .query(`SELECT * FROM Channels`);

            return {
                success: true,
                data: result.recordset
            };

        } catch (error) {
            return {
                success: false,
                error: `Error getting channels in SQL Server: ${error.message}`
            };
        } finally {
            await this.disconnect();
        }
    }

    // Select channel by channelId
    async getChannelByChannelId(ChannelId) {
        try {
            await this.connect();
            const request = this.pool.request();

            const result = await request
                .input('ChannelId', sql.VarChar(50), ChannelId)
                .query(`exec [Get Channel by ChannelId] @ChannelId`);

            return {
                success: true,
                data: result.recordset[0]
            };

        } catch (error) {
            return {
                success: false,
                error: `Error getting channel in SQL Server: ${error.message}`
            };
        } finally {
            await this.disconnect();
        }
    }

    // Kiểm tra videoId trong bảng Playlist
    async checkExistingVideoId(VideoId) {
        try {
            await this.connect();
            const request = this.pool.request();

            const existingChannel = await request
                .input('CheckVideoId', sql.VarChar(50), VideoId)
                .query(`SELECT COUNT(*) AS Count FROM Videos WHERE VideoId = @CheckVideoId`);

            return {
                success: true,
                data: existingChannel.recordset[0].Count > 0
            };

        } catch (error) {
            return {
                success: false,
                error: `Error checking videoId in SQL Server: ${error.message}`
            };
        } finally {
            await this.disconnect();
        }
    }

    // Kiểm tra PlaylistId trong bảng Playlist
    async checkExistingPlaylist(PlaylistId) {
        try {
            await this.connect();
            const request = this.pool.request();

            const existingChannel = await request
                .input('CheckPlaylistId', sql.VarChar(50), PlaylistId)
                .query(`SELECT COUNT(*) AS Count FROM Playlists WHERE PlaylistId = @CheckPlaylistId`);

            return {
                success: true,
                data: existingChannel.recordset[0].Count > 0
            };

        } catch (error) {
            return {
                success: false,
                error: `Error checking playlistId in SQL Server: ${error.message}`
            };
        } finally {
            await this.disconnect();
        }
    }
}

module.exports = {
    QueryModel
}