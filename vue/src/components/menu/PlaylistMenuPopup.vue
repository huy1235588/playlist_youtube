<template>
    <aside
        id="menu-popup"
        v-if="isVisible"
        class="menu-popup-container"
        ref="menuPopup"
        :style="popupStyle"
    >
        <ul id="items">
            <ButtonMenu
                v-for="button in buttons"
                :index="button.id"
                :id="button.id"
                :label="button.label"
                :icon="button.icon"
                :playlistName="button.playlistName"
                :showSeparator="button.showSeparator"
                @click="handleClick(button.id)"
            />
        </ul>
    </aside>
    <ReplaceVideo
        v-if="isReplaceVideo"
        :indexVideo="indexVideo"
        @click="closePopup"
        @close-popup="closePopup()"
    />
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import emitter from '../../eventBus';

const isVisible = ref(false); // Check MenuPopup ẩn hay hiện
const popupStyle = ref({}); // Sử dụng object để điều chỉnh vị trí của popup
const pressedButton = ref(""); // Lưu lại nút đã nhấn
const menuPopup = ref(0); // Tham chiếu đến phần tử Menu popup

const indexVideo = ref(0);
const isReplaceVideo = ref(false);

import ButtonMenu from './ButtonMenu.vue';
import ReplaceVideo from '../popup/ReplaceVideo.vue';

import ReplaceVideoIcon from '../../assets/icon/menu/replace-video.svg'
import DeleteVideoIcon from '../../assets/icon/menu/delete-video.svg'
import ShareIcon from '../../assets/icon/menu/share.svg'
import SetThumbnailIcon from '../../assets/icon/menu/set-thumbnail.svg'

const buttons = [
    {
        id: 1,
        label: "Xóa",
        icon: DeleteVideoIcon,
    },
    {
        id: 2,
        label: "Chia sẻ",
        icon: ShareIcon,
    },
];

// Hàm để xử lý sự kiện click của button
const handleClick = (id) => {
    // Nếu button bằng 1 (Thay thé video) thì hiển thị component
    if (id === 1) {
        isReplaceVideo.value = true;
    }
}

// Hàm để đóng popup
const closePopup = () => {
    isReplaceVideo.value = false;
}

// Hàm tính toán và cập nhật vị trí popup
const updatePopupPosition = (targetElement) => {
    nextTick(() => {
        // Lấy kích thước và vị trí của đối tượng mục tiêu
        const rect = targetElement.getBoundingClientRect();
        // Chiều cao của viewport
        const viewportHeight = window.innerHeight;
        // Chiều cao của popup (thay đổi theo chiều cao của menu)
        let popupHeight;
        if (menuPopup.value) {
            popupHeight = menuPopup.value.offsetHeight;
        }

        // Vị trí hiện tại của popup dựa trên vị trí của đối tượng mục tiêu
        let topPosition = rect.bottom;
        let leftPosition = rect.left;

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

// Hàm xử lý sự kiện resize
const handleResize = () => {
    if (isVisible.value) {
        const targetElement = document.getElementById(pressedButton.value);
        if (targetElement) {
            updatePopupPosition(targetElement);
        }
    }
}

// Hàm hiện menu popup
const showPopup = (payload) => {
    indexVideo.value = payload.indexVideo;
    const elementTarget = payload.event.currentTarget.id;

    // Kiểm tra popup chưa hiển thị
    if (elementTarget.startsWith("button-")) {
        // Kiểm tra nếu cùng một nút đã được nhấn
        if (elementTarget === pressedButton.value) {
            isVisible.value = !isVisible.value; // Chuyển đổi trạng thái
        } else {
            isVisible.value = true; // Hiển thị popup
            pressedButton.value = elementTarget; // Lưu lại ID Element của nút đã được nhấn
        }

        // Cập nhật vị trí hiện menu
        const targetElement = payload.event.target;
        updatePopupPosition(targetElement);

        // Lắng nghe sự kiện resize
        window.addEventListener('resize', handleResize);

        // Thêm sự kiện click để ẩn popup
        document.addEventListener('click', hidePopup);
    }
}

// Hàm ẩn menu popup
const hidePopup = (event) => {
    if (
        !event.target.closest('button[id^="button-"]:not(button#filter-button)')
    ) {
        isVisible.value = false;
        cleanupEventListeners()
    }
}

// Hàm dọn dẹp các lắng nghe sự kiện khi ẩn popup
const cleanupEventListeners = () => {
    document.removeEventListener('click', hidePopup);
    window.removeEventListener('resize', handleResize);
};

onMounted(() => {
    emitter.on("show-playlist-menu-popup", showPopup);
});

onUnmounted(() => {
    emitter.off("show-playlist-menu-popup", showPopup);
    cleanupEventListeners()
})

</script>

<style scoped>
.menu-popup-container {
    outline: none;
    position: fixed;
    background-color: #000;
    border-radius: 12px;
    z-index: 2;
}

#items {
    padding: 12px 0;
}

.menu-item-container {
    display: flex;
    align-items: center;
    text-align: start;
    height: 40px;
    padding: 0 12px 0 16px;
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
    margin-right: 16px;
    fill: #cccccc;
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