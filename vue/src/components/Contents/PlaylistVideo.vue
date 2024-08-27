<template>
    <main id="contents" className="contents">
        <VideoYoutube
            v-for="(item, index) in items"
            :key="index"
            :index="index + 1"
        />
    </main>
</template>

<script setup>
import VideoYoutube from './VideoYoutube.vue';
const items =  ['item1', 'item2', 'item3'];

</script>

<style scoped>
#content {
    width: 100%;
}
</style>