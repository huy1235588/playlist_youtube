const videoSchema = require('./schemas/videoSchema');
const playlistSchema = require('./schemas/playlistSchema');
const channelSchema = require('./schemas/channelSchema');
const typeDefs = `
    ${videoSchema}
    ${playlistSchema}
    ${channelSchema}
`;

module.exports = typeDefs; 