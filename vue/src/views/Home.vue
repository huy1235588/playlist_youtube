<!-- src/pages/Home.vue -->
<template>
    <div>
        <LoadingPage v-if="loading" />
        <div v-else>
            <InputForm
                placeholder="Search. . ."
                type="text"
                autocomplete="off"
                :onSubmit="fetchData"
                @updateInputValue="receiveInputValue"
            />
            <HelloWorld :msg="outputValue" />
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import axios from "axios";

import HelloWorld from "../components/HelloWorld.vue";
import LoadingPage from "../components/LoadingPage.vue";
import InputForm from "../components/input/InputForm.vue";

export default {
    name: "Home",
    components: {
        LoadingPage,
        HelloWorld,
        InputForm,
    },
    setup() {
        const data = ref(null);
        const loading = ref(false);
        const error = ref(null);
        const inputValue = ref("");
        const outputValue =ref("");

        const router = useRouter();

        const fetchData = async () => {
            loading.value = true;
            error.value = null;

            try {
                // Gọi API backend
                const response = await axios.get("/api/videos/fetch", {
                    params: { inputValue: inputValue.value }
                });

                const data = await response.data;

                outputValue.value = data;

            } catch (err) {
                // Xử lý lỗi mạng
                error.value = err.message;
                router.push({ path: '/error', query: { error: error.value } });
            } finally {
                loading.value = false;
            }
        };

        // Nhận giá trị từ input
        const receiveInputValue = (value) => {
            inputValue.value = value;
        };



        return {
            data, // Dữ liệu từ api
            loading, // Loading trang
            error, // Lỗi trong khi gọi api
            inputValue, // Giá trị input
            outputValue,
            fetchData,
            receiveInputValue, // Hàm nhận giá trị input
        };
    },
};
</script>