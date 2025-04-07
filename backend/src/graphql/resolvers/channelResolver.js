const { QueryModel } = require("../../models/queryModel");

const channelResolver = {
    Query: {
        // Lấy tất cả các kênh
        channels: async () => {
            try {
                // Khởi tạo đối tượng
                const queryModel = new QueryModel();

                // Lấy video từ datbase
                const channel = await queryModel.getChannels();

                // Nếu có lỗi, trả về response với success = false
                if (!channel.success) {
                    return {
                        success: false,
                        error: channel.error,
                        data: null
                    };
                }

                // Trả về dữ liệu
                return channel;

            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    data: null
                };
            }
        },

        // Lấy kênh theo channelId
        channel: async (_, { channelId }) => {
            try {
                // Khởi tạo đối tượng
                const queryModel = new QueryModel();

                // Lấy video từ datbase
                const channel = await queryModel.getChannelByChannelId(channelId);

                // Nếu có lỗi, trả về response với success = false  
                if (!channel.success) {
                    return {
                        success: false,
                        error: channel.error,
                        data: null
                    };
                }

                // Trả về dữ liệu
                return channel;

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

module.exports = channelResolver;
