<template>
  <div class="skeleton-summary">
    <div class="skeleton-line skeleton-title"></div>
    <div class="skeleton-line skeleton-price-line"></div>
    <div class="skeleton-line skeleton-price-line"></div>
    <div class="skeleton-divider"></div>
    <div class="skeleton-line skeleton-input"></div>
    <div class="skeleton-line skeleton-input"></div>
    <div class="skeleton-line skeleton-input"></div>
    <div class="skeleton-button"></div>
  </div>
</template>

<style scoped>
.skeleton-summary {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  animation: shimmer 2s infinite;
}

.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  border-radius: 4px;
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  margin-bottom: 16px;
}

.skeleton-title {
  height: 28px;
  width: 70%;
}

.skeleton-price-line {
  height: 20px;
  width: 100%;
}

.skeleton-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 20px 0;
}

.skeleton-input {
  height: 44px;
  width: 100%;
  margin-bottom: 16px;
}

.skeleton-button {
  height: 48px;
  width: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  border-radius: 8px;
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
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
