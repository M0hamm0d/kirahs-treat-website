import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { supabase } from "@/supabase";

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
      meta: { requiresAdmin: true },
    },
    {
      path: "/cart",
      name: "cart",
      component: () => import("../views/CartView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/AuthView.vue"),
    },
  ],

  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (to.meta.requiresAdmin) {
    if (!user || user.email !== import.meta.env.VITE_ADMIN_EMAIL) {
      return next("/");
    }
  }
  next();
});

export default router;
