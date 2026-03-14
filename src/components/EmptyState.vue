<script setup>
const vAnimateOnScroll = {
  mounted(el, binding) {
    const animationClass = binding.value || "fade-up";
    el.classList.add(animationClass);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    el._observer = observer;
  },
  unmounted(el) {
    if (el._observer) {
      el._observer.unobserve(el);
      el._observer.disconnect();
      delete el._observer;
    }
  },
};
</script>
<template>
  <div class="empty-state-container" v-animate-on-scroll="'fade-up'">
    <div class="icon-box">
      <span class="icon">🍱</span>
    </div>

    <h3>No treats found in this category</h3>
    <p>
      It seems we don't have any items here right now. Try browsing another
      category or check back later!
    </p>

    <button class="clear-filter-btn" @click="$emit('clear')">
      View All Menu
    </button>
  </div>
</template>

<style scoped>
.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  /* Matching your Grid background */
  background: rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  border: 2px dashed #f2ebe4;
  margin: 20px 0;
}

.icon-box {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

h3 {
  color: #5d2a18;
  font-size: 22px;
  margin-bottom: 12px;
}

p {
  color: #7a4a3a;
  max-width: 350px;
  line-height: 1.6;
  opacity: 0.8;
  margin-bottom: 30px;
}

.clear-filter-btn {
  background: #c05c3b;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.clear-filter-btn:hover {
  transform: scale(1.05);
}
</style>
