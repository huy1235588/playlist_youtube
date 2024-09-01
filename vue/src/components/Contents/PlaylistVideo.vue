<template>
    <main id="contents" className="contents">
        <VideoYoutube v-for="(item, index) in data" :key="index" :data="item" />
    </main>
</template>

<script setup>
import axios from 'axios';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import emitter from '../../eventBus';

import VideoYoutube from './VideoYoutube.vue';

const data = ref([]); // giữ dữ liệu video
const input = ref('');

// Hàm gọi api để lấy dữ liệu từ DB
const fetchData = async (payload = {}) => {
    try {
        const { column = "AddedAt", order = "Desc" } = payload;

        // Gọi API backend 
        const response = await axios.get("/api/video/get", {
            params: {
                start: 1,
                end: 69,
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
    input.value = payload.input;
    if (input.value) {
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
}

onMounted(() => {
    fetchData(); // Lấy dữ liệu ban đầu
    emitter.on('filter', fetchData) // Lấy dữ liệu sự kiện lắng nghe "filter"
    emitter.on('search-video', searchVideo) // Lấy dữ liệu sự kiện lắng nghe "search-video"
});

onUnmounted(() => {
    fetchData();
    emitter.off('filter', fetchData)
    emitter.off('search-video', searchVideo)
})
</script>

<style scoped>
#content {
    width: 100%;
}
</style>