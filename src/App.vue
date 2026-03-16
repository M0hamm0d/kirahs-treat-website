<script setup>
import { onMounted, onUnmounted } from "vue";
import { RouterView } from "vue-router";
import Header from "./components/Header.vue";
import { supabase } from "@/supabase";
import { useAuthStore } from "./stores/auth";
import Footer from "./components/Footer.vue";
const authStore = useAuthStore();
let subscription;
onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  if (data?.session?.user.role === "authenticated") {
    authStore.isAuthenticated = true;
    console.log(data);
  } else {
    authStore.isAuthenticated = false;
    console.log("no session");
  }
  const { data: watchData } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log("event", event, "session", session);
      if (event === "SIGNED_OUT") {
        authStore.isAuthenticated = false;
      } else if (event === "SIGNED_IN") {
        authStore.isAuthenticated = true;
      }
    },
  );
  subscription = watchData.subscription;
});
onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe();
  }
});
</script>

<template>
  <Header />
  <RouterView />
  <Footer />
</template>

<style scoped></style>
