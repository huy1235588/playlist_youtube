
const axios = require('axios');
const config = require('../config/config');

const YOUTUBE_API_KEY = 'https://www.googleapis.com/youtube/v3'; // URL API của Youtube

const getPlaylistVideos = async (playlistID) => {
    try {
        // Gửi yêu cầu GET tới endpoint playlistItems của YouTube API.
        const response = await axios.get(`${YOUTUBE_API_KEY}/playlistItems`, {
            params: {
                // snippet (bao gồm tiêu đề, mô tả, và hình thu nhỏ) 
                // contentDetails (bao gồm videoId và thời gian phát hành)
                // https://developers.google.com/youtube/v3/docs/videos#snippet
                part: 'snippet,contentDetails',
                maxResults: 50, // Tối đa 50 video mỗi lượt yêu cầu
                playlistID: playlistID, // ID playlist muốn lấy
                key: config.youtubeApiKey
            }
        });

        // Trả về dữ liệu
        return response.data.items.map(item => ({
            VideoID: videoId,
            title: item.snippet.title,
            publishedAt: item.contentDetails.videoPublishedAt,
            channelID: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle,
            thumbnails: item.snippet.thumbnails.standard.url,
            thumbnailsMaxRes: item.snippet.thumbnails.maxres.url
        }));

    } catch (error) {
        throw new Error(`Error  fetching playlist videos: ${error.message}`);
    }
}

module.exports = {
    getPlaylistVideos
};