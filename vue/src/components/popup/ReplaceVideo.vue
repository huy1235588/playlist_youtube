<template>
    <aside class="popup-overlay">
        <div class="popup-content" @click.stop>
            <h2 class="popup-h2">{{ videoId }}</h2>
            <InputForm 
                label="Nhập URL video:"
                placeholder="https://www.youtube.com/watch?v="
            />
            <button class="popup-button" @click="handleClick">Close</button>
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
    height: 60%;
    text-align: center;
}

.popup-h2{
    width: 700px;
    margin: 40px 0;
}

.popup-button{
    margin-top: 20px;
}
</style>