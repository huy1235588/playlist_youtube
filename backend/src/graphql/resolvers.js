const videoResolver = require('./resolvers/videoResolver');
const playlistResolver = require('./resolvers/playlistResolver');

const resolvers = {
    Query: {
        ...videoResolver.Query,
        ...playlistResolver.Query
    },
    Mutation: {
        ...videoResolver.Mutation,
        ...playlistResolver.Mutation
    }
};

module.exports = resolvers; 