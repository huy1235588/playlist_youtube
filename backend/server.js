const express = require('express');
const app = express();
require('dotenv').config();

const cors = require('cors');
app.use(cors());
app.use(express.json());

// Sử dụng videoRoutes
// const videoRoutes = require('./src/routes/videoRoutes');
// app.use('/api', videoRoutes);

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
});
