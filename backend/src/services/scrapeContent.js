
const scrapeContent = async (parentElementNth) => {
    // Lấy phần tử tiêu đề video
    const titleVideoElement = parentElementNth.locator('a#video-title');
    // Chuyển tiêu đề video thành dạng chuỗi
    let titleVideo = await titleVideoElement.textContent();
    // Lấy thuộc tính href của video
    let urlVideo = await titleVideoElement.getAttribute('href');

    // Lấy phần tử h3
    const h3TitleElement = parentElementNth.locator("#meta > h3");
    // Biến xem có thuộc tính aria-label
    const varrient = await h3TitleElement.getAttribute("aria-label");

    // Khai báo biến 
    let channelVideo = "";
    let urlChannel = "";

    // Check nếu varrient khác null
    if (varrient !== null) {
        // Lấy phần tử kênh video
        const channelVideoElement = parentElementNth.locator('a.yt-simple-endpoint.style-scope.yt-formatted-string');
        // Lấy nội dung kênh video
        channelVideo = await channelVideoElement.textContent();
        // Lấy thuộc tính href của kênh video
        urlChannel = await channelVideoElement.getAttribute('href');
    }

    // Bỏ khoảng trắng
    titleVideo = titleVideo.trim();
    // Bỏ phần sau &list= của đường dẫn video
    urlVideo = urlVideo.split("&list=")[0];

    return { titleVideo, channelVideo, urlVideo, urlChannel };
}

module.exports = { scrapeContent };