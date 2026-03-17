<template>
  <div class="skeleton-cart-item">
    <div class="skeleton-img"></div>
    <div class="skeleton-details">
      <div class="skeleton-line skeleton-name"></div>
      <div class="skeleton-line skeleton-variant"></div>
      <div class="skeleton-line skeleton-short"></div>
      <div class="skeleton-line skeleton-short"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-cart-item {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 30px;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 20px;
  animation: shimmer 2s infinite;
}

.skeleton-img {
  width: 150px;
  height: 150px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  border-radius: 8px;
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.skeleton-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  border-radius: 4px;
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.skeleton-name {
  height: 24px;
  width: 80%;
}

.skeleton-variant {
  height: 16px;
  width: 60%;
}

.skeleton-short {
  height: 14px;
  width: 70%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
