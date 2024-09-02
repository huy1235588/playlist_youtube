<template>
    <aside class="popup-overlay">
        <div class="popup-content" @click.stop>
            <h2 class="popup-h2">{{ videoId }}</h2>
            <InputForm
                label="Nhập URL video:"
                placeholder="https://www.youtube.com/watch?v="
            />
            <button class="close-popup" @click="handleClick">
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
        </div>
    </aside>
</template>

<script setup>
import InputForm from '../input/InputForm.vue';

const props = defineProps({
    indexVideo: {
        type: Number,
        Required: true,
    },
})

const videoId = document.querySelector(`#video-${props.indexVideo} #video-title`).textContent;

// Định nghĩa emit để truyền sự kiện giữa parrent và child
const emit = defineEmits(['close-popup']);

// Sự lý sự kiện click
const handleClick = () => {
    emit('close-popup');
}
</script>

<style>
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
    background-color: rgb(87, 87, 87);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    max-width: 90%;
    height: 35%;
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
    top: 11.325rem;
    right: 18.75rem;
    padding: 10px;
    margin-top: 20px;
    border-top-right-radius: 8px;
    background-color: transparent;
    cursor: pointer;
    transition: all 0.2s;
}

.close-popup:hover{
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

</style>