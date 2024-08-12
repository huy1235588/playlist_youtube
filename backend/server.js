const express = require('express');
const cors = require('cors');

const { scrapeData } = require('./services/scrapeService');

const app = express();
const port = 3001; // Hoặc bất kỳ cổng nào bạn muốn

app.use(cors());

app.get('/api/content', async (req, res) => {
    const url = req.query.input;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const content = await scrapeData(url);

        // Gửi dữ liệu về client
        res.json({ content });
        console.log(content);

    } catch (error) {
        console.error('Error when fetching content:', error);
        res.status(500).send('An error occurred');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
});
