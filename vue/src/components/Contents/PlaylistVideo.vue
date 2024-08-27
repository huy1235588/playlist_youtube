<template>
    <main id="contents" className="contents">
        <VideoYoutube
            v-for="(item) in items"
            :key="item"
            :index="item"
        />
    </main>
</template>

<script setup>
import { ref } from 'vue';

import VideoYoutube from './VideoYoutube.vue';

const items = ref(Array.from({ length: 5 }, (_, index) => index + 1));

</script>

<style scoped>
#content {
    width: 100%;
}
</style>