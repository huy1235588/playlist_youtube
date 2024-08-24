import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Error from "../views/Error.vue";

const routes = [
    { path: "/", name: "Home", component: Home },

    // Route cho trang lỗi cụ thể
    {path: "/error", name: "Error", component: Error},

    // Route bắt mọi URL không hợp lệ
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: Error },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;