<template>
    <li class="menu-item" :class="{ active: isActive }">
        <div class="menu-item-container">
            <button id="button-sort" @click="filter">
                {{ label }}
            </button>
        </div>
    </li>
</template>

<script setup>
import { computed, ref } from 'vue';
import emitter from '../../eventBus';
import SortUp from '../../assets/icon/sort-up.svg'
import SortDown from '../../assets/icon/sort-down.svg'

const props = defineProps({
    label: {
        type: String,
        required: true,
    },
    column: {
        type: String,
        required: true,
    },
    ascText: {
        type: String,
        required: true,
    },
    descText: {
        type: String,
        required: true
    },
    order: {
        type: String,
        required: true,
    },
    isActive: Boolean,
    onClick: Function,
});

const emit = defineEmits(['update:order']);

// Xác định currentText dựa trên trạng thái order
const currentOrderText = computed(() => props.order === 'asc' ? props.ascText : props.descText);

// Gửi sự kiện click cho PlaylistVideo
const filter = (event) => {
    // Phát sự kiện update:order để cập nhật trạng thái order
    emit('update:order', props.order === 'asc' ? 'desc' : 'asc');

    // Phát sự kiện filter để gọi api
    // emitter.emit('filter', {
    //     column: props.column,
    //     order: props.order,
    // });

    if (props.onClick) {
        props.onClick();
    }
}
</script>

<style scoped>
.menu-item-container {
    display: flex;
    align-items: center;
    text-align: start;
    height: 50px;
    padding: 0 12px 0 16px;
    line-height: 24px;
    cursor: pointer;
}

.menu-item:hover {
    background-color: #4d4d4d;
}

#button-sort {
    flex: 1;
    margin-right: 24px;
    background-color: unset;
    color: #cccccc;
    font-size: 20px;
    line-height: 40px;
    font-weight: 400;
}

.menu-item.active {
    background-color: #444444;
}

.icon {
    color: #fff;
    fill: #fff;
}
</style>