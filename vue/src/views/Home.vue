<!-- src/pages/Home.vue -->
<template>
    <LoadingPage v-if="loading" />
    <div v-else id="content">
        <div class="grid">
            <InputSearch
                placeholder="Search. . ."
                type="text"
                autocomplete="off"
                @updateInputValue="receiveInputValue"
            />
            <Setting />
            <FIlterMenu />
        </div>
        <PlaylistVideo />

        <HelloWorld :msg="outputValue" />
    </div>
    <section id="popup-container">
        <MenuPopup />
        <PlaylistMenuPopup />
    </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from 'vue-router';
import axios from "axios";

import HelloWorld from "../components/HelloWorld.vue";
import LoadingPage from "../components/LoadingPage.vue";
import InputSearch from "../components/input/InputSearch.vue";
import Setting from "../components/settings/Setting.vue";
import FIlterMenu from "../components/filter/FIlterMenu.vue";
import PlaylistVideo from "../components/Contents/PlaylistVideo.vue";
import MenuPopup from "../components/menu/MenuPopup.vue";
import PlaylistMenuPopup from "../components/menu/PlaylistMenuPopup.vue";

import emitter from "../eventBus";

const loading = ref(false);
const error = ref(null);

const inputValue = ref("");
const outputValue = ref("");

const router = useRouter();

// Nhận giá trị từ input
const receiveInputValue = (value) => {
    inputValue.value = value;
};

// Hàm để loading page khi gọi api
const loadingPage = (payload) => {
    console.log(payload)
    loading.value = payload || !loading.value;
}

// Hàm để hiển thị error page khi gọi api
const errorPage = (payload) => {
    error.value = !error.value;
    if (error.value !== null) {
        router.push({ path: '/error', query: { error: payload.errorMessage } });
    }
}

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
.grid{
    display: grid;
    grid-template-columns: repeat(2, 0fr);
    grid-template-rows: repeat(2, 0fr);
    row-gap: 10px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}
</style>