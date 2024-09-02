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
                @click="setActiveButton(button.id)"
            />
        </ul>
    </aside>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue';

import ButtonSetting from './ButtonSetting.vue';

import emitter from '../../eventBus';

const isVisible = ref(false); // Check MenuPopup ẩn hay hiện
const popupStyle = ref({}); // Sử dụng object để điều chỉnh vị trí của popup
const menuPopup = ref(0); // Tham chiếu đến phần tử Menu popup

import AddVideoIcon from '../../assets/icon/add-video.svg'
import ShowVideoIcon from '../../assets/icon/show-video.svg'
import ChangePlaylistIcon from '../../assets/icon/change-playlist.svg'
import DeleteVideoIcon from '../../assets/icon/delete-video.svg'

const buttons = [
    {
        id: 1,
        label: "Thêm danh sách phát",
        icon: AddVideoIcon,
    },
    {
        id: 2,
        label: "Hiện các video bị ẩn",
        icon: ShowVideoIcon,
    },
    {
        id: 3,
        label: "Chuyển đổi danh sách phát",
        icon: ChangePlaylistIcon,
    },
    {
        id: 4,
        label: "Xóa danh sách phát",
        icon: DeleteVideoIcon,
    }
];

// Đặt giá trị mặc định cho nút được active
// const activeButton = ref(buttons[0].id);

// // Cập nhật nút order
// const updateOrder = (id, newOrder) => {
//     // Tìm button đang nhấn
//     const button = buttons.find(b => b.id === id);
//     if (button) {
//         // Thay đổi order của button
//         button.order = newOrder;
//     }
// };

// Set nút đã nhấn
// const setActiveButton = (id) => {
//     activeButton.value = id;
// };

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

onMounted(() => {
    emitter.on("show-setting", showPopup);
});

onUnmounted(() => {
    emitter.off("show-setting", showPopup);
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