<template>
    <aside class="popup-overlay">
        <div class="popup-content" @click.stop>
            <h2 class="popup-h2">{{ labelH2 }}</h2>
            <InputForm
                label="Enter URL playlist:"
                placeholder="https://www.youtube.com/playlist?list="
                @inputValue="(payload) => onsubmit(payload.inputValue)"
            />
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
            <Loading v-if="isLoading" />
            <p
                v-else
                class="playlist-add-status"
                :class="{ isAdded: isAddedStatus }"
            >
                {{ playlistAddStatus }}
            </p>
        </div>
    </aside>
</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue';
import InputForm from '../input/InputForm.vue';
import Loading from '../loading/Loading.vue';
import emitter from '../../eventBus';

const props = defineProps({
    labelH2: {
        type: String,
        Required: true,
    },
})

const playlistAddStatus = ref('');
const isLoading = ref(false);
const isAddedStatus = ref(false);

// Định nghĩa emit để truyền sự kiện giữa parrent và child
const emit = defineEmits(['close-popup']);

// Sự lý sự kiện click
const closePopup = () => {
    if (!isLoading.value) {
        emit('close-popup');
    }
}


// Xử lý sự kiện submit form
const onsubmit = async (inputValue) => {
    // hiện Loading-page trong khi đợi
    isLoading.value = true;

    try {
        // Gọi api để add playlist vào database
        const response = await axios.get('/api/video/fetch', {
            params: {
                inputValue: inputValue
            }
        });

        // Lấy trạng thái api
        const data = await response.data;

        // Kiểm tra xem playlist đã được thêm thành công thay chưa
        if (data.isAdded) {
            playlistAddStatus.value = "Added playlist successfully";
            isAddedStatus.value = true;
        }
        else {
            isAddedStatus.value = false;
            playlistAddStatus.value = response.data.message;
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
    height: 40%;
    padding-bottom: 10px;
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