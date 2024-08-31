<template>
    <aside
        id="menu-popup"
        v-if="isVisible"
        class="menu-popup-container"
        ref="menuPopup"
        :style="popupStyle"
    >
        <ul id="items">
            <!-- Delete video -->
            <li class="menu-item">
                <div class="menu-item-container">
                    <span id="icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            enable-background="new 0 0 24 24"
                            height="24"
                            viewBox="0 0 24 24"
                            width="24"
                            focusable="false"
                            aria-hidden="true"
                            style="
                                pointer-events: none;
                                display: inherit;
                                width: 100%;
                                height: 100%;
                                fill: currentColor;
                            "
                        >
                            <path
                                d="M11 17H9V8h2v9zm4-9h-2v9h2V8zm4-4v1h-1v16H6V5H5V4h4V3h6v1h4zm-2 1H7v15h10V5z"
                            ></path>
                        </svg>
                    </span>
                    <div id="menu-service">
                        <span>Xóa khỏi </span>
                        <span id="playlist">haha</span>
                    </div>
                </div>
            </li>
            <!-- Share -->
            <li class="menu-item" has-separator>
                <div class="menu-item-container">
                    <span id="icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24"
                            viewBox="0 0 24 24"
                            width="24"
                            focusable="false"
                            aria-hidden="true"
                            style="
                                pointer-events: none;
                                display: inherit;
                                width: 100%;
                                height: 100%;
                                fill: currentColor;
                            "
                        >
                            <path
                                d="M15 5.63 20.66 12 15 18.37V14h-1c-3.96 0-7.14 1-9.75 3.09 1.84-4.07 5.11-6.4 9.89-7.1l.86-.13V5.63M14 3v6C6.22 10.13 3.11 15.33 2 21c2.78-3.97 6.44-6 12-6v6l8-9-8-9z"
                            ></path>
                        </svg>
                    </span>
                    <div id="menu-service">
                        <span>Chia sẻ</span>
                    </div>
                </div>
            </li>
            <!-- Set thumbnail playlist -->
            <li class="menu-item">
                <div class="menu-item-container">
                    <span id="icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24"
                            viewBox="0 0 24 24"
                            width="24"
                            focusable="false"
                            aria-hidden="true"
                            style="
                                pointer-events: none;
                                display: inherit;
                                width: 100%;
                                height: 100%;
                                fill: currentColor;
                            "
                        >
                            <path
                                d="M14.04 13.61 16.86 17H11.5l.3-.4 2.24-2.99m-5.11 1.08 1.24 1.86.3.45H7.08l1.85-2.31M14 12l-3 4-2-3-4 5h14l-5-6zm6-8v16H4V4h16m1-1H3v18h18V3z"
                            ></path>
                        </svg>
                    </span>
                    <div id="menu-service">
                        <span>Đặt làm hình nền của danh sách phát</span>
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
const pressedButton = ref(""); // Lưu lại nút đã nhấn
const menuPopup = ref(0); // Tham chiếu đến phần tử Menu popup

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
        let leftPosition = rect.left - 380;

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
        (!menuPopup.value || !menuPopup.value.contains(event.target)) &&
        !event.target.closest('button[id^="button-"]:not(button#filter-button)')
    ) {
        console.log(event.target)
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
    emitter.on("show-popup", showPopup);

});

onUnmounted(() => {
    emitter.off("show-popup", showPopup);
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