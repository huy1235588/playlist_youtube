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

                return {
                    success: true,
                    data: playlists,
                    error: null
                };
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

                console.log(playlist);

                // Nếu có lỗi, trả về response với success = false
                if (!playlist.success) {
                    return {
                        success: false,
                        error: playlist.error,
                        data: null
                    };
                }

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
