import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const isAuthenticated = ref(false);
    const userProfile = ref([]);
    return { isAuthenticated, userProfile };
  },
  {
    persist: true,
  },
);
