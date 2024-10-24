
const axios = require('axios');
const config = require('../config/config');

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'; // URL API của Youtube

// Hàm lấy thông tin chi tiết của channel
const getChannelDetails = async (channelId) => {
    try {
        // Gửi yêu cầu GET tới endpoint playlistItems của YouTube API.
        const response = await axios.get(`${YOUTUBE_API_BASE_URL}/channels`, {
            params: {
                // https://developers.google.com/youtube/v3/docs/channels#snippet
                part: 'snippet, contentDetails, statistics',
                id: channelId, // Id channel muốn lấy
                key: config.youtubeApiKey
            }
        });

        const channel = response.data.items[0];

        // Trả về thông tin chi tiết channel
        if (channel) {
            return {
                channelId: channelId,
                title: channel.snippet.title,
                thumbnails: channel.snippet.thumbnails.high.url,
                subscriberCount: channel.statistics.subscriberCount,
                videoCount: channel.statistics.videoCount,
            };
        }
    } catch (error) {
        throw new Error(`Error fetching channel: ${error.message}`);
    }
}

// Hàm lấy thông tin chi tiết của video
const getVideoDetails = async (videoId, playlistId) => {
    try {
        // Gửi yêu cầu GET tới endpoint playlistItems của YouTube API.
        const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
            params: {
                // https://developers.google.com/youtube/v3/docs/videos#snippet
                part: 'snippet, contentDetails, statistics',
                id: videoId, // Id video muốn lấy
                key: config.youtubeApiKey
            }
        });

        const video = response.data.items[0];

        // Kiểm tra video có bị xóa không
        if (video) {
            // Trả về thông tin chi tiết video
            return {
                videoId: videoId,
                title: video.snippet.title,
                publishedAt: video.snippet.publishedAt,
                thumbnails: video.snippet.thumbnails.high.url,
                viewCount: video.statistics.viewCount,
                duration: video.contentDetails.duration,
                channelId: video.snippet.channelId,
            };
        }
        else {
            // Trả về null nếu video bị xóa hoặc bị lỗi
            return {
                videoId: videoId,
                title: null,
                publishedAt: null,
                thumbnails: null,
                viewCount: null,
                duration: null,
                channelId: null,
                playlistId: playlistId,
            }
        }

    } catch (error) {
        throw new Error(`Error fetching videos: ${error.message}`);
    }
}

//Hàm lấy thông tin chi tiết của video
const getPlaylistDetails = async (playlistId) => {
    try {
        // Gửi yêu cầu GET tới endpoint playlistItems của YouTube API.
        const response = await axios.get(`${YOUTUBE_API_BASE_URL}/playlists`, {
            params: {
                // https://developers.google.com/youtube/v3/docs/playlists#snippet
                part: 'snippet, contentDetails',
                id: playlistId, // Id video muốn lấy
                key: config.youtubeApiKey
            }
        });

        const playlist = response.data.items[0];

        // Trả về thông tin chi tiết playlist
        if (playlist) {
            return {
                playlistId: playlistId,
                title: playlist.snippet.title,
                publishedAt: playlist.snippet.publishedAt,
                thumbnails: playlist.snippet.thumbnails.high.url,
                channelId: playlist.snippet.channelId,
                channelTitle: playlist.snippet.channelTitle,
                itemCount: playlist.contentDetails.itemCount,
            };
        }

    } catch (error) {
        throw new Error(`Error fetching playlist videos: ${error.message}`);
    }
}

const getPlaylistItems = async (playlistId, currentVideoId = null) => {
    // Làm giá trị của tham số pageToken 
    // để truy xuất trang tiếp theo trong tập kết quả.
    // https://developers.google.com/youtube/v3/docs/playlistItems/list#properties
    let nextPageToken = null;
    // Khai báo biến mảng videos
    let videos = [];
    // Khai báo biến indexVideo
    let totalResults;

    // Biến cờ để kiểm tra nếu cần dừng
    let isExistVideo = false;

    try {
        do {
            // Gửi yêu cầu GET tới endpoint playlistItems của YouTube API.
            const response = await axios.get(`${YOUTUBE_API_BASE_URL}/playlistItems`, {
                params: {
                    // snippet (bao gồm tiêu đề, mô tả, và hình thu nhỏ) 
                    // contentDetails (bao gồm videoId và thời gian phát hành)
                    // https://developers.google.com/youtube/v3/docs/playlistItems#snippet
                    part: 'snippet, contentDetails',
                    maxResults: 50, // Tối đa 50 video mỗi lượt yêu cầu
                    playlistId: playlistId, // Id playlist muốn lấy
                    pageToken: nextPageToken, // Khi nextPageToken tồn tại,thì còn video chưa được lấy.
                    key: config.youtubeApiKey
                }
            });

            const Videos = response.data.items;

            // Lấy tổng video
            totalResults = response.data.pageInfo.totalResults;

            // Lặp từng phần tử trong playlists
            for (const item of Videos) {
                // Lấy ID của video
                const videoId = item.contentDetails.videoId;

                if (videoId === currentVideoId) {
                    isExistVideo = true; // Đặt cờ để dừng vòng lặp ngoài
                    break;
                }

                // Lấy ngày thêm video vào playlist
                const videoPublishedAt = item.snippet.publishedAt;

                // Thêm dữ liệu vào mảng videos
                videos.push({
                    id: item.id,
                    videoId: videoId,
                    addAt: videoPublishedAt,
                    channelId: item.snippet.videoOwnerChannelId,
                });

            }

            if (isExistVideo) {
                break; // Dừng vòng lặp do...while nếu cờ đã được đặt
            }

            // Cập nhật token cho trang tiếp theo
            nextPageToken = response.data.nextPageToken;

        } while (nextPageToken); // Tiếp tục gửi yêu cầu API cho đến khi không còn nextPageToken,

        // Trả về dữ liệu
        return {
            playlistId: playlistId,
            totalResults: totalResults,
            items: videos,
        };

    } catch (error) {
        throw new Error(`Error fetching playlistItems videos: ${error.message}`);
    }
}

module.exports = {
    getPlaylistItems,
    getChannelDetails,
    getVideoDetails,
    getPlaylistDetails,
};