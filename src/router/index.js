import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/menu",
      name: "menu",
      component: () => import("../views/MenuView.vue"),
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/AdminDashboard.vue"),
    },
  ],
});
export default router;
