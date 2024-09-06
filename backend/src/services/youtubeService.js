
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
                id: channelId, // Id video muốn lấy
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
        throw new Error(`Error  fetching playlist videos: ${error.message}`);
    }
}

// Hàm lấy thông tin chi tiết của video
const getVideoDetails = async (videoId) => {
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

        // Trả về thông tin chi tiết video
        if (video) {
            return {
                title: video.snippet.title,
                publishedAt: video.snippet.publishedAt,
                thumbnails: video.snippet.thumbnails.high.url,
                viewCount: video.statistics.viewCount,
                duration: video.contentDetails.duration,
                channelId: video.snippet.channelId,
            };
        }

    } catch (error) {
        throw new Error(`Error  fetching playlist videos: ${error.message}`);
    }
}

//Hàm lấy thông tin chi tiết của video
const getPlaylistDetails = async (playlistId) => {
    try {
        // Gửi yêu cầu GET tới endpoint playlistItems của YouTube API.
        const response = await axios.get(`${YOUTUBE_API_BASE_URL}/playlists`, {
            params: {
                // https://developers.google.com/youtube/v3/docs/playlists#snippet
                part: 'snippet',
                id: playlistId, // Id video muốn lấy
                key: config.youtubeApiKey
            }
        });

        const playlist = response.data.items[0];

        // Trả về thông tin chi tiết playlist
        if (playlist) {
            return {
                title: playlist.snippet.title,
                publishedAt: playlist.snippet.publishedAt,
                thumbnails: playlist.snippet.thumbnails.high.url,
                channelTitle: playlist.snippet.channelTitle,
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
    // Khai báo biến indexVideo
    let indexVideo;

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
            indexVideo = response.data.pageInfo.totalResults;

            // Lặp từng phần tử trong playlists
            for (const item of Videos) {
                // Lấy ID của video
                const videoId = item.contentDetails.videoId;
                // Lấy ngày phát hành của video
                const videoPublishedAt = item.contentDetails.videoPublishedAt;
                // Lấy kênh của video
                const channelId = item.snippet.videoOwnerChannelId;

                // Thêm dữ liệu vào mảng videos
                videos.push({
                    videoId: videoId,
                    addAt: videoPublishedAt,
                    indexVideo: indexVideo,
                    channelId: channelId,
                });

                // Cập nhật indexvideo
                indexVideo -= 1;
            }

            // Cập nhật token cho trang tiếp theo
            // nextPageToken = response.data.nextPageToken;

        } while (nextPageToken); // Tiếp tục gửi yêu cầu API cho đến khi không còn nextPageToken,

        // Trả về dữ liệu
        return {
            playlistId: playlistId,
            items: videos,
        };

    } catch (error) {
        throw new Error(`Error  fetching playlist videos: ${error.message}`);
    }
}

module.exports = {
    getPlaylistVideos,
    getChannelDetails,
    getVideoDetails,
    getPlaylistDetails,
};