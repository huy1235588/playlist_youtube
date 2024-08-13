const { chromium, errors } = require('playwright');

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
const scrollByPageDown = async (page) => {
    await page.evaluate(async () => {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const scrollHeight = document.body.scrollHeight;
        while (window.scrollY + window.innerHeight < scrollHeight) {
            window.scrollBy(0, window.innerHeight);
            await delay(1000); // Chờ một chút để trang tải thêm nội dung
        }
    });
}

const scrapeImage = async (url) => {
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
            headless: false,
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
        await scrollByPageDown(page);

        // Lấy playlist video
        const playlistVideo = page.locator('#contents > ytd-playlist-video-renderer');


        /* Database will be here
        playlistVideo.forEach(video => {
            let titleVideoContent = titleVideo.textContent();
        });
        */

        const parentElementNth = playlistVideo.nth(13);

        // Lấy phần tử hình ảnh
        const imageUrlElement = parentElementNth.locator("#thumbnail > yt-image > img");
        // Lấy thuộc tính src hình ảnh
        let imageUrl = await imageUrlElement.getAttribute('src');


        // Đóng trình đuyệt
        await browser.close();


        // Bỏ phần sau &list= của đường dẫn hình ảnh
        if (imageUrl !== null) {
            imageUrl = imageUrl.split("?sqp=-")[0];
        }

        // Trả về giá trị
        return { imageUrl };

    } catch (error) {
        throw new Error(`Error scraping data: ${error.message}`);
    }
}

module.exports = { scrapeData };
