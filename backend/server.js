const express = require('express');
const app = express();
require('dotenv').config();

const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const schema = require('./src/graphql/schema');
const resolvers = require('./src/graphql/resolvers');

// Cấu hình cors
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = process.env.ALLOW_ORIGINS;

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin);
        } else {
            callback(new Error(`Not allowed by CORS at ${origin}`));
        }
    },
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Cache-Control', // Điều khiển cách thức cache (lưu trữ tạm thời)
        'Expires', // xác định thời gian mà tài nguyên sẽ hết hạn.
        'Pragma'
    ],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Khởi tạo Apollo Server
const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
});

// Khởi động Apollo Server
async function startServer() {
    await server.start();
    
    // Sử dụng Apollo Server middleware
    app.use('/graphql', expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.token })
    }));

    // Sử dụng videoRoutes
    const videoRoutes = require('./src/routes/videoRoutes');
    app.use('/api', videoRoutes);

    // Sử dụng getVideoRoutes
    const getVideoRoutes = require('./src/routes/getVideoRoutes');
    app.use('/api', getVideoRoutes);

    // Sử dụng searchVideoRoutes
    const searchVideoRoutes = require('./src/routes/searchVideoRoutes');
    app.use('/api', searchVideoRoutes);

    // Cổng
    const PORT = process.env.PORT || 3001;

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });
}

startServer();
