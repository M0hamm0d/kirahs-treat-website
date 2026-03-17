<script setup>
import { onMounted, ref } from "vue";
import { useCart } from "@/composables/useCart";
import { useAuthStore } from "@/stores/auth";
import DeleteIcon from "../components/icons/DeleteIcon.vue";
import SkeletonCartItem from "../components/SkeletonCartItem.vue";
import SkeletonSummary from "../components/SkeletonSummary.vue";
import { useToastComposable } from "../composables/useToast";

const authStore = useAuthStore();
const cart = useCart();
const { successToast, errorToast } = useToastComposable();
const isCheckingOut = ref(false);

onMounted(async () => {
  await cart.fetchCarts();
  if (cart.error.value) {
    errorToast(cart.error.value);
  }
});

const handleRemoveItem = async (cartItemId) => {
  await cart.removeItem(cartItemId);
  if (cart.error.value) {
    errorToast(cart.error.value);
  } else {
    successToast("Item removed from cart");
  }
};

const handleIncrementQty = async (cartItemId, item) => {
  await cart.incrementQty(cartItemId, item);
  if (cart.error.value) {
    errorToast(cart.error.value);
  }
};

const handleDecrementQty = async (cartItemId, item) => {
  await cart.decrementQty(cartItemId, item);
  if (cart.error.value) {
    errorToast(cart.error.value);
  }
};

const handleCheckout = async () => {
  if (!cart.customerInfo.name || !cart.customerInfo.address) {
    errorToast("Please fill in name and address");
    return;
  }

  try {
    isCheckingOut.value = true;
    const phoneNumber = "2348064288340";

    let message = `🧁 *NEW ORDER: KIRAH'S TREAT* 🧁\n`;
    message += `--------------------------\n\n`;

    cart.cartItems.value.forEach((item, index) => {
      message += `*${index + 1}. ${item.name}*\n`;
      message += `   Size/Type: ${item.variant || "Standard"}\n`;
      message += `   Qty: ${item.quantity}\n`;
      message += `   Price: ₦${(item.pricePerUnit * item.quantity).toLocaleString()}\n\n`;
    });

    const total = cart.totalPrice.value;
    const finalTotal = total;

    message += `--------------------------\n`;
    message += `💰 *Total:* ₦${total.toLocaleString()}\n`;
    message += `✅ *TOTAL TO PAY:* ₦${finalTotal.toLocaleString()}\n\n`;

    message += `📍 *DELIVERY DETAILS*\n`;
    message += `Name: ${cart.customerInfo.name || "(not provided)"}\n`;
    message += `Address: ${cart.customerInfo.address || "(not provided)"}\n`;

    if (cart.customerInfo.note) {
      message += `📝 *Note:* ${cart.customerInfo.note}\n`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");

    successToast("Redirecting to WhatsApp...");

    // Clear cart after checkout
    setTimeout(() => {
      cart.clearCart();
    }, 1000);
  } catch (err) {
    errorToast(err.message || "Checkout failed");
  } finally {
    isCheckingOut.value = false;
  }
};
</script>

<template>
  <div class="cart-page-container">
    <!-- Error Alert -->
    <div v-if="cart.error.value" class="error-alert">
      <p>{{ cart.error.value }}</p>
      <button @click="cart.error.value = null">✕</button>
    </div>

    <div class="cart-wrapper">
      <div class="cart-items-section">
        <h1 class="cart-title">
          CART
          <span v-if="!cart.isLoading.value"
            >[ {{ cart.itemCount.value }} ITEMS ]</span
          >
        </h1>

        <!-- Loading skeletons -->
        <div v-if="cart.isLoading.value" class="items-list">
          <SkeletonCartItem v-for="n in 3" :key="n" />
        </div>

        <!-- Loaded cart items -->
        <div v-else-if="cart.cartItems.value.length > 0" class="items-list">
          <div
            v-for="item in cart.cartItems.value"
            :key="item.id"
            class="cart-item fade-in"
          >
            <div class="item-img">
              <img :src="item.image" :alt="item.name" />
            </div>

            <div class="item-details">
              <div class="item-main-info">
                <h3>{{ item.name }}</h3>
                <p class="variant">{{ item.variant || "Standard" }}</p>
                <div class="qty-selector">
                  <button
                    @click="handleDecrementQty(item.id, item)"
                    :disabled="cart.isLoading.value"
                  >
                    -
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button
                    @click="handleIncrementQty(item.id, item)"
                    :disabled="cart.isLoading.value"
                  >
                    +
                  </button>
                </div>
              </div>

              <div class="item-price-info">
                <p class="unit-price">
                  ₦{{ item.pricePerUnit.toLocaleString() }}
                </p>
                <div class="item-total">
                  ₦{{ item.totalPrice.toLocaleString() }}
                </div>
                <div class="item-actions">
                  <button
                    @click="handleRemoveItem(item.id)"
                    class="icon-btn"
                    :disabled="cart.isLoading.value"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty cart message -->
        <div v-else class="empty-cart-msg">
          <p>Your treat box is empty!</p>
          <RouterLink to="/menu" class="back-to-menu">Go to Menu</RouterLink>
        </div>
      </div>

      <div class="order-summary-section">
        <!-- Loading skeleton -->
        <SkeletonSummary v-if="cart.isLoading.value" />

        <!-- Loaded summary -->
        <div v-else class="summary-card fade-in">
          <h3>ORDER SUMMARY</h3>

          <div class="summary-line">
            <span>ITEMS</span>
            <span>{{ cart.itemCount.value }}</span>
          </div>

          <div class="summary-line total-line">
            <span>TOTAL</span>
            <span>₦{{ cart.totalPrice.value.toLocaleString() }}</span>
          </div>

          <p class="tax-disclaimer">Delivery fees calculated at checkout</p>

          <div class="customer-form">
            <label>Name *</label>
            <input
              v-model="cart.customerInfo.name"
              type="text"
              placeholder="Your name"
              required
            />

            <label>Address *</label>
            <input
              v-model="cart.customerInfo.address"
              type="text"
              placeholder="Delivery address"
              required
            />

            <label>Note <span>(optional)</span></label>
            <textarea
              v-model="cart.customerInfo.note"
              placeholder="Any delivery notes"
            ></textarea>
          </div>

          <button
            class="checkout-btn"
            @click="handleCheckout"
            :disabled="isCheckingOut || cart.cartItems.value.length === 0"
          >
            {{ isCheckingOut ? "Processing..." : "CHECKOUT" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.slide-in-right {
  animation: slideInRight 0.6s ease-out forwards;
}

/* Error Alert */
.error-alert {
  position: fixed;
  top: 120px;
  right: 20px;
  background: #ff4444;
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  animation: slideDown 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
  z-index: 1000;
}

.error-alert button {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
}

.cart-page-container {
  padding: 120px 5% 60px;
  background-color: #fdf8f0;
  min-height: 100vh;
  font-family: Satoshi;
  animation: fadeIn 0.4s ease-out;
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
  animation: fadeIn 0.5s ease-out;
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
  padding: 20px;
  background: white;
  border-radius: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.item-img {
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 8px;
  padding: 10px;
  flex-shrink: 0;
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
  align-items: flex-start;
}

.item-main-info h3 {
  font-size: 18px;
  color: #5d2a18;
  text-transform: uppercase;
  margin-bottom: 5px;
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
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  width: fit-content;
}

.qty-selector button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  color: #c05c3b;
  padding: 0 5px;
  transition: all 0.2s ease;
}

.qty-selector button:hover:not(:disabled) {
  color: #a04a2d;
  transform: scale(1.2);
}

.qty-selector button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-selector span {
  min-width: 30px;
  text-align: center;
  font-weight: 600;
}

.item-price-info {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.unit-price {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-total {
  font-size: 20px;
  font-weight: 700;
  color: #c05c3b;
}

.item-actions {
  width: fit-content;
  cursor: pointer;
  display: flex;
  justify-content: flex-end;
}

.icon-btn {
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.icon-btn:hover:not(:disabled) {
  background-color: #fff3ee;
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State */
.empty-cart-msg {
  text-align: center;
  padding: 60px 20px;
  animation: fadeIn 0.5s ease-out;
}

.empty-cart-msg p {
  font-size: 18px;
  color: #5d2a18;
  margin-bottom: 20px;
}

.back-to-menu {
  display: inline-block;
  background: #c05c3b;
  color: white;
  padding: 12px 30px;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.back-to-menu:hover {
  background: #a04a2d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(192, 92, 59, 0.3);
}

/* Summary Card */
.summary-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  position: sticky;
  top: 120px;
  animation: slideInRight 0.6s ease-out;
}

.summary-card h3 {
  font-size: 18px;
  margin-bottom: 25px;
  color: #5d2a18;
  font-weight: 700;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #555;
}

.summary-line span:last-child {
  font-weight: 600;
}

.total-line {
  border-top: 2px solid #f0f0f0;
  border-bottom: 2px solid #f0f0f0;
  padding: 12px 0;
  margin: 15px 0;
  font-size: 16px;
  color: #5d2a18;
  font-weight: 700;
}

.tax-disclaimer {
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
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
  text-transform: uppercase;
}

.customer-form label span {
  font-size: 10px;
  color: #999;
  font-weight: 400;
}

.customer-form input,
.customer-form textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
  color: #333;
  font-family: inherit;
  transition: all 0.2s ease;
}

.customer-form input:focus,
.customer-form textarea:focus {
  border-color: #c05c3b;
  background: #fff8f3;
}

textarea {
  resize: none;
  min-height: 80px;
}

.checkout-btn {
  width: 100%;
  background: #c05c3b;
  color: white;
  border: none;
  padding: 18px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 1px;
  border-radius: 4px;
  font-size: 14px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.checkout-btn:hover:not(:disabled) {
  background: #a04a2d;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(192, 92, 59, 0.4);
}

.checkout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .cart-wrapper {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: relative;
    top: auto;
  }

  .error-alert {
    right: 10px;
  }
}

@media (max-width: 600px) {
  .cart-page-container {
    padding: 80px 4% 40px;
  }

  .cart-title {
    font-size: 24px;
  }

  .item-details {
    flex-direction: column;
  }

  .item-price-info {
    width: 100%;
    align-items: flex-start;
  }

  .qty-selector {
    margin-top: 10px;
  }
}
</style>
