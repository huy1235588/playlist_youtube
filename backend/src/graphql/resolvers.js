const videoResolver = require('./resolvers/videoResolver');
const playlistResolver = require('./resolvers/playlistResolver');
const channelResolver = require('./resolvers/channelResolver');

const resolvers = {
    Query: {
        ...videoResolver.Query,
        ...playlistResolver.Query,
        ...channelResolver.Query
    },
    Mutation: {
        ...videoResolver.Mutation,
        ...playlistResolver.Mutation,
        ...channelResolver.Mutation
    }
};

module.exports = resolvers; 