<template>
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
                stroke-linejoin="round"
                stroke-linecap="round"
                stroke-width="33.67"
                stroke="#6c6c6c"
                d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
            ></path>
        </svg>
    </button>
</template>

<style>
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
    right: 0;
    padding: 0 1rem;
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
</style>