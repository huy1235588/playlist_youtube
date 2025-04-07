const { QueryModel } = require("../../models/queryModel");

const playlistResolver = {
    Query: {
        // Lấy tất cả các playlist
        playlists: async () => {
            try {
                // Khởi tạo đối tượng
                const queryModel = new QueryModel();

                // Lấy video từ database
                const playlists = await queryModel.getPlaylists();

                // Nếu có lỗi, trả về response với success = false
                if (!playlists.success) {
                    return {
                        success: false,
                        error: playlists.error,
                        data: null
                    };
                }

                // Trả về dữ liệu
                return playlists;

            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    data: null
                };
            }
        },
        
        // Lấy playlist theo id
        playlist: async (_, { id }) => {
            try {
                // Khởi tạo đối tượng
                const queryModel = new QueryModel();

                // Lấy playlist theo id
                const playlist = await queryModel.getPlaylistById(id);

                // Nếu có lỗi, trả về response với success = false
                if (!playlist.success) {
                    return {
                        success: false,
                        error: playlist.error,
                        data: null
                    };
                }

                // Trả về dữ liệu
                return playlist;

            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    data: null
                };
            }
        }
    }
};

module.exports = playlistResolver;
