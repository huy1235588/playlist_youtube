<template>
    <li class="menu-item">
        <div class="menu-item-container">
            <img :src="icon" class="icon" alt="" />
            <button id="button-sort" @click="handleClick">
                {{ label }}
            </button>
        </div>
    </li>
</template>

<script setup>
import emitter from '../../eventBus';

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    onClick: Function,
});

const emit = defineEmits(['add-playlist', 'update-playlist' ,'change-playlist']);

// Gửi sự kiện click cho PlaylistVideo
const handleClick = (event) => {
    // Thêm playlist vào database
    if (props.id === "addPlaylist") {
        emit('add-playlist');
    }
    
    // Hiện video bị ẩn
    if (props.id === "showHiddenVideos") {
        // Phát sự kiện filter để gọi api
        emitter.emit('show-hidden-video', {
            column: props.column,
            order: props.order,
        });
    }

    // Cập nhật playlist
    if (props.id === "updatePlaylist"){
        emit('update-playlist');
    }

    // Thay đổi playlist
    if (props.id === "changePlaylist") {
        emit('change-playlist');
    }
}
</script>

<style scoped>
.menu-item-container {
    display: flex;
    align-items: center;
    text-align: start;
    height: 50px;
    padding: 0 12px 0 16px;
    line-height: 24px;
    cursor: pointer;
}

.menu-item-container .icon {
    margin-right: 10px;
}

.menu-item:hover {
    background-color: #4d4d4d;
}

#button-sort {
    flex: 1;
    margin-right: 24px;
    background-color: unset;
    color: #cccccc;
    font-size: 20px;
    line-height: 40px;
    font-weight: 400;
}

.menu-item.active {
    background-color: #444444;
}

.icon {
    color: #fff;
    fill: #fff;
}
</style>