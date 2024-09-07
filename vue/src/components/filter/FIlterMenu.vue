<template>
    <section id="filter-menu" class="menu">
        <button id="filter-button" class="button" @click="handleClick">
            <div class="icon">
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
                    "
                >
                    <path
                        d="M21 6H3V5h18v1zm-6 5H3v1h12v-1zm-6 6H3v1h6v-1z"
                    ></path>
                </svg>
            </div>
            <span class="text">Filter</span>
        </button>
        <div id="interaction" class="interaction">
            <div
                class="stroke interaction"
                :class="{ active: isActiveStroke }"
            ></div>
            <div
                class="fill interaction"
                :class="{ active: isActiveFill }"
            ></div>
        </div>
        <FilterMenuDropdown />
    </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";

import FilterMenuDropdown from "./FilterMenuDropdown.vue";

import emitter from "../../eventBus";

// Khởi tạo các biến trạng thái
const isActiveStroke = ref(false);
const isActiveFill = ref(false);

// Hàm xử lý sự kiện click
const handleClick = (event) => {
    // Tạo hiệu ứng stroke (viền) cho phần tử
    setTimeout(() => {
        isActiveStroke.value = true; // Bật hiệu ứng viền
        setTimeout(() => {
            isActiveStroke.value = false; // Tắt hiệu ứng viền sau 180ms
        }, 180);
    }, 100);

    // Tạo hiệu ứng fill (đổ màu) cho phần tử
    isActiveFill.value = true;
    setTimeout(() => {
        isActiveFill.value = false; // Tắt hiệu ứng đổ màu sau 120ms
    }, 120);

    // Hiển thị popup thông qua emitter
    emitter.emit('show-filter-menu', {
        event: event,
    });

};

</script>

<style scoped>
.menu {
    --menu-width: 100px;
    --button-line-width: 0.25em;
    --button-line-height: 0.25em;
    --button-offset: 0.625em;
    --button-bg: rgba(255, 255, 255, 0.1);
    --button-color: #ffffff;
    --button-line-border-radius: 0.1875em;
    --button-diameter: 100%;
    --button-icon-diameter: 2em;
    --button-btn-border-radius: 0.1875em;
    --button-line-transition: 0.3s;
    --button-transition: all 0.5s ease-in-out;
    --stroke-transition: all 0.8s ease;
    --fill-transition: all 0.3s ease;
    --button-hover-scale: 1.1;
    --button-active-scale: 0.95;
    --button-enable-outline-color: var(--button-bg);
    --button-enable-outline-width: 0.125em;
    --button-enable-outline-offset: var(--button-enable-outline-width);

    --underline-border-width: 0.0625em;
    --underline-border-color: #ccc;
    --underline-margin-y: 0.3125em;
}

/* popup settings 👆 */

.menu {
    display: inline-block;
    text-rendering: optimizeLegibility;
    position: relative;
    width: var(--menu-width);
    height: var(--menu-diameter);
}

.menu:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

.button {
    position: relative;
    background: transparent;
    vertical-align: middle;
    display: flex;
    align-items: center;
    width: var(--button-diameter);
    height: var(--button-diameter);
    border-radius: var(--button-btn-border-radius);
    border: none;
    cursor: pointer;
    overflow: hidden;
    transition: var(--button-transition);
    outline: var(--button-enable-outline-width) solid transparent;
    outline-offset: 0;
    z-index: 1;
}

#filter-button .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: var(--button-icon-diameter);
    height: var(--button-icon-diameter);
    vertical-align: middle;
    fill: #ffffff;
}

.button .text {
    flex: 1;
    font-size: 20px;
    line-height: 20px;
    font-weight: 400;
}

.interaction {
    position: absolute;
    display: inline-block;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

.stroke {
    will-change: opacity;
    border: 1px solid var(--button-bg);
    opacity: 0;
}

.fill {
    will-change: opacity;
    background: var(--button-bg);
    opacity: 0;
}

.stroke,
.fill {
    border-radius: var(--button-btn-border-radius);
}

#filter-menu:active #interaction .fill {
    opacity: 1;
}

/* Action */
.active {
    opacity: 1;
}
</style>
