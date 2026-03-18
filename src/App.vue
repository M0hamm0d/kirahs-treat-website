<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { RouterView } from "vue-router";
import Header from "./components/Header.vue";
import { supabase } from "@/supabase";
import { useAuthStore } from "./stores/auth";
import Footer from "./components/Footer.vue";
const authStore = useAuthStore();
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

// Use a ref for subscription to keep it reactive and safe
const authSubscription = ref(null);

onMounted(async () => {
  // 1. Check for an existing session immediately on mount
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    authStore.userSession = session;
    authStore.isAuthenticated = true;
    // Pre-load profile so the UI doesn't "flicker"
    authStore.userProfile = await ensureProfile(session.user);
  }

  // 2. Listen for future auth changes
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log(`Auth Event: ${event}`);

    if (event === "SIGNED_OUT") {
      // Use $reset() to clear EVERYTHING in the store safely
      // authStore.$reset();
      authStore.isAuthenticated = false;
      authStore.userProfile = {};
      authStore.userSession = null;
      return;
    }

    if (
      event === "SIGNED_IN" ||
      event === "INITIAL_SESSION" ||
      event === "TOKEN_REFRESHED"
    ) {
      if (session?.user) {
        authStore.userSession = session;
        authStore.isAuthenticated = true;

        // Prevent redundant DB calls if profile is already loaded
        if (authStore.userProfile?.id !== session.user.id) {
          try {
            authStore.userProfile = await ensureProfile(session.user);
          } catch (error) {
            console.error("Profile sync failed:", error);
          }
        }
      }
    }
  });

  authSubscription.value = data.subscription;
});

onUnmounted(() => {
  // Clean up the listener to prevent memory leaks
  authSubscription.value?.unsubscribe();
});

// if (data?.session?.user.role === "authenticated") {
//   authStore.isAuthenticated = true;
//   profile.value = await ensureProfile(data?.session?.user);
//   console.log(profile.value);
// } else {
//   authStore.isAuthenticated = false;
//   console.log("no session");
// }

//correct one
// let subscription;
// onMounted(async () => {
//   const { data } = await supabase.auth.getSession();
//   console.log(data);
//   const { data: watchData } = supabase.auth.onAuthStateChange(
//     async (event, session) => {
//       console.log("event", event, "session", session?.user?.role);
//       authStore.userSession = session;

//       if (event === "SIGNED_OUT") {
//         authStore.isAuthenticated = false;
//         authStore.userProfile = {};
//         authStore.userSession = null;
//         console.log(authStore.userProfile);
//       } else if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
//         authStore.isAuthenticated = true;
//         // authStore.userProfile = profile.value;
//         authStore.userProfile = await ensureProfile(session?.user);
//         authStore.userSession = session;
//         console.log(authStore.userProfile);
//       }
//     },
//   );
//   subscription = watchData.subscription;
// });
// onUnmounted(() => {
//   if (subscription) {
//     subscription.unsubscribe();
//   }
// });
// onMounted(async () => {
//   console.log(authStore.isAuthenticated);
//   // 1. Initial check on load
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   if (session) {
//     authStore.isAuthenticated = true;
//     authStore.userSession = session;
//     authStore.userProfile = await ensureProfile(session.user);
//   }

//   // 2. Listen for changes (Login/Logout)
//   const { data: watchData } = supabase.auth.onAuthStateChange(
//     async (event, session) => {
//       console.log("Auth Event:", event);

//       if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
//         if (session) {
//           authStore.isAuthenticated = true;
//           authStore.userSession = session;
//           // FETCH profile here so it updates the store immediately
//           authStore.userProfile = await ensureProfile(session.user);
//         }
//       } else if (event === "SIGNED_OUT") {
//         authStore.isAuthenticated = false;
//         authStore.userProfile = {};
//         authStore.userSession = null;
//       }
//     },
//   );

//   subscription = watchData.subscription;
// });
</script>

<template>
  <Header />
  <RouterView />
  <Footer />
</template>

<style scoped></style>
