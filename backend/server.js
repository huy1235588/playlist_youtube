const { chromium, errors } = require('playwright');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')

const app = express();
const port = 3001; // Hoặc bất kỳ cổng nào bạn muốn

app.use(cors());
// app.use(bodyParser.json()); // Để đọc dữ liệu JSON từ request body

app.get('/api/data', async (req, res) => {
    // const { url } = req.body;
    const url = req.query.input;

    if (!url) {
        // return res.status(400).send("URL is requied")
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Khởi tạo trình duyệt Chromium    
        const browser = await chromium.launchPersistentContext(
            "C:/Users/Admin/AppData/Local/Google/Chrome/User Data", {
            executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
            headless: true,
            channel: 'chrome',
            colorScheme: "dark"
        }
        );
        const page = await browser.newPage();

        // Truy cập trang web
        // await page.goto(url);
        await page.goto(url);

        // Lấy playlist video
        const playlistVideo = page.locator('ytd-playlist-video-renderer.style-scope.ytd-playlist-video-list-renderer[style-type=""]');


        /* Database will be here
        playlistVideo.forEach(video => {
            let titleVideoContent = titleVideo.textContent();
        });
        */
        const parentElementNth = playlistVideo.nth(3);

        const titleVideo = parentElementNth.locator('a#video-title');

        let titleVideoContent = await titleVideo.textContent();

        // Đóng trình duyệt
        await browser.close();

        // Loại bỏ các ký tự trắng và xuống dòng không cần thiết
        titleVideoContent = titleVideoContent
            .trim()                  // Xóa khoảng trắng ở đầu và cuối chuỗi
        // .replace(/\s+/g, ' ');   // Thay thế nhiều khoảng trắng liên tiếp bằng một khoảng trắng

        // Gửi dữ liệu về client
        res.json({ titleVideoContent });
        console.log("\"" + titleVideoContent + "\"");
    } catch (error) {
        console.error('Error when fetching data:', error);
        res.status(500).send('An error occurred');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
