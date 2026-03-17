import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const isAuthenticated = ref(false);
    const userProfile = ref({});
    const userSession = ref(null);
    return { isAuthenticated, userProfile, userSession };
  },
  {
    persist: true,
  },
);
