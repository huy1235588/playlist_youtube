<!-- src/pages/Home.vue -->
<template>
    <div>
        <LoadingPage v-if="loading" />
        <div v-else>
            <HelloWorld msg="Vite + Vue" />

        </div>
    </div>
</template>

<script>
import HelloWorld from '../components/HelloWorld.vue';
import LoadingPage from '../components/LoadingPage.vue';

export default {
    name: 'Home',
    components: { LoadingPage, HelloWorld },
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
                this.data = "Dữ liệu đã được tải";
            } catch (error) {
                // Xử lý lỗi mạng
                this.error = "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.";
            } finally {
                this.loading = false;
            }
        },

    },
};
</script>