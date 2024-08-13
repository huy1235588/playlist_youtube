const { chromium, errors } = require('playwright');
const sql = require('mssql');

const { scrapeContent } = require('./scrapeContent');

// Cấu hình kết nối đến SQL Server
const sqlConfig = {
    user: 'ha',
    password: 'ha',
    database: 'playlist_video',
    server: 'Admin-PC',
    options: {
        encrypt: true, // mã hóa ssl
        trustServerCertificate: true,
    },
};

// Hàm lưu dũ liệu vào database
const saveContentToDB = async (content) => {
    try {
        // Kết nói đến SQL Server
        await sql.connect(sqlConfig);
        const request = new sql.Request();

        // Chèn dữ liệu vào bảng
        await request
            .input('title', sql.NVarChar, content.titleVideo)
            .input('channel', sql.NVarChar, content.channelVideo)
            .input('urlVideo', sql.NVarChar, content.urlVideo)
            .input('urlChannel', sql.NVarChar, content.urlChannel)
            .query(
                `INSERT INTO Video VALUES ( @title, @channel, @urlVideo, @urlChannel)`,
            );

    } catch (error) {
        throw new Error(`Error saving to SQL Server: ${error.message}`);
    } finally {
        sql.close();
    }
};

// Hàm hiện các video bị ẩn
const showHiddenVideo = async (page) => {
    // Nút 3 chấm
    const buttons = page.locator("#button-shape > button > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill");
    await buttons.click();

    // Đợi đến khi hiển thị nút mới
    await page.waitForSelector('#items > ytd-menu-navigation-item-renderer > a > tp-yt-paper-item > yt-formatted-string');

    // Nút hiển thị các video bị ẩn
    const hiddenVideo = page.locator("#items > ytd-menu-navigation-item-renderer > a > tp-yt-paper-item > yt-formatted-string");
    await hiddenVideo.click();
}

// Hàm lướt đến cuối trang
const scrollToEndPage = async (page) => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    // Lấy chiều cao của page
    lastHeight = await page.evaluate(() => {
        document.documentElement.scrollHeight;
    })

    await page.keyboard.press("End");

    while (true) {
        // Nhấn nút "End"
        await page.keyboard.press("End");
        // Cuộn lên trên video đề xuất
        await page.evaluate(() => {
            window.scrollBy(0, -500);
        });
        // Đợi 1s (1000ms)
        await delay(2000);
        // Lấy chiều cao mới của page
        const newHeight = await page.evaluate(() => {
            return document.documentElement.scrollHeight;
        })
        console.log(lastHeight, newHeight);
        // Check nếu chiều cao trước đó bằng chiều cao hiện tại của page thì dừng
        if (newHeight == lastHeight) {
            break;
        }
        lastHeight = newHeight;
    }
}

const scrapeData = async (url) => {
    if (!url) {
        throw new Error('URL is required');
    }

    try {
        // Khởi tạo trình duyệt Chromium    
        const browser = await chromium.launchPersistentContext(
            // Đường dần đến Profile Chrome
            "C:/Users/Admin/AppData/Local/Google/Chrome/User Data", {
            // Đường dần đến file thực thi Chrome
            executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
            // Chế độ dòng lệnh
            headless: true,
            // Chế độ Chrome
            channel: 'chrome',
        }
        );

        // Mở trang mới
        const page = await browser.newPage();

        // Truy cập trang web
        await page.goto(url);

        await showHiddenVideo(page);

        // // Đợi 1 giây (1000 milliseconds)
        await page.waitForTimeout(1000);
        // Cuộn đến cuối trang
        await scrollToEndPage(page);

        // Lấy playlist video
        const playlistVideo = page.locator('#contents.ytd-playlist-video-list-renderer > ytd-playlist-video-renderer');

        // Lấy số lượng video
        const countPlaylistVideo = await playlistVideo.count();

        // Lặp toàn video trong playlist
        for (let index = countPlaylistVideo - 1; index >= 0; index--) {
            // Lấy nguyền phần tử video
            const parentElementNth = playlistVideo.nth(index);

            // Lấy content
            const content = await scrapeContent(parentElementNth);

            // Lưu vào Database
            await saveContentToDB(content);
        }

        // Lấy nguyền phần tử video
        const parentElementNth = playlistVideo.nth(countPlaylistVideo - 2);

        // Lấy content
        const content = await scrapeContent(parentElementNth);

        // // Lưu vào Database
        // await saveContentToDB(content);

        // Đóng trình đuyệt
        await browser.close();

        // Khai báo biến 
        let titleVideo = content.titleVideo;
        let channelVideo = content.channelVideo;
        let urlVideo = content.urlVideo;
        let urlChannel = content.urlChannel;

        // Trả về giá trị
        return { titleVideo, channelVideo, urlVideo, urlChannel };

    } catch (error) {
        throw new Error(`Error scraping data: ${error.message}`);
    }
}

module.exports = { scrapeData };
