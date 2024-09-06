<template>
    <aside class="popup-overlay">
        <div class="popup-content" @click.stop>
            <h2 class="popup-h2">{{ labelH2 }}</h2>
       
        </div>
    </aside>
</template>

<script setup>
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';
import emitter from '../../eventBus';

const props = defineProps({
    labelH2: {
        type: String,
        Required: true,
    },
})

// Định nghĩa emit để truyền sự kiện giữa parrent và child
const emit = defineEmits(['close-popup']);

// Sự lý sự kiện click
const closePopup = () => {
    emit('close-popup');
}


const getPlaylist = async () => {
    try {
        // Gọi API backend 

    } catch (error) {
        // Xử lý lỗi mạng
        emitter.emit('error-page', {
            errorMessage: error.message
        });
    }
};

onMounted(() => {
    getPlaylist();
});

onUnmounted(() => {
    getPlaylist();
});

</script>

<style scoped>
/* Định dạng nền mờ khi hiển thị popup */
.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
}

/* Định dạng nội dung của popup */
.popup-content {
    position: relative;
    background-color: rgb(87, 87, 87);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    max-width: 90%;
    height: 40%;
    text-align: center;
}

.popup-h2 {
    width: 700px;
    margin: 40px 0;
}

.close-popup {
    position: absolute;
    display: flex;
    align-items: center;
    top: 0;
    right: 0;
    padding: 10px;
    border-top-right-radius: 8px;
    background-color: transparent;
    cursor: pointer;
    transition: all 0.2s;
}

.close-popup:hover {
    background-color: #ff0000;
}

.close-popup svg {
    height: 18px;
    transition: all 0.3s;
    width: 25px;
    height: 25px;
}

.close-popup svg path {
    transition: all 0.3s;
    fill: #ffffff;
    stroke: rgb(255, 255, 255);
}

.close-popup:hover svg path {
    fill: #3c3c3c;
    stroke: white;
}

.playlist-add-status {
    font-size: 20px;
    font-weight: 700;
    color: rgb(255, 0, 0);
}

.playlist-add-status.isAdded {
    color: rgb(22, 222, 22);
}
</style>