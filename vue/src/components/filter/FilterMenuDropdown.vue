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
            <ButtonFilter
                v-for="button in buttons"
                :key="button.id"
                :label="button.label"
                :column="button.column"
                :ascText="button.ascText"
                :descText="button.descText"
                :isActive="activeButton === button.id"
                :order="button.order"
                @update:order="(newOrder) => updateOrder(button.id, newOrder)"
                @click="setActiveButton(button.id)"
            />
        </ul>
    </aside>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue';

import ButtonFilter from './ButtonFilter.vue';

import emitter from '../../eventBus';

const isVisible = ref(false); // Check MenuPopup ẩn hay hiện
const popupStyle = ref({}); // Sử dụng object để điều chỉnh vị trí của popup
const menuPopup = ref(0); // Tham chiếu đến phần tử Menu popup

const buttons = [
    {
        id: 1,
        label: "Ngày thêm",
        column: "AddedAt",
        ascText: "mới nhất",
        descText: "cũ nhất",
        order: "asc",
    },
    {
        id: 2,
        label: "Ngày xuất bản",
        column: "PublishedAt",
        ascText: "mới nhất",
        descText: "cũ nhất",
        order: "asc",
    },
    {
        id: 3,
        label: "Lượt xem",
        column: "ViewCount",
        ascText: "tăng dần",
        descText: "giảm dần",
        order: "asc",
    },
    {
        id: 4,
        label: "Thời lượng video",
        column: "Duration",
        ascText: "ít nhất",
        descText: "nhiều nhất",
        order: "asc",
    }
];

// Đặt giá trị mặc định cho nút được active
const activeButton = ref(buttons[0].id);

// Cập nhật nút order
const updateOrder = (id, newOrder) => {
    // Tìm button đang nhấn
    const button = buttons.find(b => b.id === id);
    if (button) {
        // Thay đổi order của button
        button.order = newOrder;
    }
};

// Set nút đã nhấn
const setActiveButton = (id) => {
    activeButton.value = id;
};

// Hàm tính toán và cập nhật vị trí popup
const updatePopupPosition = () => {
    const targetElement = document.getElementById("filter-button");

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
            let leftPosition = rect.left - 230;

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
    emitter.on("show-filter-menu", showPopup);
});

onUnmounted(() => {
    emitter.off("show-filter-menu", showPopup);
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