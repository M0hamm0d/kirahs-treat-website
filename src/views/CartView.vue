<script setup>
import { useCartStore } from "@/stores/cart";

const cartStore = useCartStore();

const handleCheckout = () => {
  const phoneNumber = "2348064288340";

  // 1. Header & Branding
  let message = `🧁 *NEW ORDER: KIRAH'S TREAT* 🧁\n`;
  message += `--------------------------\n\n`;

  // 2. Loop through Items
  cartStore.cartItems.forEach((item, index) => {
    message += `*${index + 1}. ${item.name}*\n`;
    message += `   Size/Type: ${item.variant}\n`;
    message += `   Qty: ${item.quantity}\n`;
    message += `   Price: ₦${(item.pricePerUnit * item.quantity).toLocaleString()}\n\n`;
  });

  // 3. Totals
  const total = cartStore.totalPrice;
  const finalTotal = total;

  message += `--------------------------\n`;
  message += `💰 *Total:* ₦${total.toLocaleString()}\n`;
  message += `✅ *TOTAL TO PAY:* ₦${finalTotal.toLocaleString()}\n\n`;

  // 4. Delivery Info (from your form)
  message += `📍 *DELIVERY DETAILS*\n`;
  message += `Name: ${cartStore.customerInfo.name || "(not provided)"}\n`;
  message += `Address: ${cartStore.customerInfo.address || "(not provided)"}\n`;

  if (cartStore.customerInfo.note) {
    message += `📝 *Note:* ${cartStore.customerInfo.note}\n`;
  }

  // 5. Encode and Launch
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
};
</script>

<template>
  <div class="cart-page-container">
    <div class="cart-wrapper">
      <div class="cart-items-section">
        <h1 class="cart-title">
          CART <span>[ {{ cartStore.itemCount }} ITEMS ]</span>
        </h1>

        <div v-if="cartStore.cartItems.length > 0" class="items-list">
          <div
            v-for="(item, index) in cartStore.cartItems"
            :key="index"
            class="cart-item"
          >
            <div class="item-img">
              <img :src="item.image" :alt="item.name" />
            </div>

            <div class="item-details">
              <div class="item-main-info">
                <h3>{{ item.name }}</h3>
                <p class="variant">{{ item.variant }}</p>
                <div class="qty-selector">
                  <button @click="cartStore.decrementQty(index)">-</button>
                  <span>{{ item.quantity }}</span>
                  <button @click="cartStore.incrementQty(index)">+</button>
                </div>
              </div>

              <div class="item-price-info">
                <p class="unit-price">₦{{ item.pricePerUnit }}</p>
                <div class="item-actions">
                  <button @click="cartStore.removeItem(index)" class="icon-btn">
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-cart-msg">
          <p>Your treat box is empty!</p>
          <RouterLink to="/menu" class="back-to-menu">Go to Menu</RouterLink>
        </div>
      </div>

      <div class="order-summary-section">
        <div class="summary-card">
          <h3>ORDER SUMMARY</h3>

          <div class="summary-line">
            <span>TOTAL</span>
            <span>₦{{ cartStore.totalPrice }}</span>
          </div>

          <p class="tax-disclaimer">Delivery fees calculated at checkout</p>

          <div class="customer-form">
            <label>Name</label>
            <input
              v-model="cartStore.customerInfo.name"
              type="text"
              placeholder="Your name"
            />

            <label>Address</label>
            <input
              v-model="cartStore.customerInfo.address"
              type="text"
              placeholder="Delivery address"
            />

            <label>Note (optional)</label>
            <textarea
              v-model="cartStore.customerInfo.note"
              placeholder="Any delivery notes"
            ></textarea>
          </div>

          <button class="checkout-btn" @click="handleCheckout">CHECKOUT</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page-container {
  padding: 120px 5% 60px;
  background-color: #fdf8f0;
  min-height: 100vh;
  font-family: Satoshi;
}

.cart-wrapper {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 50px;
  max-width: 1200px;
  margin: 0 auto;
}

.cart-title {
  font-size: 32px;
  font-weight: 800;
  color: #5d2a18;
  margin-bottom: 40px;
}

.cart-title span {
  font-size: 14px;
  opacity: 0.5;
  margin-left: 10px;
}

/* Item Styling */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.item-img {
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 8px;
  padding: 10px;
}

.item-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.item-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.item-main-info h3 {
  font-size: 18px;
  color: #5d2a18;
  text-transform: uppercase;
}

.variant {
  font-size: 12px;
  color: #7a4a3a;
  margin: 5px 0 15px;
  text-transform: uppercase;
}

.qty-selector {
  display: flex;
  align-items: center;
  gap: 15px;
}

.qty-selector button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}
.item-actions {
  width: fit-content;
  cursor: pointer;
  display: flex;
  justify-content: end;
}
.icon-btn {
  background-color: transparent;
  border: none;
  outline: none;
}

/* Summary Card */
.summary-card {
  background: white;
  padding: 30px;
  border-radius: 4px; /* Straight clean edges like inspo */
  position: sticky;
  top: 100px;
}

.summary-card h3 {
  font-size: 18px;
  margin-bottom: 25px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-weight: 600;
  font-size: 14px;
}

.total {
  font-size: 18px;
  margin-top: 20px;
}

.promo-code {
  display: flex;
  margin: 25px 0;
}

.promo-code input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  outline: none;
}

.promo-code button {
  background: #000;
  color: white;
  border: none;
  padding: 0 20px;
  cursor: pointer;
}

.customer-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
}

.customer-form label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #5d2a18;
}

.customer-form input,
.customer-form textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
}

textarea {
  resize: none;
  min-height: 80px;
}

.checkout-btn {
  width: 100%;
  background: #c05c3b; /* Brand Color */
  color: white;
  border: none;
  padding: 18px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 1px;
}

@media (max-width: 900px) {
  .cart-wrapper {
    grid-template-columns: 1fr;
  }
}
</style>
