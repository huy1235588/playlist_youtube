const videoResolver = require('./resolvers/videoResolver');
const playlistResolver = require('./resolvers/playlistResolver');

const resolvers = {
    ...videoResolver,
    // ...playlistResolver
};

module.exports = resolvers; 