<template>
    <main id="contents" className="contents">
        <VideoYoutube v-for="(item, index) in data" :key="index" :data="item" />
    </main>
</template>

<script setup>
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';
import emitter from '../../eventBus';

import VideoYoutube from './VideoYoutube.vue';

// const items = ref(Array.from({ length: 50 }, (_, index) => index + 1));
const data = ref([]);

// Hàm gọi api để lấy dữ liệu từ DB
const fetchData = async () => {
    try {
        // Gọi API backend 
        const response = await axios.get("/api/video/get");
    
        data.value =  await response.data.videos;

        // Gửi sự kiện loading cho view Home
        emitter.emit('loading-page');

    } catch (error) {
        // Xử lý lỗi mạng
        emitter.emit('error-page', {
            errorMessage: error.message
        });
        console.log(error.message)
    } 
    finally {
        emitter.emit('loading-page');
    }
};

onMounted(() => {
    fetchData()
});

onUnmounted(() => {
    fetchData
})
</script>

<style scoped>
#content {
    width: 100%;
}
</style>