<script setup>
import { computed, onMounted, ref, toRaw } from "vue";
import { useAuthStore } from "../stores/auth";
import { supabase } from "@/supabase";
import router from "../router";
const allLinks = [
  { name: "Home", path: "/" },
  { name: "Menu", path: "/menu" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Cart", path: "/cart" },
];
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
const authStore = useAuthStore();
// const user = ref(await supabase.auth.getUser());
// console.log("user", toRaw(user.value));
async function ccc() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log("session", session);
}
ccc();
const filteredLink = computed(() => {
  return allLinks.filter((link) => {
    if (link.name === "Dashboard") {
      return authStore.userSession?.user?.email === adminEmail;
    } else {
      return true;
    }
  });
});
const loading = ref(false);
const sidebarOpen = ref(false);
async function handleLogout() {
  loading.value = true;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.log("No session, skipping logout");
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      throw err;
    }
  } catch (err) {
    console.log(err);
  } finally {
    loading.value = false;
    router.push("/");
  }
}
console.log(
  "auth authenticity",
  authStore.isAuthenticated,
  "userSession",
  authStore.userSession,
);
</script>
<template>
  <nav class="nav-wrapper">
    <div class="glass-header">
      <div class="logo">
        <img src="/kirah_treat_logo.png" alt="Logo" />
      </div>

      <ul class="nav-links">
        <li v-for="link in filteredLink" :key="link.name">
          <RouterLink :to="link.path" class="nav-item">
            {{ link.name }}
          </RouterLink>
        </li>
      </ul>

      <div class="nav-cta" v-if="!authStore.isAuthenticated">
        <button class="auth"><RouterLink to="/login">Login</RouterLink></button>
      </div>
      <div class="nav-cta" v-else>
        <button class="auth" @click="handleLogout">
          {{ loading ? "loading..." : "Log out" }}
        </button>
      </div>

      <!-- Hamburger Menu for Mobile -->
      <button class="hamburger" @click="sidebarOpen = true">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <div class="sidebar" :class="{ show: sidebarOpen }">
      <button class="close-btn" @click="sidebarOpen = false">&times;</button>
      <ul class="sidebar-links">
        <li v-for="link in filteredLink" :key="link.name">
          <RouterLink
            :to="link.path"
            class="sidebar-item"
            @click="sidebarOpen = false"
          >
            {{ link.name }}
          </RouterLink>
        </li>
      </ul>
      <div class="sidebar-cta" v-if="!authStore.isAuthenticated">
        <RouterLink to="/login" @click="sidebarOpen = false" class="auth"
          >Login</RouterLink
        >
      </div>
      <div class="sidebar-cta" v-else>
        <button
          class="auth"
          @click="
            handleLogout();
            sidebarOpen = false;
          "
        >
          {{ loading ? "loading..." : "Log out" }}
        </button>
      </div>
    </div>
  </nav>
</template>
<style scoped>
.nav-wrapper {
  position: fixed;
  top: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 1000;
  padding: 0 20px;
}

.glass-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1100px;
  padding: 10px 15px;
  /* Glassmorphism core */
  background: rgba(255, 255, 255, 0.05); /* Very transparent */
  backdrop-filter: blur(15px); /* This creates the frosted glass look */
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1); /* Subtle white border */
  border-radius: 100px; /* Makes it pill-shaped */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.logo img {
  height: 40px;
  width: 40px;
  border-radius: 50%;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 10px;
  margin: 0;
  padding: 0;
}

.nav-item {
  text-decoration: none;
  color: #7a4a3a;
  font-size: 14px;
  padding: 8px 18px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border: 1px solid #7a4a3a;
  transition: all 0.3s ease;
  font-family: Satoshi;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.router-link-active {
  background: #c05c3b !important;
  color: white !important;
  border-color: #c05c3b !important;
  box-shadow: 0 4px 12px rgba(192, 92, 59, 0.2);
}

.join-btn,
.auth {
  /* Gradient matching your Burnt Orange palette */
  background: linear-gradient(90deg, #f2994a 0%, #c05c3b 100%);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  font-size: 15px;
  box-shadow: 0 4px 15px rgba(192, 92, 59, 0.3);
}
.auth a {
  color: white;
  text-decoration: none;
}
.hamburger,
.sidebar {
  display: none;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .nav-cta {
    display: none;
  }
  .hamburger {
    display: flex;
    flex-direction: column;
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
  }
  .hamburger span {
    width: 25px;
    height: 3px;
    background: #7a4a3a;
    margin: 3px 0;
    transition: 0.3s;
  }
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 250px;
    height: 100vh;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    padding: 20px 20px 20px 5px;
    display: flex;
    flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    font-family: Satoshi;
  }
  .sidebar.show {
    transform: translateX(0);
  }
  .close-btn {
    align-self: flex-end;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #7a4a3a;
    margin-bottom: 20px;
  }
  .sidebar-links {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
  }
  .sidebar-item {
    text-decoration: none;
    color: #7a4a3a;
    font-size: 18px;
    padding: 15px 0 15px 15px;
    display: block;
    border-bottom: 1px solid rgba(122, 74, 58, 0.1);
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  .sidebar-item:hover {
    background: rgba(255, 255, 255, 0.1);
    padding-left: 10px;
  }
  .sidebar-cta {
    margin-top: auto;
    margin-bottom: 60px;
  }
  .sidebar-cta .auth {
    display: flex;
    width: 100%;
    padding: 15px 0;
    justify-content: center;
    text-decoration: none;
    font-size: 16px;
  }
}
</style>
