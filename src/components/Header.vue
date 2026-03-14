<script setup>
const links = [
  { name: "Home", path: "/" },
  { name: "Menu", path: "/menu" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "About", path: "/about" },
  { name: "Contact us", path: "/contact" },
];
</script>
<template>
  <nav class="nav-wrapper">
    <div class="glass-header">
      <div class="logo">
        <img src="/kirah_treat_logo.png" alt="Logo" />
      </div>

      <ul class="nav-links">
        <li v-for="link in links" :key="link.name">
          <RouterLink :to="link.path" class="nav-item">
            {{ link.name }}
          </RouterLink>
        </li>
      </ul>

      <div class="nav-cta">
        <button class="join-btn">Order Now</button>
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

.join-btn {
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

@media (max-width: 768px) {
  .nav-links {
    display: none; /* You'll need a mobile hamburger menu here later */
  }
}
</style>
