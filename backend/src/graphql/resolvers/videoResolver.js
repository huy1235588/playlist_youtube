const { QueryModel } = require("../../models/queryModel");

const videoResolver = {
    Query: {
        // Lấy video theo playlist
        videos: async (_, {
            PageNumber,
            PageSize,
            column,
            order,
            playlistId
        }) => {
            try {
                // Khởi tạo đối tượng
                const queryModel = new QueryModel();

                // Lấy video từ datbase
                const result = await queryModel.select50VideoBySortColumn(
                    PageNumber,
                    PageSize,
                    column || 'PublishedAt',
                    order || 'DESC',
                    playlistId,
                );

                // Nếu có lỗi, trả về response với success = false
                if (!result.success) {
                    return {
                        success: false,
                        error: result.error,
                        data: null
                    };
                }

                return result;

            } catch (error) {
                console.error('Error fetching videos:', error);
                return {
                    success: false,
                    error: error.message,
                    data: null
                };
            }
        },

        video: async (_, { id }) => {
            // TODO: Implement fetching a single video by ID
            return null;
        },

        searchVideos: async (_, { 
            query,
            playlistId,
            PageNumber,
            PageSize
        }) => {
            try {
                // Khởi tạo đối tượng
                const queryModel = new QueryModel();

                // Lấy video từ datbase
                const result = await queryModel.search50VideoByTitleVideo(
                    query,
                    playlistId,
                    PageNumber || 1,
                    PageSize || 50
                );

                // Nếu có lỗi, trả về response với success = false
                if (!result.success) {
                    return {
                        success: false,
                        error: result.error,
                        data: null
                    };
                }

                // Trả về response
                return result;

            } catch (error) {
                console.error('Error fetching videos:', error);
                return {
                    success: false,
                    error: error.message,
                    data: null
                };
            }
        }
    },
    Mutation: {
        addVideo: async (_, { title, description, url, thumbnail, duration }) => {
            // TODO: Implement adding a new video
            return { id: '1', title, description, url, thumbnail, duration };
        },

        updateVideo: async (_, { id, title, description, url, thumbnail, duration }) => {
            // TODO: Implement updating a video
            return { id, title, description, url, thumbnail, duration };
        },

        deleteVideo: async (_, { id }) => {
            // TODO: Implement deleting a video
            return true;
        }
    }
};

module.exports = videoResolver; 