<template>
    <section :id="'video-' + indexVideo" class="video flex">
        <div id="index-container">
            {{ index }}
            <!-- <div id="icon">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                    focusable="false"
                    aria-hidden="true"
                    style="
                        pointer-events: none;
                        display: inherit;
                        width: 100%;
                        height: 100%;
                    "
                >
                    <path d="M21 10H3V9h18v1Zm0 4H3v1h18v-1Z"></path>
                </svg>
            </div> -->
        </div>
        <div id="content">
            <div id="thumbnail-container">
                <a id="thumbnail">
                    <!-- Hình ảnh video -->
                    <img v-if="notFound" :src="NoThumbail" alt="" />
                    <img v-else :src="thumbnails" alt="" />
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
                    <a
                        v-if="notFound"
                        :href="videoId"
                        id="video-title"
                        class="error"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        [Not Found]
                    </a>
                    <a
                        v-else
                        :href="videoId"
                        id="video-title"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {{ videoTitle }}
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
                                                {{ channelTitle }}
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
                                    {{ viewCount }} lượt xem</span
                                >
                                <span id="separator"> • </span>
                                <span id="published-at">{{ publishedAt }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="menu">
            <MenuTask :indexVideo="indexVideo" :data="data" :playlist="playlist"/>
        </div>
    </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import MenuTask from '../menu/MenuTask.vue';
import NoThumbail from '../../assets/no_thumbnail.jpg'

const notFound = ref(false);
const videoId = ref("");
const videoTitle = ref("");
const channelTitle = ref("");
const viewCount = ref("");
const duration = ref("");
const publishedAt = ref("");
const thumbnails = ref("");
const indexVideo = ref(0);
const index = ref("");

const props = defineProps({
    index: {
        type: Number,
        required: true,
    },
    data: {
        type: Object,
        required: true,
    },
    playlist: {
        type: Object,
        required: true,
    },
})

function formatVideoId(id) {
    return 'https://youtube.com/watch?v=' + id;
}

// Hàm chuyển đổi một chuỗi thành định dạng theo các đơn vị "K", "M", hoặc "B".
function formatViewCount(count) {
    if (count >= 1_000_000_000) {
        return (count / 1_000_000_000).toFixed(count >= 10_000_000_000 ? 0 : 1) + " B";
    } else if (count >= 1_000_000) {
        return (count / 1_000_000).toFixed(count >= 10_000_000 ? 0 : 1) + " M";
    } else if (count >= 1_000) {
        return (count / 1_000).toFixed(count >= 10_000 ? 0 : 1) + " K";
    }
    return count;
}

// Hàm tính khoảng cách thời gian
function timeAgo(dateString) {
    const now = new Date();
    const pastDate = new Date(dateString);

    const diffInDays = Math.floor((now - pastDate) / (1000 * 60 * 60 * 24));

    if (diffInDays >= 365) {
        return `${Math.floor(diffInDays / 365)} năm trước`;
    } else if (diffInDays >= 30) {
        return `${Math.floor(diffInDays / 30)} tháng trước`;
    } else if (diffInDays > 0) {
        return `${diffInDays} ngày trước`;
    }
    return 'Hôm nay';
}

function formatDuration(duration) {
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


function formatData() {
    // Định dạng VideoId
    videoId.value = formatVideoId(props.data.VideoId);

    // Kiểm tra video bị xóa
    if (props.data.Duration !== null) {
        videoTitle.value = props.data.VideoTitle;
        channelTitle.value = props.data.ChannelTitle;
        thumbnails.value = props.data.Thumbnails;
        indexVideo.value = props.data.IndexVideo;
        index.value = props.index + 1;
        if (index.value >= 135) {
            index.value++;
        }

        // Định dạng lượt xem
        viewCount.value = formatViewCount(props.data.ViewCount);
        // Định dạng thời lượng video
        duration.value = formatDuration(props.data.Duration);
        // Lấy khoảng thời gian phát hành đến hiện tại
        publishedAt.value = timeAgo(props.data.PublishedAt);

        notFound.value = false;
    }
    else {
        notFound.value = true;
    }
}

onMounted(() => {
    formatData();
});

onUnmounted(() => {
    formatData();
});

// Theo dõi các thay đổi trong props.data
watch(() => props.data, formatData, { deep: true });

</script>

<style scoped>
.video {
    display: flex;
    align-items: center;
    border-radius: 12px;
    text-align: start;
    /* transition: all 0.3s ease-in-out; */
}

.video:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

/* Index */
#index-container {
    padding: 0 13px;
    font-size: 20px;
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