<template>
    <div>
        <LoadingPage v-if="loading" />
        <router-view v-else />
    </div>
</template>


<script setup>
import { ref, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router'; 

import LoadingPage from './components/LoadingPage.vue';

// Khai báo state với ref
const loading = ref(false);

// Lấy thông tin về route
const route = useRoute();

// Theo dõi sự thay đổi của route
watch(route, () => {
    loading.value = true;
    nextTick(() => {
        loading.value = false;
    });
});

</script>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
