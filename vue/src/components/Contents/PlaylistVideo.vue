<template>
    <main id="contents" className="contents">
        <VideoYoutube
            v-if="!isShowHiddenVideo"
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
import { computed, onMounted, onUnmounted, ref } from 'vue';
import emitter from '../../eventBus';

import VideoYoutube from './VideoYoutube.vue';
import HiddenVideo from './HiddenVideo.vue';

const data = ref([]); // giữ dữ liệu video
const dataHidden = ref([]); // giữ dữ liệu video bị ẩn
const input = ref('');
const isShowHiddenVideo = ref(false);

// Hàm gọi api để lấy dữ liệu từ DB
const fetchData = async (payload = {}) => {
    try {
        isShowHiddenVideo.value = false;

        const { column = "AddedAt", order = "Desc" } = payload;

        // Gọi API backend 
        const response = await axios.get("/api/video/get", {
            params: {
                start: 1,
                end: 50,
                column: column,
                order: order,
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
                    input: input.value
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

        // const response = await axios.get('/api/video/show-hidden-video');

        // // Cập nhật dữ liệu với các video đã tải về
        // dataHidden.value = await response.data.videos;

    } catch (error) {
        // Xử lý lỗi mạng
        emitter.emit('error-page', {
            errorMessage: error.message
        });
    }
}

onMounted(() => {
    fetchData(); // Lấy dữ liệu ban đầu
    emitter.on('filter', fetchData); // Lấy dữ liệu sự kiện lắng nghe "filter"
    emitter.on('show-hidden-video', showHiddenVideo); // Lấy dữ liệu sự kiện lắng nghe "filter"
    emitter.on('search-video', searchVideo); // Lấy dữ liệu sự kiện lắng nghe "search-video"
});

onUnmounted(() => {
    fetchData();
    emitter.off('filter', fetchData);
    emitter.off('show-hidden-video', showHiddenVideo);
    emitter.off('search-video', searchVideo);
})
</script>

<style scoped>
#content {
    width: 100%;
}
</style>