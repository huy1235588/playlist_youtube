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
            <li class="menu-item">
                <div class="menu-item-container">
                    <div id="menu-service">
                        <span>Ngày thêm (mới nhất)</span>
                    </div>
                </div>
            </li>
            <li class="menu-item" has-separator>
                <div class="menu-item-container">
                    <div id="menu-service">
                        <span>Ngày thêm (cũ nhất)</span>
                    </div>
                </div>
            </li>
            <!-- Sort by PublishedAt -->
            <li class="menu-item">
                <div class="menu-item-container">
                    <div id="menu-service">
                        <span>Ngày xuất bản (mới nhất)</span>
                    </div>
                </div>
            </li>
            <li class="menu-item" has-separator>
                <div class="menu-item-container">
                    <div id="menu-service">
                        <span>Ngày thêm (cũ nhất)</span>
                    </div>
                </div>
            </li>
            <!-- Sort by ViewCount -->
            <li class="menu-item">
                <div class="menu-item-container">
                    <div id="menu-service">
                        <span>Lượt xem (tăng dần)</span>
                    </div>
                </div>
            </li>
            <li class="menu-item" has-separator>
                <div class="menu-item-container">
                    <div id="menu-service">
                        <span>Lượt xem (giảm dần)</span>
                    </div>
                </div>
            </li>
        </ul>
    </aside>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import emitter from '../../eventBus';

const isVisible = ref(false); // Check MenuPopup ẩn hay hiện
const popupStyle = ref({}); // Sử dụng object để điều chỉnh vị trí của popup
const menuPopup = ref(0); // Tham chiếu đến phần tử Menu popup

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
            let leftPosition = rect.left - 160;

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
    if (!menuPopup.value || !menuPopup.value.contains(event.target)) {
        isVisible.value = false;
        cleanupEventListeners()
    }
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
    background-color: #000;
    border-radius: 12px;
    z-index: 2;
}

#items {
    padding: 8px 0;
}

.menu-item-container {
    display: flex;
    align-items: center;
    text-align: start;
    height: 50px;
    padding: 0 12px 0 16px;
    line-height: 24px;
    cursor: pointer;
}

.menu-item-container:hover {
    background-color: #444444;
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