const videoSchema = `
    type Video {
        VideoId: String
        VideoTitle: String
        ChannelId: String
        ChannelTitle: String
        ViewCount: String
        PublishedAt: String
        Thumbnails: String
        Duration: String
        AddedAt: String
        IndexVideo: Int
    }

    type VideosResponse {
        success: Boolean!
        data: VideoData
        error: String
    }

    type VideoResponse {
        success: Boolean!
        data: Video
        error: String
    }

    type SearchVideosResponse {
        success: Boolean!
        data: [Video]
        error: String
    }

    type VideoData {
        videos: [Video]
        isOverVideo: Boolean
    }

    type Query {
        videos(
            PageNumber: Int,
            PageSize: Int,
            column: String,
            order: String,
            playlistId: String
        ): VideosResponse

        video(id: ID!): Video
        
        searchVideos(
            query: String!,
            playlistId: String,
            PageNumber: Int,
            PageSize: Int
        ): SearchVideosResponse
    }

    type Mutation {
        addVideo(title: String!, description: String, url: String!, thumbnail: String, duration: String): Video
        updateVideo(id: ID!, title: String, description: String, url: String, thumbnail: String, duration: String): Video
        deleteVideo(id: ID!): Boolean
    }
`;

module.exports = videoSchema;
