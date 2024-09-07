<template>
    <section
        :id="'playlist-' + playlistId"
        @mouseover="isHover = true"
        @mouseleave="isHover = false"
    >
        <div id="content">
            <div id="thumbnail-container">
                <a id="thumbnail">
                    <!-- Hình ảnh video -->
                    <img v-if="notFound" :src="NoThumbail" alt="" />
                    <img v-else :src="thumbnails" alt="" />
                    <div id="overplay">
                        <!-- Số lượng video -->
                        <div id="item-count">
                            <div class="badge-shape">
                                <div class="icon">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        width="16"
                                        focusable="false"
                                        aria-hidden="true"
                                        style="
                                            pointer-events: none;
                                            display: inherit;
                                            width: 100%;
                                            height: 100%;
                                        "
                                    >
                                        <path
                                            d="M22 7H2v1h20V7zm-9 5H2v-1h11v1zm0 4H2v-1h11v1zm2 3v-8l7 4-7 4z"
                                        ></path>
                                    </svg>
                                </div>
                                <span class="text">{{ itemCount }} video</span>
                            </div>
                        </div>
                    </div>
                    <div
                        class="thumbnail-hover"
                        :class="{ 'thumbnail-hovered': isHover }"
                    >
                        <div class="thumbnail-hover-overplay">
                            <div class="thumbnail-hover-icon">
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
                                        width: 24px;
                                        height: 24px;
                                        fill: #fff;
                                    "
                                >
                                    <path d="m7 4 12 8-12 8V4z"></path>
                                </svg>
                            </div>
                            <span class="thumbnail-hover-text">Xem tất cả</span>
                        </div>
                    </div>
                </a>
            </div>

            <div id="meta">
                <!-- Tên Playlist -->
                <h3 class="playlist-title-container">
                    <a
                        v-if="notFound"
                        id="playlist-title"
                        class="error"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        [Not Found]
                    </a>
                    <a
                        v-else
                        id="playlist-title"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {{ title }}
                    </a>
                </h3>
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
            </div>
        </div>
        <!-- <div id="menu">
            <MenuTask :indexVideo="playlistId" />
        </div> -->
    </section>
</template>

<script setup>

import { onMounted, onUnmounted, ref } from 'vue';
const props = defineProps({
    data: {
        type: Object,
        required: true,
    }
})

const playlistId = ref('');
const title = ref('');
const thumbnails = ref('');
const channelTitle = ref('');
const itemCount = ref('');
const publishedAt = ref('');
const notFound = ref('');

const isHover = ref(false);

function formatData() {    
    // Kiểm tra video bị xóa
    if (props.data.title !== null) {        
        playlistId.value = props.data.PlaylistId;
        title.value = props.data.Title;
        thumbnails.value = props.data.Thumbnails;
        channelTitle.value = props.data.ChannelTitle;
        itemCount.value = props.data.ItemCount;
        
        // Lấy khoảng thời gian phát hành đến hiện tại
        publishedAt.value = props.data.PublishedAt;

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
</script>

<style scoped>
section {
    width: calc(100% / 3);
    height: 200px;
    margin-right: 20px;
}

#content {
    width: 100%;
    height: 100%;
}

/* Thumbnail */
#thumbnail-container {
    width: 100%;
    height: 100%;
    /* margin-right: 8px; */
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
    width: 384px;
    height: 268px;
    margin: -34px 0 0 0;
}

/* Item-count */
#item-count {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 4px;
}

#item-count .badge-shape {
    display: flex;
    align-items: center;
    padding: 1px 4px;
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.6);
}

#item-count .text {
    color: #fff;
    font-size: 13px;
    line-height: 20px;
    font-weight: 500;
}

.icon {
    margin-right: 4px;
}

/* Thumbnail hover */
.thumbnail-hover {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.thumbnail-hover-overplay {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
}
.thumbnail-hover-text {
    color: #fff;
}

.thumbnail-hovered {
    opacity: 1;
}

/* Meta */
#meta {
    cursor: pointer;
    /* background-color: #000; */
}

/* Title playlist */
.playlist-title-container {
    padding: 10px;
}

#playlist-title {
    color: #29911f;
    font-size: 20px;
    line-height: 20px;
}
</style>