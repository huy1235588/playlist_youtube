<template>
    <div id="error-page">
        <div>
            <span className="error-num">5</span>
            <div className="error-eye" ref="eyeRef1"></div>
            <div className="error-eye" ref="eyeRef2"></div>
            <p className="error-text">Error: {{ errorMessage }}.</p>
            <a id="error-home-link" href="./" draggable="false">Go back</a>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from 'vue-router'; 

export default {
    setup() {
        const eyeRef1 = ref(null);
        const eyeRef2 = ref(null);
        const errorMessage = ref('');

        // Lấy thông tin lỗi từ route hoặc từ API
        const route = useRoute(); 
        if (route.query.error) {
            errorMessage.value = route.query.error;
        } else {
            // Mặc định thông báo lỗi
            errorMessage.value = 'Something went wrong. Please try again later.';
        }

        const handleMouseMove = (event) => {
            const moveEye = (eye) => {
                const x = eye.offsetLeft + (eye.offsetWidth / 2);
                const y = eye.offsetTop + (eye.offsetHeight / 2);
                const rad = Math.atan2(event.pageX - x, event.pageY - y);
                const rot = (rad * (180 / Math.PI) * -1) + 180;
                eye.style.transform = `rotate(${rot}deg)`;
            };

            if (eyeRef1.value && eyeRef2.value) {
                moveEye(eyeRef1.value);
                moveEye(eyeRef2.value);
            }
        };

        onMounted(() => {
            document.body.addEventListener('mousemove', handleMouseMove);
        })

        onUnmounted(() => {
            document.body.removeEventListener("mousemove", handleMouseMove);
        });

        return {
            eyeRef1,
            eyeRef2,
            errorMessage,
        };
    }
}
</script>


<style scoped>
#error-page {
    width: 100%;
    height: 100%;
    color: white;
    font-family: "Arial Black";
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}

.error-num {
    font-size: 8em;
}

.error-eye {
    background: #fff;
    border-radius: 50%;
    display: inline-block;
    height: 100px;
    position: relative;
    width: 100px;
}

.error-eye::after {
    background: #000;
    border-radius: 50%;
    bottom: 56.1px;
    content: "";
    height: 33px;
    position: absolute;
    right: 33px;
    width: 33px;
}

.error-text {
    margin-bottom: 4em;
}

/* button */
/* From Uiverse.io by zjssun */
/* From Uiverse.io by mrhyddenn */
#error-home-link {
    position: relative;
    padding: 10px 20px;
    border-radius: 7px;
    border: 1px solid rgb(61, 106, 255);
    font-size: 14px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 2px;
    background: transparent;
    color: #fff;
    overflow: hidden;
    box-shadow: 0 0 0 0 transparent;
    -webkit-transition: all 0.2s ease-in;
    -moz-transition: all 0.2s ease-in;
    transition: all 0.2s ease-in;
    text-decoration: none;
}

#error-home-link:hover {
    background: rgb(61, 106, 255);
    box-shadow: 0 0 30px 5px rgba(0, 142, 236, 0.815);
    -webkit-transition: all 0.2s ease-out;
    -moz-transition: all 0.2s ease-out;
    transition: all 0.2s ease-out;
}

/* #error-home-link:hover::before {
    -webkit-animation: sh02 0.5s 0s linear;
    -moz-animation: sh02 0.5s 0s linear;
    animation: sh02 0.5s 0s linear;
} */

#error-home-link::before {
    content: "";
    display: block;
    width: 0px;
    height: 86%;
    position: absolute;
    top: 7%;
    left: 0%;
    opacity: 0;
    background: #fff;
    box-shadow: 0 0 50px 30px #fff;
    -webkit-transform: skewX(-20deg);
    -moz-transform: skewX(-20deg);
    -ms-transform: skewX(-20deg);
    -o-transform: skewX(-20deg);
    transform: skewX(-20deg);
}

@keyframes sh02 {
    from {
        opacity: 0;
        left: 0%;
    }

    50% {
        opacity: 1;
    }

    to {
        opacity: 0;
        left: 100%;
    }
}

#error-home-link:active {
    box-shadow: 0 0 0 0 transparent;
    -webkit-transition: box-shadow 0.2s ease-in;
    -moz-transition: box-shadow 0.2s ease-in;
    transition: box-shadow 0.2s ease-in;
}
</style>