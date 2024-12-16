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
                    @select-playlist="(payload) => selectPlaylist(payload)"
                />
            </div>
        </section>
        <div v-else-if="!isShowHiddenVideo">
            <h2>
                {{ playlist.Title }}
            </h2>
            <VideoYoutube
                v-for="(item, index) in data"
                :key="index"
                :index="index"
                :data="item"
                :playlist="playlist"
            />
        </div>
        <hiddenVideo
            v-else
            v-for="(itemHidden, indexHidden) in dataHidden"
            :key="indexHidden"
            :data="itemHidden"
            :playlist="playlist"
        />

        <LoadingVideo v-if="isLoadVideo"> </LoadingVideo>
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

import LoadingVideo from '../loading/LoadingVideo.vue';

const data = ref([]); // giữ dữ liệu video
const dataPlaylist = ref([]); // giữ dữ liệu playlists
const dataHidden = ref([]); // giữ dữ liệu video bị ẩn
const input = ref('');
const isShowHiddenVideo = ref(false);
const isNoPlaylist = ref(false);
const isPlaylistYoutube = ref(false);
const isLoadVideo = ref(false);

const playlistId = ref(''); // Giữ playlistId
const playlists = ref([]) // Giữ mảng dữ liệu playlist đã chọn
const playlist = ref({}) // Giữ dữ liệu playlist đã chọn

let videoStart = 1;
let isFetching = false; // ngăn chặn việc gọi API nhiều lần
const isOverVideo = ref(false)

// Hàm khi chọn playlist
const selectPlaylist = async (payload) => {
    playlistId.value = payload.playlistId;
    isShowHiddenVideo.value = false;
    isPlaylistYoutube.value = false;
    // Tìm playlist đã chọn
    playlist.value = playlists.value.find(item => item.PlaylistId === playlistId.value);

    await firstFetchData();

    // Truyền playlistId
    emitter.emit('selected-playlist', {
        playlistId: payload.playlistId,
        playlistName: payload.playlistName,
        videoId: data.value[0].VideoId
    });
}

// Hàm để lấy playlist
const getPlaylist = async () => {
    isNoPlaylist.value = true; // set 

    try {
        // Gọi api
        const response = await axios.get('/api/playlist/get');

        // Lấy dữ liệu
        playlists.value = await response.data.playlists;

        // Kiểm tra nếu có playlist trong database
        if (playlists.value.length > 0) {
            isPlaylistYoutube.value = true;
            isNoPlaylist.value = false; // set 
            dataPlaylist.value = playlists.value || [];
        }

    } catch (error) {
        // Xử lý lỗi mạng
        emitter.emit('error-page', {
            errorMessage: error.message
        });
    }
}

// Hàm để tải video lần đầu
const firstFetchData = async (payload = {}) => {
    videoStart = 1;
    await fetchData(payload);
}

// Hàm gọi api để lấy dữ liệu từ DB
const fetchData = async (payload = {}) => {
    try {
        const { column = "AddedAt", order = "Desc" } = payload;

        // Đánh dấu đang gọi API
        isFetching = true;

        // Gọi API backend 
        const response = await axios.get("/api/video/get", {
            params: {
                PageNumber: videoStart,
                PageSize: 50,
                column: column,
                order: order,
                playlistId: playlistId.value,
            }
        });

        // Kiểm tra đã có video chưa
        if (videoStart === 1) {
            data.value = response.data.videos || [];
        }
        else {
            // dữ liệu với các video đã tải về
            const newVideos = response.data.videos || [];

            // Gộp video mới với video hiện tại
            data.value = [...data.value, ...newVideos];
        }

        if (response.data.isOverVideo) {
            isOverVideo.value = true;
        }

        // Cập nhật videoStart
        videoStart += 1;

        // Đặt lại cờ
        isFetching = false;

    } catch (error) {
        // Đặt lại cờ khi gặp lỗi
        isFetching = false;
        // Xử lý lỗi mạng
        emitter.emit('error-page', {
            errorMessage: error.message
        });
    }
};

const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const bottomPosition = document.documentElement.scrollHeight;

    if (scrollPosition >= bottomPosition - 10 && !isFetching && !isPlaylistYoutube.value && !isOverVideo.value) {
        isLoadVideo.value = true;
        fetchData();
    } else {
        isLoadVideo.value = false;
    }
};

// Hàm gọi api để tìm video từ DB
const searchVideo = async (payload) => {
    isShowHiddenVideo.value = false;
    isOverVideo.value = true;

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
       firstFetchData();
    }
}

// Hàm để hiện video bị ẩn
const showHiddenVideo = async () => {
    try {
        isShowHiddenVideo.value = !isShowHiddenVideo.value;

        const response = await axios.get('/api/video/get/hidden-video', {
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
    emitter.on('change-playlist', getPlaylist); // Lấy dữ liệu sự kiện lắng nghe "change-playlist"
    emitter.on('filter', firstFetchData); // Lấy dữ liệu sự kiện lắng nghe "filter"
    emitter.on('show-hidden-video', showHiddenVideo); // Lấy dữ liệu sự kiện lắng nghe "filter"
    emitter.on('search-video', searchVideo); // Lấy dữ liệu sự kiện lắng nghe "search-video"
    window.addEventListener('scroll', handleScroll); // Sự kiện cuộn đến cuối trang
});

onUnmounted(() => {
    getPlaylist();
    emitter.off('change-playlist', getPlaylist);
    emitter.off('filter', firstFetchData);
    emitter.off('show-hidden-video', showHiddenVideo);
    emitter.off('search-video', searchVideo);
    window.removeEventListener('scroll', handleScroll);
})
</script>

<style scoped>
#content {
    width: 100%;
}

#contents {
    display: flex;
    justify-content: center;
    width: 100%;
    margin: 0 auto;
}
</style>