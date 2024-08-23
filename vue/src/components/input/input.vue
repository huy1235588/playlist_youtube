<!-- src/components/Loader.vue -->
<template>
    <form id="form-input" @submit.prevent="onSubmit">
        <input
            id="messageInput"
            className="input"
            :placeholder="placeholder"
            :type="type"
            v-model="inputValue"
            @input="sendInputValue"
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                ></path>
            </svg>
        </button>

        <button id="sendButton" type="submit">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 664 663"
            >
                <path
                    fill="none"
                    d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
                ></path>
                <path
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="33.67"
                    stroke="#6c6c6c"
                    d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
                ></path>
            </svg>
        </button>
    </form>
</template>

<script>
defineProps({
    placeholder: String,
    type: String,
    onSubmit: Function,
});

export default {
    name: "Input",
    data() {
        return {
            inputValue: "",
        };
    },
    methods: {
        sendInputValue() {
            this.$emit("updateValue", this.inputValue);
        },
        resetInput() {
            this.inputValue = ""; // Xóa giá trị trong intput
            this.$nextTick(() => {
                this.$refs.inputField.focus(); // Đặt con trỏ vào ô input
            });
        },
    },
};
</script>

<style scoped>
.input {
    background-color: #010201;
    border: none;
    padding: 7px;
    width: 450px;
    height: 56px;
    border-radius: 10px;
    color: white;
    padding-inline: 30px 50px;
    font-size: 18px;
}
.input::placeholder {
    color: #c0b9c0;
}

.input:focus {
    outline: none;
}

#form-input {
    position: relative;
}

#resetButton {
    position: absolute;
    top: 20%;
    right: 3.5rem;
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

#sendButton {
    width: fit-content;
    height: 100%;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    position: absolute;
    top: 0;
    right: 10px;
}
#sendButton svg {
    height: 18px;
    transition: all 0.3s;
}

#sendButton svg path {
    transition: all 0.3s;
}

#sendButton:hover svg path {
    fill: #3c3c3c;
    stroke: white;
}

@keyframes glitch {
    0% {
        transform: translate(0);
    }

    20% {
        transform: translate(-3px, 3px);
    }

    40% {
        transform: translate(-3px, -3px);
    }

    60% {
        transform: translate(3px, 3px);
    }

    80% {
        transform: translate(3px, -3px);
    }

    to {
        transform: translate(0);
    }
}

@keyframes shift {
    0%,
    40%,
    44%,
    58%,
    61%,
    65%,
    69%,
    73%,
    100% {
        transform: skewX(0deg);
    }

    41% {
        transform: skewX(10deg);
    }

    42% {
        transform: skewX(-10deg);
    }

    59% {
        transform: skewX(40deg) skewY(10deg);
    }

    60% {
        transform: skewX(-40deg) skewY(-10deg);
    }

    63% {
        transform: skewX(10deg) skewY(-5deg);
    }

    70% {
        transform: skewX(-50deg) skewY(-20deg);
    }

    71% {
        transform: skewX(10deg) skewY(-10deg);
    }
}
</style>
