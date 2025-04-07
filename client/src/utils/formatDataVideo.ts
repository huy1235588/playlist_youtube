
export function formatVideoId(id: string) {
    return 'https://youtube.com/watch?v=' + id;
}

// Hàm chuyển đổi một chuỗi thành định dạng theo các đơn vị "K", "M", hoặc "B".
export function formatViewCount(count: string) {
    const num = Number(count);
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(num >= 10_000_000_000 ? 0 : 1) + "B";
    } else if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(num >= 10_000_000 ? 0 : 1) + "M";
    } else if (num >= 1_000) {
        return (num / 1_000).toFixed(num >= 10_000 ? 0 : 1) + "K";
    }
    return count;
}

// Hàm tính khoảng cách thời gian
export function timeAgo(dateString: string) {
    const now = new Date();
    const pastDate = new Date(Number(dateString)); // Chuyển đổi chuỗi thành số

    const diffInDays = Math.floor((now.getTime() - pastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays >= 365) {
        return `${Math.floor(diffInDays / 365)} năm trước`;
    } else if (diffInDays >= 30) {
        return `${Math.floor(diffInDays / 30)} tháng trước`;
    } else if (diffInDays > 0) {
        return `${diffInDays} ngày trước`;
    }
    return 'Hôm nay';
}

export function formatDuration(duration: string) {
    if (duration) {
        // Tạo đối tượng RegExp để trích xuất giờ, phút và giây
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

        if (match) {
            // Trích xuất giờ, phút và giây nếu có
            const hours = match[1] ? parseInt(match[1], 10) : 0;
            const minutes = match[2] ? parseInt(match[2], 10) : 0;
            const seconds = match[3] ? parseInt(match[3], 10) : 0;

            // Định dạng giờ, phút và giây
            const formattedHours = hours > 0 ? `${hours}:` : '';
            const formattedMinutes = minutes > 0 ? `${minutes}` : '0';
            const formattedSeconds = seconds.toString().padStart(2, '0');

            // Trả về kết quả dạng "giờ:phút:giây" hoặc "phút:giây"
            return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
        }
    }
    return 'Invalid format'; // Hoặc có thể trả về một giá trị mặc định
}