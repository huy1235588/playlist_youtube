<template>
    <li class="menu-item">
        <div class="menu-item-container">
            <button id="button-sort" @click="filter">
                {{ text }}
            </button>
        </div>
    </li>
</template>

<script setup>
import emitter from '../../eventBus';

const props = defineProps({
    text: {
        type: String,
        required: true,
    },
    column: {
        type: String,
        require: true,
    },
    order: {
        type: String,
        require: true
    }
});

// Gửi sự kiện click cho PlaylistVideo
const filter = () => {
    emitter.emit('filter', {
        column: props.column,
        order: props.order,
    });
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
    background-color: #444444;
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
</style>