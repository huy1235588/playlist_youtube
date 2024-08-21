require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Sử dụng video routes
const videoRoutes = require('./src/routes/videoRoutes');
app.use('/api', videoRoutes);

// Cổng
const PORT = process.env.PORT || 3001; 

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
