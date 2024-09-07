const axios = require('axios');
const config = require('../config/config');

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'; // URL API của Youtube

// Hàm để Xóa video khỏi playlist
const deleteVideoFromPlaylist = async (playlistItemId) => {
    try {
        const response = await axios.delete(`https://www.googleapis.com/youtube/v3/playlistItems`, {
            params: {
                id: playlistItemId,
                key: config.youtubeApiKey
            },
        });
        
        console.log('Video deleted:', response.data);

    } catch (error) {
        console.error('Error deleting video:', error.response ? error.response.data : error.message);
    }
};

//   hàm để Thêm video mới vào playlist
const addVideoToPlaylist = async (playlistId, videoId, accessToken) => {
    try {
        const response = await axios.post(
            'https://www.googleapis.com/youtube/v3/playlistItems',
            {
                snippet: {
                    playlistId: playlistId,
                    resourceId: {
                        kind: 'youtube#video',
                        videoId: videoId,
                    },
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    part: 'snippet',
                },
            }
        );
        console.log('Video added:', response.data);
    } catch (error) {
        console.error('Error adding video:', error.response ? error.response.data : error.message);
    }
};
