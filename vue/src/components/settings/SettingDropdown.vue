<template>
    <aside
        id="menu-popup"
        v-if="isVisible"
        class="menu-popup-container"
        ref="menuPopup"
        :style="popupStyle"
    >
        <ul id="items">
            <!-- Sort by ADdedAt -->
            <ButtonSetting
                v-for="button in buttons"
                :key="button.id"
                :id="button.id"
                :label="button.label"
                :icon="button.icon"
                @add-playlist="addPlaylist()"
                @change-playlist="changePlaylist()"
                @update-playlist="updatePlaylist()"
            />
        </ul>
    </aside>
    <AddPlaylist
        v-if="isAddPlaylist"
        labelH2="Add Playlist"
        @click="closePopup"
        @close-popup="closePopup()"
    />
    <UpdatePlaylist
        v-else-if="isUpdatePlaylist"
        :playlistId="playlistId"
        :playlistName="playlistName"
        @click="closePopup"
        @close-popup="closePopup()"
    />
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue';

import ButtonSetting from './ButtonSetting.vue';
import AddPlaylist from '../popup/AddPlaylist.vue';
import UpdatePlaylist from '../popup/UpdatePlaylist.vue';

import emitter from '../../eventBus';

const isVisible = ref(false); // Check MenuPopup ẩn hay hiện
const popupStyle = ref({}); // Sử dụng object để điều chỉnh vị trí của popup
const menuPopup = ref(0); // Tham chiếu đến phần tử Menu popup
const isAddPlaylist = ref(false);
const isUpdatePlaylist = ref(false);

const playlistId = ref('');
const playlistName = ref('');

import AddVideoIcon from '../../assets/icon/setting/add-playlist.svg'
import ShowVideoIcon from '../../assets/icon/setting/show-video.svg'
import UpdatePlaylistIcon from '../../assets/icon/setting/update-playlist.svg'
import ChangePlaylistIcon from '../../assets/icon/setting/change-playlist.svg'
import DeleteVideoIcon from '../../assets/icon/setting/delete-playlist.svg'

const buttons = [
    {
        id: "addPlaylist",
        label: "Add new playlist",
        icon: AddVideoIcon,
    },
    {
        id: "showHiddenVideos",
        label: "Show hidden videos",
        icon: ShowVideoIcon,
    },
    {
        id: "updatePlaylist",
        label: "Update Playlist",
        icon: UpdatePlaylistIcon,
    },
    {
        id: "changePlaylist",
        label: "Change playlist",
        icon: ChangePlaylistIcon,
    },
    {
        id: "deletePlaylist",
        label: "Delete playlist",
        icon: DeleteVideoIcon,
    }
];

// Hàm để hiện thị popup isAddPlaylist
const addPlaylist = () => {
    isAddPlaylist.value = true;
}

const updatePlaylist = () => {
    isUpdatePlaylist.value = true;
}

const changePlaylist = () => {
    emitter.emit('change-playlist');
}

// Hàm để đóng popup AddPlaylist
const closePopup = () => {
    isAddPlaylist.value = false;
    isUpdatePlaylist.value = false;
}

// Hàm tính toán và cập nhật vị trí popup
const updatePopupPosition = () => {
    const targetElement = document.getElementById("setting-button");

    if (targetElement) {
        // Lấy kích thước và vị trí của đối tượng mục tiêu
        const rect = targetElement.getBoundingClientRect();
        // Chiều cao của viewport
        const viewportHeight = window.innerHeight;

        nextTick(() => {
            // Chiều cao của popup (thay đổi theo chiều cao của menu)
            let popupHeight = targetElement.offsetHeight;

            // Vị trí hiện tại của popup dựa trên vị trí của đối tượng mục tiêu
            let topPosition = rect.bottom + 10;
            let leftPosition = rect.left - 310;

            // Kiểm tra nếu menu nằm ngoài viewport
            if (topPosition + popupHeight > viewportHeight) {
                // Điều chỉnh vị trí để menu nằm trong viewport
                topPosition = rect.top - popupHeight; // 10px padding
            }

            // Cập nhật style của popup với các vị trí đã điều chỉnh
            popupStyle.value = {
                top: `${topPosition}px`,
                left: `${leftPosition}px`,
            };
        });
    }
}

// Hàm hiện menu popup
const showPopup = () => {
    // Chuyển đổi trạng thái
    isVisible.value = !isVisible.value;

    if (isVisible.value) {
        // Cập nhật vị trí hiện menu
        updatePopupPosition();

        // Lắng nghe sự kiện resize
        window.addEventListener('resize', updatePopupPosition);

        // Thêm sự kiện click để ẩn popup
        setTimeout(() => {
            document.addEventListener('click', hidePopup);
        }, 0);
    }
    else {
        cleanupEventListeners();
    }
}

// Hàm ẩn menu popup
const hidePopup = (event) => {
    isVisible.value = false;
    cleanupEventListeners()
}

// Hàm dọn dẹp các lắng nghe sự kiện khi ẩn popup
const cleanupEventListeners = () => {
    document.removeEventListener('click', hidePopup);
    window.removeEventListener('resize', updatePopupPosition);
};

// Hàm nhận playlistId
const selectedPlaylist = (payload) => {
    playlistId.value = payload.playlistId;
    playlistName.value = payload.playlistName;
};


onMounted(() => {
    emitter.on("show-setting", showPopup);
    emitter.on('selected-playlist', selectedPlaylist);
});

onUnmounted(() => {
    emitter.off("show-setting", showPopup);
    emitter.off('selected-playlist', selectedPlaylist);
    cleanupEventListeners()
})

</script>

<style scoped>
.menu-popup-container {
    outline: none;
    position: fixed;
    width: 350px;
    background-color: #000;
    border-radius: 12px;
    z-index: 2;
}

#items {
    padding: 8px 0;
}
</style>