<template>
    <form id="form-input" @submit.prevent="onSubmit">
        <input
            id="messageInput"
            className="input"
            :placeholder="placeholder"
            :type="type"
            :autocomplete="autocomplete"
            v-model="inputValue"
            @input="handleValue"
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
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                ></path>
            </svg>
        </button>
    </form>
</template>

<script setup>
import { ref, nextTick } from "vue";
import emitter from "../../eventBus";

defineProps({
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
    
    emitter.emit('filter')
};

const handleValue = () => {
    emitter.emit('search-video', {
        input: inputValue.value
    })
}

</script>

<style scoped>
.input {
    background-color: #010201;
    border: none;
    padding: 7px;
    width: 30rem;
    height: 56px;
    border-radius: 10px;
    color: white;
    padding-inline: 1.5rem 3.5rem;
    font-size: 18px;
}

.input::placeholder {
    color: #c0b9c0;
}

.input:focus {
    outline: none;
}

#form-input {
    width: 35rem;
    position: relative;
}

#resetButton {
    position: absolute;
    height: 100%;
    top: 0;
    right: 0;
    padding: 0 10px;
    background-color: transparent;
    cursor: pointer;
}

#resetButton svg {
    height: 18px;
    transition: all 0.3s;
    width: 40px;
    height: 40px;
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
