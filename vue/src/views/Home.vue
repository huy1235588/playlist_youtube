<!-- src/pages/Home.vue -->
<template>
    <div>
        <LoadingPage v-if="loading" />
        <div v-else>
            <HelloWorld msg="Vite + Vue" />
            <input>
        </div>
    </div>
</template>

<script>
import HelloWorld from "../components/HelloWorld.vue";
import LoadingPage from "../components/LoadingPage.vue";
import Input from "../components/input/Input.vue";

export default {
    name: "Home",
    components: {
        LoadingPage,
        HelloWorld,
        Input,
    },
    data() {
        return {
            loading: false,
            data: null,
            error: null,
        };
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            this.loading = true;
            this.error = null;

            try {
                // Khi thành công, cập nhật dữ liệu ở đây
                this.data = "The data has been loaded";
            } catch (error) {
                // Xử lý lỗi mạng
                this.error = "An error occurred while loading data";
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>