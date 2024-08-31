<template>
    <section id="video" class="video flex">
        <div id="index-container">
            <div id="icon">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false"
                    aria-hidden="true" style="
                        pointer-events: none;
                        display: inherit;
                        width: 100%;
                        height: 100%;
                    ">
                    <path d="M21 10H3V9h18v1Zm0 4H3v1h18v-1Z"></path>
                </svg>
            </div>
        </div>
        <div id="content">
            <div id="thumbnail-container">
                <a id="thumbnail">
                    <!-- Hình ảnh video -->
                    <img v-if="notFound" src="https://i.ytimg.com/img/no_thumbnail.jpg" alt="" />
                    <img v-else :src="data.Thumbnails" alt="" />
                    <div id="overplay">
                        <!-- Thời lượng video -->
                        <div id="time-status">
                            <div class="badge-shape">
                                <span class="text">{{ duration }}</span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
            <div id="meta">
                <!-- Tên video -->
                <h3 class="video-title-container">
                    <a v-if="notFound" href="" id="video-title" class="error">[Not Found]</a>
                    <a v-else href="" id="video-title">
                        {{ data.VideoTile }}
                    </a>
                </h3>
                <div class="flex">
                    <div id="metadata" class="flex">
                        <div id="byline-container" class="flex">
                            <!-- Tên channel -->
                            <div id="channel-name">
                                <div id="container">
                                    <div id="text-container">
                                        <div id="text">
                                            <a v-if="notFound" href=""></a>
                                            <a v-else href="">
                                                {{ data.ChannelTitle }}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Thông tin video -->
                            <div v-if="notFound" href=""></div>
                            <div v-else id="video-info">
                                <!-- Khoảng cách -->
                                <div id="separator">•</div>
                                <span id="view-count">
                                    {{ viewCount }} lượt xem</span>
                                <span id="separator"> • </span>
                                <span id="published-at">{{
                                    publishedAt
                                    }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="menu">
            <MenuTask :index="data.IndexVideo" />
        </div>
    </section>
</template>

<script setup>
import { ref } from 'vue';
import MenuTask from '../menu/MenuTask.vue';

const notFound = ref(false);
const viewCount = ref("");
const duration = ref("");
const publishedAt = ref("");

const props = defineProps({
    data: {
        type: Object,
        require: true
    }
})

// Hàm chuyển đổi một chuỗi thành định dạng theo các đơn vị "K", "M", hoặc "B".
function formatViewCount(count) {
    if (count >= 1_000_000_000) {
        return (count >= 10_000_000_000 ? (count / 1_000_000_000).toFixed(0) : (count / 1_000_000_000).toFixed(1)) + " B";
    } else if (count >= 1_000_000) {
        return (count >= 10_000_000 ? (count / 1_000_000).toFixed(0) : (count / 1_000_000).toFixed(1)) + " M";
    } else if (count >= 1_000) {
        return (count >= 10_000 ? (count / 1_000).toFixed(0) : (count / 1_000).toFixed(1)) + " K";
    } else {
        return count; // trả về một số nếu nó ít hơn 1.000
    }
}

// Hàm tính khoảng cách thời gian
function timeAgo(dateString) {
    const now = new Date();
    const pastDate = new Date(dateString);

    const diffInMs = now - pastDate;
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
        return `${years} năm trước`;
    } else if (months >= 0) {
        return `${months} tháng trước`;
    } else if (days > 0) {
        return `${days} ngày trước`;
    } else {
        return 'Hôm nay';
    }
}

function formatDuration(duration) {
    // Tạo đối tượng RegExp để trích xuất phút và giây
    const match = duration.match(/PT(\d+)M(\d+)S/);
    if (match) {
        // Trích xuất phút và giây
        const minutes = match[1];
        const seconds = match[2];

        // Định dạng kết quả thành "phút:giây"
        return `${minutes}:${seconds.padStart(2, '0')}`;
    }

    return 'Invalid format'; // Hoặc có thể trả về một giá trị mặc định
}

// Kiểm tra video bị xóa
if (props.data.VideoTile === null) {
    notFound.value = true;
}
else {
    // Định dạng lượt xem
    viewCount.value = formatViewCount(props.data.ViewCount);
    // Định dạng thời lượng video
    duration.value = formatDuration(props.data.Duration);
    // Lấy khoảng thời gian phát hành đến hiện tại
    publishedAt.value = timeAgo(props.data.PublishedAt);
}

</script>

<style scoped>
#video {
    display: flex;
    align-items: center;
    border-radius: 12px;
    text-align: start;
    /* transition: all 0.3s ease-in-out; */
}

#video:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

/* Index */
#index-container #icon {
    padding: 0 6px;
    fill: #fff;
}

/* Content */
#content {
    display: flex;
    flex: 1;
    padding: 8px 0;
    cursor: pointer;
}

/* Menu */
#menu {
    width: 40px;
}

/* Thumbnail */
#thumbnail-container {
    width: 320px;
    height: 180px;
    margin-right: 8px;
}

#thumbnail {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: pointer;
    position: relative;
}

#thumbnail img {
    width: 320px;
    height: 240px;
    margin: -30px 0 0 0;
}

/* Time status */
#time-status {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 4px;
}

#time-status .badge-shape {
    background-color: rgba(0, 0, 0, 0.6);
}

#time-status .text {
    color: #fff;
    font-size: 1.2rem;
    line-height: 1.5rem;
    font-weight: 500;
}

/* Meta */
#meta {
    flex: 1;
    flex-basis: 0.0000001px;
}

/* Title video */
.video-title-container {
    margin-bottom: 10px;
}

#video-title {
    color: #29911f;
    font-size: 2.2rem;
    line-height: 2.2rem;
}

/* Metadata */
#byline-container {
    align-items: center;
    color: #aaa;
}

/* Separator */
#separator {
    display: inline-block;
    margin: 0 4px;
    font-size: 1.4rem;
    line-height: 1.8rem;
    font-weight: 400;
}

/* Video info */
#video-info,
#channel-name {
    font-size: 1.6rem;
    line-height: 1.8rem;
    font-weight: 400;
}

/* Video error */
#video-title.error {
    color: rgb(189, 9, 9);
}
</style>