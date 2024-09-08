<template>
    <section
        :id="'playlist-' + playlistId"
        class="playlist-item"
        @mouseover="isHover = true"
        @mouseleave="isHover = false"
        @click="selectPlaylist"
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
                            <span class="thumbnail-hover-text no-select"
                                >Xem tất cả</span
                            >
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
                        class="error no-select"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        [Not Found]
                    </a>
                    <a
                        v-else
                        id="playlist-title"
                        class="no-select"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {{ title }}
                    </a>
                    <div id="menu">
                        <!-- <p>Go entire playlist video</p> -->
                        <PlaylistMenu @click.stop :indexVideo="playlistId" />
                    </div>
                </h3>
                <!-- Tên channel -->
                <div id="channel-name">
                    <div class="channel-container">
                        <!-- Thumbnail Channel -->
                        <div class="thumbnail-channel">
                            <a class="thumbnail-channel-overplay">
                                <!-- Hình ảnh video -->
                                <img :src="channel.Thumbnails" alt="" />
                            </a>
                        </div>
                        <!-- Tên Channel -->
                        <div id="text-container">
                            <div id="text">
                                <a v-if="notFound" href=""></a>
                                <a
                                    v-else
                                    class="no-select"
                                    :href="channelId"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {{ channel.Title }}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';

import PlaylistMenu from '../menu/PlaylistMenu.vue';

const props = defineProps({
    data: {
        type: Object,
        required: true,
    }
})

const playlistId = ref('');
const title = ref('');
const thumbnails = ref('');
const channelId = ref('');
const channelTitle = ref('');
const itemCount = ref('');
const notFound = ref('');

const isHover = ref(false);
const channel = ref([]);

const emit = defineEmits(['select-playlist']);

function formatChannelId(id) {
    return 'https://youtube.com/channel/' + id;
}

async function formatData() {
    try {
        const response = await axios.get('api/channel/get', {
            params: {
                channelId: props.data.ChannelId,
            }
        });

        channel.value = await response.data.channel[0];

    } catch (error) {
        // Xử lý lỗi mạng
        emitter.emit('error-page', {
            errorMessage: error.message
        });
    }

    channelId.value = formatChannelId(props.data.ChannelId);

    // Kiểm tra playlist bị xóa
    if (props.data.title !== null) {
        playlistId.value = props.data.PlaylistId;
        title.value = props.data.Title;
        thumbnails.value = props.data.Thumbnails;
        channelTitle.value = props.data.ChannelTitle;
        itemCount.value = props.data.ItemCount;

        notFound.value = false;
    }
    else {
        notFound.value = true;
    }
}

function selectPlaylist() {
    emit('select-playlist', {
        playlistId: props.data.PlaylistId,
    });
}

onMounted(() => {
    formatData();
});

onUnmounted(() => {
    formatData();
});
</script>

<style scoped>
@media only screen and (max-width: 576px) {
    .playlist-item {
        width: 36px;
        background-color: #13ce23;
    }
}

.playlist-item {
    width: 336px;
    min-height: 300px;
    margin-right: 20px;
    padding: 10px;
    background-color: rgb(22, 22, 22);
    cursor: pointer;
}

.playlist-item:nth-child(3){
    margin-right: 0;
}

#content {
    width: 100%;
    height: 100%;
}

/* Thumbnail */
#thumbnail-container {
    width: 100%;
    height: 200px;
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
    width: 330px;
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
    text-align: start;
    display: grid;
}

/* Title playlist */
.playlist-title-container {
    display: flex;
    align-items: center;
    height: 50px;
    padding: 10px;
}

#playlist-title {
    flex: 1;
    color: #13ce23;
    font-size: 40px;
    line-height: 20px;
}

/* Channel */
#channel-name {
}

.channel-container {
    display: flex;
}

#channel-name #text a {
    color: #fff;
}

/* Thumbnail Channel */
.thumbnail-channel {
    margin-right: 10px;
}

.thumbnail-channel-overplay {
    display: inline-block;
    width: 30px;
    height: 30px;
    border-radius: 100%;
    overflow: hidden;
}

.thumbnail-channel-overplay img {
    width: 100%;
    height: 100%;
}

/* Menu */
#menu {
    font-size: 0;
}
</style>