<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { RouterView } from "vue-router";
import Header from "./components/Header.vue";
import { supabase } from "@/supabase";
import { useAuthStore } from "./stores/auth";
import Footer from "./components/Footer.vue";
const authStore = useAuthStore();
let subscription;
async function ensureProfile(user) {
  console.log("user", user);
  const { data: existingUser, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user?.id)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error(error.message);
    return null;
  }

  if (!existingUser) {
    console.log("no existing user");
    const name =
      user.user_metadata?.full_name || user.user_metadata?.name || "User";

    const { data: insertedProfile, error: insertError } = await supabase
      .from("profile")
      .insert({
        id: user.id,
        user_name: name,
        user_email: user.email,
      })
      .select()
      .single();

    if (insertError) {
      console.error(insertError.message);
      return null;
    }

    return insertedProfile;
  }
  return existingUser;
}
onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  console.log(data);
  const profile = ref({});
  if (data?.session?.user.role === "authenticated") {
    authStore.isAuthenticated = true;
    profile.value = await ensureProfile(data?.session?.user);
    console.log(profile.value);
  } else {
    authStore.isAuthenticated = false;
    console.log("no session");
  }
  const { data: watchData } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log("event", event, "session", session);
      authStore.userSession = session;

      if (event === "SIGNED_OUT") {
        authStore.isAuthenticated = false;
        authStore.userProfile = {};
        authStore.userSession = null;
        console.log(authStore.userProfile);
      } else if (event === "SIGNED_IN") {
        authStore.isAuthenticated = true;
        authStore.userProfile = profile.value;
        authStore.userSession = session;
        console.log(authStore.userProfile);
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
