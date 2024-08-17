const express = require('express');
const cors = require('cors');

const videoRoutes = require('./routes/videoRoutes');

const app = express();

// app.use(cors());

// Sử dụng video routes
app.use('/api', videoRoutes);

module.exports = app;