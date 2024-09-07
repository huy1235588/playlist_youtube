<template>
    <main id="content" className="contents">
        <NoPlaylistVideo v-if="isNoPlaylist" />
        <section v-else-if="isPlaylistYoutube">
            <h1 class="h1-text">Playlist</h1>
            <div id="contents">
                <PlaylistYoutube
                    v-for="(itemPlaylist, indexPlaylist) in dataPlaylist"
                    :key="indexPlaylist"
                    :data="itemPlaylist"
                    @select-playlist="
                        (payload) => selectPlaylist(payload.playlistId)
                    "
                />
            </div>
        </section>
        <VideoYoutube
            v-else-if="!isShowHiddenVideo"
            v-for="(item, index) in data"
            :key="index"
            :data="item"
        />
        <hiddenVideo
            v-else
            v-for="(itemHidden, indexHidden) in dataHidden"
            :key="indexHidden"
            :data="itemHidden"
        />
    </main>
</template>

<script setup>
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';
import emitter from '../../eventBus';

import VideoYoutube from './VideoYoutube.vue';
import HiddenVideo from './HiddenVideo.vue';
import NoPlaylistVideo from './NoPlaylistVideo.vue';
import PlaylistYoutube from './PlaylistYoutube.vue';

const data = ref([]); // giữ dữ liệu video
const dataPlaylist = ref([]); // giữ dữ liệu playlists
const dataHidden = ref([]); // giữ dữ liệu video bị ẩn
const input = ref('');
const isShowHiddenVideo = ref(false);
const isNoPlaylist = ref(false);
const isPlaylistYoutube = ref(false);

const playlistId = ref(''); // Giữ playlistId

const selectPlaylist = (PlaylistId) => {
    playlistId.value = PlaylistId;
    isShowHiddenVideo.value = false;
    isPlaylistYoutube.value = false;

    fetchData();
}

// Hàm để lấy playlist
const getPlaylist = async () => {
    isNoPlaylist.value = true; // set 

    try {
        // Gọi api
        const response = await axios.get('/api/playlist/get');

        // Lấy dữ liệu
        const playlists = await response.data.playlists;

        // Kiểm tra nếu có playlist trong database
        if (playlists.length > 0) {
            isPlaylistYoutube.value = true;
            isNoPlaylist.value = false; // set 
            dataPlaylist.value = playlists || [];
        }

    } catch (error) {
        // Xử lý lỗi mạng
        emitter.emit('error-page', {
            errorMessage: error.message
        });
    }
}

// Hàm gọi api để lấy dữ liệu từ DB
const fetchData = async (payload = {}) => {
    try {
        const { column = "AddedAt", order = "Desc" } = payload;


        // Gọi API backend 
        const response = await axios.get("/api/video/get", {
            params: {
                start: 1,
                end: 50,
                column: column,
                order: order,
                playlistId: playlistId.value,
            }
        });

        // Cập nhật dữ liệu với các video đã tải về
        data.value = await response.data.videos || [];

    } catch (error) {
        // Xử lý lỗi mạng
        emitter.emit('error-page', {
            errorMessage: error.message
        });
    }
};

// Hàm gọi api để tìm video từ DB
const searchVideo = async (payload) => {
    isShowHiddenVideo.value = false;

    input.value = payload.input;
    if (input.value && input.value !== "") {
        try {
            const response = await axios.get('/api/video/search', {
                params: {
                    input: input.value,
                    playlistId: playlistId.value,
                }
            });

            // Cập nhật dữ liệu với các video đã tải về
            data.value = await response.data.videos;

        } catch (error) {
            // Xử lý lỗi mạng
            emitter.emit('error-page', {
                errorMessage: error.message
            });
        }
    }
    else {
        fetchData();
    }
}

// Hàm để hiện video bị ẩn
const showHiddenVideo = async () => {
    try {
        isShowHiddenVideo.value = !isShowHiddenVideo.value;

        const response = await axios.get('/api/video/get/hidden-video',{
            params: {
                playlistId: playlistId.value,
            }
        });

        // Cập nhật dữ liệu với các video đã tải về
        dataHidden.value = await response.data.videos;

    } catch (error) {
        // Xử lý lỗi mạng
        emitter.emit('error-page', {
            errorMessage: error.message
        });
    }
}

onMounted(() => {
    getPlaylist();
    emitter.on('filter', fetchData); // Lấy dữ liệu sự kiện lắng nghe "filter"
    emitter.on('show-hidden-video', showHiddenVideo); // Lấy dữ liệu sự kiện lắng nghe "filter"
    emitter.on('search-video', searchVideo); // Lấy dữ liệu sự kiện lắng nghe "search-video"
});

onUnmounted(() => {
    getPlaylist();
    emitter.off('filter', fetchData);
    emitter.off('show-hidden-video', showHiddenVideo);
    emitter.off('search-video', searchVideo);
})
</script>

<style scoped>
#content {
    width: 100%;
}

#contents {
    display: flex;
}
</style>