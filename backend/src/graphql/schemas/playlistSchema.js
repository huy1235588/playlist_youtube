const playlistSchema = `
    type Playlist {
        PlaylistId: String
        Title: String
        PublishedAt: String
        Thumbnails: String
        ChannelId: String
        ChannelTitle: String
        ItemCount: Int
    }

    type PlaylistResponse {
        success: Boolean!
        data: Playlist
        error: String
    }   

    type PlaylistsResponse {
        success: Boolean!
        data: [Playlist]
        error: String
    }

    type Query {
        playlists: PlaylistsResponse
        playlist(id: String!): PlaylistResponse
    }

    type Mutation {
        addPlaylist(title: String!, description: String): PlaylistResponse
        updatePlaylist(id: ID!, title: String, description: String): PlaylistResponse
        deletePlaylist(id: ID!): Boolean
    }
`;

module.exports = playlistSchema;
