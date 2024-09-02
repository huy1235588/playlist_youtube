<template>
    <li class="menu-item" v-bind:has-separator="showSeparator">
        <button class="menu-item-container" @click="handleClick">
            <span id="icon">
                <img :src="icon" alt="" />
            </span>
            <div id="menu-service">
                <span>{{ label }} {{ showSeparator }}</span>
                <span v-if="playlistName" id="playlist">{{
                    playlistName
                }}</span>
            </div>
        </button>
    </li>
</template>

<script setup>
const props = defineProps({
    id: {
        type: Number,
        Required: true,
    },
    label: {
        type: String,
        Required: true,
    },
    icon: {
        type: String,
        Required: true,
    },
    playlistName: {
        type: String,
        Required: false,
    },
    showSeparator:{
        type: Boolean,
        Required: false,
    },
    onClick: {
        type: Function,
        Required: true,
    }
})

const handleClick = () => {
    if (props.onClick) {
        props.onClick();
    }
}
</script>

<style scoped>
.menu-item-container {
    display: flex;
    align-items: center;
    text-align: start;
    width: 100%;
    height: 40px;
    padding: 0 12px 0 16px;
    background-color: inherit;
    line-height: 24px;
    cursor: pointer;
}

.menu-item-container:hover {
    background-color: #333333;
}

/* Separator */
.menu-item[has-separator]::after {
    content: "";
    display: block;
    height: 1px;
    margin: 8px 0;
    background-color: rgba(255, 255, 255, 0.3);
}

#icon {
    display: flex;
    align-items: center;
    margin-right: 16px;
}

#menu-service {
    flex: 1;
    margin-right: 24px;
    color: #cccccc;
    font-size: 20px;
    line-height: 40px;
    font-weight: 400;
}
</style>