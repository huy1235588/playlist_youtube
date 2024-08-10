const { chromium, errors } = require('playwright');

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

        // Nút 3 chấm
        const buttons = page.locator("#button-shape > button > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill");
        await buttons.click();

        // Đợi đến khi hiển thị nút mới
        await page.waitForSelector('#items > ytd-menu-navigation-item-renderer > a > tp-yt-paper-item > yt-formatted-string');

        // Nút hiển thị các video bị ẩn
        const hiddenVideo = page.locator("#items > ytd-menu-navigation-item-renderer > a > tp-yt-paper-item > yt-formatted-string");
        await hiddenVideo.click();

        // Đợi 1 giây (1000 milliseconds)
        await page.waitForTimeout(1000);

        // Lấy playlist video
        const playlistVideo = page.locator('#contents > ytd-playlist-video-renderer');


        /* Database will be here
        playlistVideo.forEach(video => {
            let titleVideoContent = titleVideo.textContent();
        });
        */

        const parentElementNth = playlistVideo.nth(1);

        // Lấy phần tử tiêu đề video
        const titleVideoElement = parentElementNth.locator('a#video-title');
        // Chuyển tiêu đề video thành dạng chuỗi
        let titleVideo = await titleVideoElement.textContent();
        // Lấy thuộc tính href của video
        let urlVideo = await titleVideoElement.getAttribute('href');


        // Lấy phần tử hình ảnh
        const imageUrlElement = parentElementNth.locator("#thumbnail > yt-image > img");
        // Lấy thuộc tính src hình ảnh
        let imageUrl = await imageUrlElement.getAttribute('src');

        // Khai báo biến 
        let channelVideo = "";
        let urlChannel = "";

        // Check nếu link hình ảnh no thumbnail
        if (imageUrl !== 'https://i.ytimg.com/img/no_thumbnail.jpg') {
            // Lấy phần tử kênh video
            const channelVideoElement = parentElementNth.locator('a.yt-simple-endpoint.style-scope.yt-formatted-string');
            // Lấy nội dung kênh video
            channelVideo = await channelVideoElement.textContent();
            // Lấy thuộc tính href của kênh video
            urlChannel = await channelVideoElement.getAttribute('href');
        }

        // Đóng trình đuyệt
        await browser.close();

        // Bỏ khoảng trắng
        titleVideo = titleVideo.trim();
        // Bỏ phần sau &list= của đường dẫn video
        urlVideo = urlVideo.split("&list=")[0];
        // Bỏ phần sau &list= của đường dẫn hình ảnh
        if (imageUrl !== null) {
            imageUrl = imageUrl.split("?sqp=-")[0];
        }

        // Trả về giá trị
        return { titleVideo, channelVideo, imageUrl, urlVideo, urlChannel };

    } catch (error) {
        throw new Error(`Error scraping data: ${error.message}`);
    }
}

module.exports = { scrapeData };
