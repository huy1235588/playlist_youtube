const videoSchema = require('./schemas/videoSchema');
const playlistSchema = require('./schemas/playlistSchema');

const typeDefs = `
    ${videoSchema}
    ${playlistSchema}
`;

module.exports = typeDefs; 