<template>
    <li class="menu-item">
        <div class="menu-item-container">
            <button id="button-sort">
                {{ text }}
            </button>
        </div>
    </li>
</template>

<script setup>
defineProps({
    text: {
        type: String,
        required: true,
    }
});
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