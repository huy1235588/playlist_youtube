
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
        // Lấy thông tin chi tiết của channel
        detailChannel = await getChannelDetails(video.snippet.channelId);

        // Trả về thông tin chi tiết video
        if (video) {
            return {
                title: video.snippet.title,
                publishedAt: video.snippet.publishedAt,
                thumbnails: video.snippet.thumbnails.high.url,
                viewCount: video.statistics.viewCount,
                duration: video.contentDetails.duration,
                detailChannel: detailChannel,
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
    let channels = [];
    // Khai báo biến mảng videos
    let videos = [];
    // Khai báo biến thông tin chi tiết
    let detailVideo;
    let detailChannel;
    let nullChannel = 1; // NUll channel?

    try {
        do {
            // Gửi yêu cầu GET tới endpoint playlistItems của YouTube API.
            const response = await axios.get(`${YOUTUBE_API_BASE_URL}/playlistItems`, {
                params: {
                    // snippet (bao gồm tiêu đề, mô tả, và hình thu nhỏ) 
                    // contentDetails (bao gồm videoId và thời gian phát hành)
                    // https://developers.google.com/youtube/v3/docs/playlistItems#snippet
                    part: 'contentDetails',
                    maxResults: 50, // Tối đa 50 video mỗi lượt yêu cầu
                    playlistId: playlistId, // Id playlist muốn lấy
                    pageToken: nextPageToken, // Khi nextPageToken tồn tại,thì còn video chưa được lấy.
                    key: config.youtubeApiKey
                }
            });

            const Videos = response.data.items;

            // Lặp từng phần tử trong playlists
            for (const item of Videos) {
                // Lấy ID của video
                const videoId = item.contentDetails.videoId;
                // Lấy ngày phát hành của video
                const videoPublishedAt = item.contentDetails.videoPublishedAt;

                // console.log(videoPublishedAt)

                // Lấy thông tin chi tiết của video
                if (videoPublishedAt !== undefined) {
                    detailVideo = await getVideoDetails(videoId);
                }
                else {
                    // Tạo một đối tượng mới từ mảng các cặp [key, null].
                    detailVideo = Object.fromEntries(
                        // Tạo một mảng các cặp [key, value] từ đối tượng detailVideo.
                        // Thay đổi giá trị của mỗi cặp thành null
                        Object.entries(detailVideo).map(([key, _]) => [key, null])
                    );
                }
                
                // Lấy thông tin chi tiết của channel
                if (videoPublishedAt !== undefined) {
                    detailChannel = detailVideo.detailChannel;
                }
                else {
                    detailChannel = {
                        channelId: "null" + nullChannel,
                        title: null,
                        thumbnails: null,
                        subscriberCount: null,
                        videoCount: null
                    };
                    nullChannel++;
                }

                // thêm dữ liệu vào mảng channels
                channels.push({
                    channelId: detailChannel.channelId,
                    title: detailChannel.title,
                    thumbnails: detailChannel.thumbnails,
                    subscriberCount: detailChannel.subscriberCount,
                    videoCount: detailChannel.videoCount,
                })

                // thêm dữ liệu vào mảng videos
                videos.push({
                    videoId: videoId,
                    title: detailVideo.title,
                    publishedAt: detailVideo.publishedAt,
                    thumbnails: detailVideo.thumbnails,
                    viewCount: detailVideo.viewCount,
                    duration: detailVideo.duration,
                    channelId: detailChannel.channelId,
                    playlistId: playlistId
                });
            }

            // Cập nhật token cho trang tiếp theo
            nextPageToken = response.data.nextPageToken;

        } while (nextPageToken); // Tiếp tục gửi yêu cầu API cho đến khi không còn nextPageToken,

        // Lấy thông tin chi tiết của playlist
        const detailPlaylist = await getPlaylistDetails(playlistId);
        // Thêm dữ liệu playlist vào
        const playlists = {
            playlistId: playlistId,
            title: detailPlaylist.title,
            publishedAt: detailPlaylist.publishedAt,
            thumbnails: detailPlaylist.thumbnails,
            channelTitle: detailPlaylist.channelTitle,
        }

        // Trả về dữ liệu
        return {
            channels,
            videos,
            playlists
        };

    } catch (error) {
        throw new Error(`Error  fetching playlist videos: ${error.message}`);
    }
}

module.exports = {
    getPlaylistVideos
};