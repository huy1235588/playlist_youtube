<template>
    <aside v-if="isVisible" class="menu-popup-container">
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
import { onMounted, onUnmounted, ref } from 'vue';
import emitter from '../../eventBus';

const isVisible = ref(false);

const showPopup = () => {
    isVisible.value = true;
}

onMounted(() => {
    emitter.on("show-popup", showPopup);
});

onUnmounted(() => {
    emitter.off("show-popup", showPopup);
})

</script>

<style scoped>
.menu-popup-container {
    outline: none;
    position: fixed;
    left: 778.655px;
    top: 184.46px;
    background-color: #000;
    border-radius: 12px;
    z-index: 2202;
}

#items {
    padding: 8px 0;
}

.menu-item-container {
    display: flex;
    align-items: center;
    text-align: start;
    min-height: 36px;
    padding: 0 12px 0 16px;
    line-height: 24px;
    cursor: pointer;
}

.menu-item-container:hover {
    background-color: #242424;
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
    font-size: 1.2rem;
    line-height: 2.4rem;
    font-weight: 400;
}
</style>