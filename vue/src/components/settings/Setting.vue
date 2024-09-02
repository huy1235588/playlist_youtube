<template>
    <section class="menu">
        <button id="setting-button" class="button" @click="handleClick">
            <div id="icon">
                <svg
                    viewBox="0 0 24 24"
                    preserveAspectRatio="xMidYMid meet"
                    focusable="false"
                    class="style-scope yt-icon"
                    style="
                        pointer-events: none;
                        display: block;
                        width: 100%;
                        height: 100%;
                        fill: currentColor;
                    "
                >
                    <g class="style-scope yt-icon">
                        <path
                            d="M12,9c1.65,0,3,1.35,3,3s-1.35,3-3,3s-3-1.35-3-3S10.35,9,12,9 M12,8c-2.21,0-4,1.79-4,4s1.79,4,4,4s4-1.79,4-4 S14.21,8,12,8L12,8z M13.22,3l0.55,2.2l0.13,0.51l0.5,0.18c0.61,0.23,1.19,0.56,1.72,0.98l0.4,0.32l0.5-0.14l2.17-0.62l1.22,2.11 l-1.63,1.59l-0.37,0.36l0.08,0.51c0.05,0.32,0.08,0.64,0.08,0.98s-0.03,0.66-0.08,0.98l-0.08,0.51l0.37,0.36l1.63,1.59l-1.22,2.11 l-2.17-0.62l-0.5-0.14l-0.4,0.32c-0.53,0.43-1.11,0.76-1.72,0.98l-0.5,0.18l-0.13,0.51L13.22,21h-2.44l-0.55-2.2l-0.13-0.51 l-0.5-0.18C9,17.88,8.42,17.55,7.88,17.12l-0.4-0.32l-0.5,0.14l-2.17,0.62L3.6,15.44l1.63-1.59l0.37-0.36l-0.08-0.51 C5.47,12.66,5.44,12.33,5.44,12s0.03-0.66,0.08-0.98l0.08-0.51l-0.37-0.36L3.6,8.56l1.22-2.11l2.17,0.62l0.5,0.14l0.4-0.32 C8.42,6.45,9,6.12,9.61,5.9l0.5-0.18l0.13-0.51L10.78,3H13.22 M14,2h-4L9.26,4.96c-0.73,0.27-1.4,0.66-2,1.14L4.34,5.27l-2,3.46 l2.19,2.13C4.47,11.23,4.44,11.61,4.44,12s0.03,0.77,0.09,1.14l-2.19,2.13l2,3.46l2.92-0.83c0.6,0.48,1.27,0.87,2,1.14L10,22h4 l0.74-2.96c0.73-0.27,1.4-0.66,2-1.14l2.92,0.83l2-3.46l-2.19-2.13c0.06-0.37,0.09-0.75,0.09-1.14s-0.03-0.77-0.09-1.14l2.19-2.13 l-2-3.46L16.74,6.1c-0.6-0.48-1.27-0.87-2-1.14L14,2L14,2z"
                            class="style-scope yt-icon"
                        ></path>
                    </g>
                </svg>
            </div>
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
        <SettingDropdown />
    </section>
</template>

<script setup>
import { ref } from "vue";
import emitter from "../../eventBus";

import SettingDropdown from "./SettingDropdown.vue";

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
    emitter.emit('show-setting', {
        event: event,
    });

};

</script>

<style scoped>
.menu {
    --menu-diameter: 40px;
    --button-line-width: 0.25em;
    --button-line-height: 0.25em;
    --button-offset: 0.625em;
    --button-bg: rgba(255, 255, 255, 0.1);
    --button-color: #ffffff;
    --button-line-border-radius: 0.1875em;
    --button-diameter: 100%;
    --button-btn-border-radius: calc(var(--button-diameter) / 2);
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
    grid-row: span 2;
}

.menu {
    display: inline-block;
    width: var(--menu-diameter);
    height: var(--menu-diameter);
}

.button {
    position: relative;
    background: transparent;
    vertical-align: middle;
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

.button #icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: var(--button-diameter);
    height: var(--button-diameter);
    vertical-align: middle;
    color: #aaaaaa;
    fill: #353535;
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
    border-radius: 50%;
}

#menu:active #interaction .fill {
    opacity: 1;
}

/* Action */
.active {
    opacity: 1;
}
</style>
