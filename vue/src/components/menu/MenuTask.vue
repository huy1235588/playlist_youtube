<template>
    <section class="menu">
        <button :id="'button-' + index" class="button" @click="handleClick">
            <div id="icon">
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
                        width: 24px;
                        height: 24px;
                        fill: currentColor;
                    "
                >
                    <path
                        d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"
                    ></path>
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
    </section>
</template>

<script setup>
import { ref } from "vue";
import emitter from "../../eventBus";

const props = defineProps({
    index: {
        type: Number,
        require: true
    }
})

const isActiveStroke = ref(false);
const isActiveFill = ref(false);
const showPopup = ref(true);

// Hiệu ứng
const handleClick = (event) => {
    setTimeout(() => {
        isActiveStroke.value = true;
        setTimeout(() => {
            isActiveStroke.value = false;
        }, 180);
    }, 100);

    isActiveFill.value = true;
    setTimeout(() => {
        isActiveFill.value = false;
    }, 120);

    // Hiển thị popup
    emitter.emit('show-popup', {
        event: event,
        index: props.index,
        showPopup: showPopup.value,
    });
    showPopup.value = !showPopup.value;
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
    z-index: 500;
}

.button #icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: var(--button-diameter);
    height: var(--button-diameter);
    vertical-align: middle;
    fill: #ffffff;
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

/* Action */
.active {
    opacity: 1;
}
</style>
