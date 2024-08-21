
const axios = require('axios');
const config = require('../config/config');

const YOUTUBE_API_KEY = 'https://www.googleapis.com/youtube/v3'; // URL API của Youtube

//Hàm lấy thông tin chi tiết của video
const getVideoDetails = async (videoId) => {
    try {
        // Gửi yêu cầu GET tới endpoint playlistItems của YouTube API.
        const response = await axios.get(`${YOUTUBE_API_KEY}/videos`, {
            params: {
                // snippet (bao gồm tiêu đề, mô tả, và hình thu nhỏ) 
                // contentDetails (bao gồm videoId và thời gian phát hành)
                // https://developers.google.com/youtube/v3/docs/videos#snippet
                part: 'snippet',
                id: videoId, // Id video muốn lấy
                key: config.youtubeApiKey
            }
        });

        const video = response.data.items[0];

        // Trả về thông tin chi tiết video
        if (video) {
            return {
                title: video.snippet.title,
                channelId: video.snippet.channelId,
                channelTitle: video.snippet.channelTitle,
                thumbnails: video.snippet.thumbnails.high.url,
            };
        }

    } catch (error) {
        throw new Error(`Error  fetching playlist videos: ${error.message}`);
    }
}

const getPlaylistVideos = async (playlistId) => {
    // Làm giá trị của tham số pageToken 
    // để truy xuất trang tiếp theo trong tập kết quả.
    // https://developers.google.com/youtube/v3/docs/playlistItems/list#properties
    let nextPageToken = null;
    // Khai báo biến mảng videos
    let videos = []; 

    try {
        do {
            // Gửi yêu cầu GET tới endpoint playlistItems của YouTube API.
            const response = await axios.get(`${YOUTUBE_API_KEY}/playlistItems`, {
                params: {
                    // snippet (bao gồm tiêu đề, mô tả, và hình thu nhỏ) 
                    // contentDetails (bao gồm videoId và thời gian phát hành)
                    // https://developers.google.com/youtube/v3/docs/videos#snippet
                    part: 'contentDetails',
                    maxResults: 50, // Tối đa 50 video mỗi lượt yêu cầu
                    playlistId: playlistId, // Id playlist muốn lấy
                    pageToken: nextPageToken, // Khi nextPageToken tồn tại,thì còn video chưa được lấy.
                    key: config.youtubeApiKey
                }
            });

            const newVideos = response.data.items;

            for (const item of newVideos) {
                // Lấy ID của video
                const videoId = item.contentDetails.videoId;
                // Lấy ngày xuất bản của video
                let publishedAt = item.contentDetails.videoPublishedAt;

                let details;

                // Kiểm tra video bị lỗi
                if (publishedAt !== undefined) {
                    // Lấy thông tin chi tiết của video
                    details = await getVideoDetails(videoId);
                }
                else {
                    publishedAt = null;
                    details = {
                        title: null,
                        channelId: null,
                        channelTitle: null,
                        thumbnails: null,
                    }
                }

                // thêm dữ liệu vào mảng videos
                videos.push({
                    videoId: videoId,
                    title: details.title,
                    channelId: details.channelId,
                    channelTitle: details.channelTitle,
                    publishedAt: publishedAt,
                    thumbnails: details.thumbnails,
                });
            }

            // Cập nhật token cho trang tiếp theo
            nextPageToken = response.data.nextPageToken; 

        } while (nextPageToken); // Tiếp tục gửi yêu cầu API cho đến khi không còn nextPageToken,

        // Trả về dữ liệu
        return videos;

    } catch (error) {
        throw new Error(`Error  fetching playlist videos: ${error.message}`);
    }
}

module.exports = {
    getPlaylistVideos
};