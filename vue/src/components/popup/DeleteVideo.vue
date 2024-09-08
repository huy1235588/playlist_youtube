<template>
    <aside class="popup-overlay">
        <div class="popup-content" @click.stop>
            <h2 class="popup-h2">{{ videoId }}</h2>
            <p class="confirm-text">Are you sure want to delete this video?</p>
            <button class="close-popup" @click="closePopup">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        d="m12.71 12 8.15 8.15-.71.71L12 12.71l-8.15 8.15-.71-.71L11.29 12 3.15 3.85l.71-.71L12 11.29l8.15-8.15.71.71L12.71 12z"
                    ></path>
                </svg>
            </button>

            <div class="button-container">
                <button class="button-yes" @click="deleteVideo">YES</button>
                <button class="button-no" @click="closePopup">NO</button>
            </div>

            <Loading v-if="isLoading" />
            <p
                v-else
                class="video-delete-status"
                :class="{ isDeleted: isDeletedVideo }"
            >
                {{ deleteVideoText }}
            </p>
        </div>
    </aside>
</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue';
import Loading from '../loading/Loading.vue';

const props = defineProps({
    indexVideo: {
        type: Number,
        Required: true,
    },
    dataVideo: {
        type: Object,
        Required: true,
    }
})

const deleteVideoText = ref('');
const isDeletedVideo = ref(false);
const isLoading = ref(false);

const videoId = ref('');

// Định nghĩa emit để truyền sự kiện giữa parrent và child
const emit = defineEmits(['close-popup']);

// Sự lý sự kiện click
const closePopup = () => {
    emit('close-popup');
}

// Hàm để xử lý data nhận từ sự kiện
videoId.value = props.dataVideo.videoId;

// Xử lý sự kiện submit form
const deleteVideo = async (inputValue) => {
    // hiện Loading-page trong khi đợi
    isLoading.value = true;

    try {
        // Gọi api để add playlist vào database
        const response = await axios.get('/api/video/delete', {
            params: {
                videoId: props.dataVideo.videoId,
            }
        });

        // Lấy trạng thái api
        const data = await response.data;

        // Kiểm tra xem playlist đã được thêm thành công thay chưa
        if (data.isDeleted) {
            deleteVideoText.value = "Delete video successfully";
            isDeletedVideo.value = true;
        }
        else {
            isDeletedVideo.value = false;
            deleteVideoText.value = response.data.message;
        }

    } catch (error) {
        // Xử lý lỗi mạng
        emitter.emit('error-page', {
            errorMessage: error.message
        });

    } finally {
        isLoading.value = false;
    }
}

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
    min-height: 35%;
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

.video-delete-status {
    font-size: 20px;
    font-weight: 700;
    color: rgb(255, 0, 0);
}

.video-delete-status.isDeleted {
    color: rgb(22, 222, 22);
}

.confirm-text {
    font-size: 30px;
    font-weight: 600;
    color: #fa2424;
}

.button-container {
    display: flex;
    justify-content: space-between;
    width: 30%;
    height: 40px;
    margin: 0 auto;
}

.button-container button {
    padding: 10px 25px;
    border-radius: 8px;
    font-size: 15px;
    transition: all 0.3s;
}

.button-container .button-yes {
    background-color: rgb(0, 102, 255);
    color: #ffffff;
}

.button-container .button-yes:hover {
    background-color: rgba(0, 102, 255, 0.664);
}

.button-container .button-yes:active {
    background-color: rgb(0, 102, 255);
}

.button-container .button-no {
    background-color: unset;
    color: #ffffff;
}

.button-container .button-no:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.button-container .button-no:active {
    background-color: unset;
}
</style>