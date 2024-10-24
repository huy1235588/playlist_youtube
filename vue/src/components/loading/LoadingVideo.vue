<template>
    <div class="loader">
        <div class="box-load1"></div>
        <div class="box-load2"></div>
        <div class="box-load3"></div>
    </div>
</template>

<style scoped>
/* From Uiverse.io by Lmickk2 */
.loader {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    transition: all 0.4s;
}

.loader div {
    margin-left: 0.8rem;
    background-color: rgb(34, 34, 34);
    box-shadow: inset 2px 2px 10px black;
    border-radius: 100%;
    height: 1rem;
    width: 1rem;
}

.box-load1 {
    animation: brighten 1.2s infinite;
}

.box-load2 {
    animation: brighten 1.2s infinite;
    animation-delay: 0.2s;
}

.box-load3 {
    animation: brighten 1.2s infinite;
    animation-delay: 0.4s;
}

@keyframes brighten {
    100% {
        background-color: rgb(165, 165, 165);
        box-shadow: none;
    }
}
</style>