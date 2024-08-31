<!-- src/pages/Home.vue -->
<template>
    <LoadingPage v-if="loading" />
    <div v-else id="content">
        <InputForm
            placeholder="Search. . ."
            type="text"
            autocomplete="off"
            :onSubmit="fetchData"
            @updateInputValue="receiveInputValue"
        />
        <PlaylistVideo />

        <HelloWorld :msg="outputValue" />
    </div>
    <section id="popup-container">
        <MenuPopup />
    </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from 'vue-router';
import axios from "axios";

import HelloWorld from "../components/HelloWorld.vue";
import LoadingPage from "../components/LoadingPage.vue";
import InputForm from "../components/input/InputForm.vue";
import PlaylistVideo from "../components/Contents/PlaylistVideo.vue";
import MenuPopup from "../components/menu/MenuPopup.vue";

import emitter from "../eventBus";

const loading = ref(false);
const error = ref(null);

const data = ref(null);
const inputValue = ref("");
const outputValue = ref("");

const router = useRouter();

// Hàm gọi api
const fetchData = async () => {
    loadingPage();
    error.value = null;

    try {
        // Gọi API backend
        const response = await axios.get("/api/videos/fetch", {
            params: { inputValue: inputValue.value }
        });

        const data = await response.data;

        outputValue.value = data;

    } catch (err) {
        // Xử lý lỗi mạng
        error.value = err.message;
        router.push({ path: '/error', query: { error: error.value } });
    } finally {
        loadingPage();
    }
};

// Hàm để loading page khi gọi api
const loadingPage = () => {
    loading.value = !loading.value;
}

// Hàm để hiển thị error page khi gọi api
const errorPage = (payload) => {
    error.value = !error.value;
    if (error.value !== null) {
        router.push({ path: '/error', query: { error: payload.errorMessage } });
    }
}

// Nhận giá trị từ input
const receiveInputValue = (value) => {
    inputValue.value = value;
};

onMounted(() => {
    emitter.on("loading-page", loadingPage);
    emitter.on("error-page", errorPage);
})

onUnmounted(() => {
    emitter.off("loading-page", loadingPage);
    emitter.off("error-page", errorPage);
})

</script>

<style scoped>
#content {
    width: 90vw;
}
</style>