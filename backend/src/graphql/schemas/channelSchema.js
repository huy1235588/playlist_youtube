const channelSchema = `
    type Channel {
        ChannelId: String!
        Title: String!
        Thumbnails: String
        SubscriberCount: Int
        ViewCount: Int
    }

    type ChannelsResponse {
        success: Boolean!
        data: [Channel]
        error: String
    }

    type ChannelResponse {
        success: Boolean!
        data: Channel
        error: String
    }

    type Query {
        channels: ChannelsResponse
        channel(channelId: String!): ChannelResponse
    }

    type Mutation {
        addChannel(title: String!, description: String): ChannelResponse
        updateChannel(id: ID!, title: String, description: String): ChannelResponse
        deleteChannel(id: ID!): Boolean
    }
`;

module.exports = channelSchema;
