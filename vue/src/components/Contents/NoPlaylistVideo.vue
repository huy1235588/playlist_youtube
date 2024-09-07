<template>
    <section>
        <h1>No Playlist added</h1>
        <button class="add-playlist" @click="handleClick()">
            Add new playlist
        </button>
        <AddPlaylist
            v-if="isAddPlaylist"
            labelH2="ADD NEW PLAYLIST"
            @click="closePopup"
            @close-popup="closePopup()"
        />
    </section>
</template>

<script setup>
import { ref } from 'vue';
import AddPlaylist from '../popup/AddPlaylist.vue';

const isAddPlaylist = ref(false);

const handleClick = () => {
    isAddPlaylist.value = true;
}

const closePopup = () => {
    isAddPlaylist.value = false;
}
</script>

<style scoped>
.add-playlist {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 15px 10px;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    cursor: pointer;
    transition: border-color 0.25s;
}
.add-playlist:hover {
    border-color: #646cff;
}
.add-playlist:focus,
.add-playlist:focus-visible {
    outline: 4px auto -webkit-focus-ring-color #646cff;
}
</style>