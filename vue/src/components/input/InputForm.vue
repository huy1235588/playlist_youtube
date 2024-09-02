<template>
    <form id="form-input" @submit.prevent="onSubmit">
        <label class="label" for="input-form">{{ label }}</label>
        <input
            id="input-form"
            className="input"
            :placeholder="placeholder"
            :type="type"
            :autocomplete="autocomplete"
            v-model="inputValue"
            @input="inputValue"
            ref="inputField"
            required
        />
        <button
            id="resetButton"
            v-if="inputValue"
            type="button"
            @click="resetInput"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    d="m12.71 12 8.15 8.15-.71.71L12 12.71l-8.15 8.15-.71-.71L11.29 12 3.15 3.85l.71-.71L12 11.29l8.15-8.15.71.71L12.71 12z"
                ></path>
            </svg>
        </button>

        <ButtonSubmit />
    </form>
</template>

<script setup>
import { ref, nextTick } from "vue";
import emitter from "../../eventBus";

import ButtonSubmit from "./ButtonSubmit.vue";

defineProps({
    label:{
        type: String,
        default: "",
    },
    placeholder: {
        type: String,
        default: "",
    },
    type: {
        type: String,
        default: "text",
    },
    onSubmit: {
        type: Function,
        required: false,
    },
    autocomplete: {
        type: String,
        default: "off"
    }
});

const inputValue = ref(""); // Giá trị của input
const inputField = ref(null); // Tham chiếu đến input field

const resetInput = () => {
    inputValue.value = ""; // Xóa giá trị trong intput
    nextTick(() => {
        inputField.value.focus(); // Đặt con trỏ vào ô input
    });
    
};

const handleValue = () => {
    console.log()
}

</script>

<style scoped>
.label{
    position: absolute;
    display: inline-block;
    width: 100%;
    text-align: start;
    top: -30px;
    line-height: 30px;
}

.input {
    background-color: #010201;
    border: none;
    padding: 7px;
    width: 80%;
    height: 56px;
    border-radius: 10px;
    color: white;
    padding-inline: 1.5rem 6.325rem;
    font-size: 18px;
}

.input::placeholder {
    color: #6d6d6d;
}

.input:focus {
    outline: none;
}

#form-input {
    position: relative;
    width: 90%;
    margin: 0 auto;
}

#resetButton {
    position: absolute;
    display: flex;
    align-items: center;
    height: 100%;
    top: 0;
    right: 3.125rem;
    padding: 0 10px;
    background-color: transparent;
    cursor: pointer;
}

#resetButton svg {
    height: 18px;
    transition: all 0.3s;
    width: 25px;
    height: 25px;
}

#resetButton svg path {
    transition: all 0.3s;
    fill: #3c3c3c;
    stroke: rgb(63, 63, 63);
}

#resetButton:hover svg path {
    fill: #3c3c3c;
    stroke: white;
}
</style>
