<script setup>
import { ref, computed, onMounted } from "vue";
import { useToastComposable } from "../composables/useToast";
import { useAuthStore } from "../stores/auth";
import { supabase } from "@/supabase";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const { successToast, errorToast } = useToastComposable();

const emit = defineEmits(["addToCartClicked", "close"]);

const quantity = ref(1);
const selectedOptionIndex = ref(0);
const authStore = useAuthStore();
const isAddingToCart = ref(false);

const totalPrice = computed(() => {
  if (props.product.options && props.product.options.length > 0) {
    const option = props.product.options[selectedOptionIndex.value];

    if (option.out_of_stock) {
      return 0;
    }
    return option.price * quantity.value;
  }
  return props.product.basePrice * quantity.value;
});

function increment() {
  quantity.value++;
}

function decrement() {
  if (quantity.value > 1) quantity.value--;
}

async function handleAddToCart() {
  try {
    isAddingToCart.value = true;

    console.log("auth store", authStore?.userProfile);

    if (!authStore?.userProfile?.id) {
      errorToast("Please log in to add items to cart");
      return;
    }

    const selection = props.product?.options?.[selectedOptionIndex.value];
    const productId = props.product.id;

    const orderDetails = {
      user_id: authStore.userProfile.id,
      product_id: productId,
      name: props.product.name,
      description: props.product.description,
      image: props.product.image,
      hasOptions: props.product.options && props.product.options.length > 0,
      variant: selection?.size || null,
      pricePerUnit: selection?.price || props.product.basePrice,
      quantity: quantity.value,
      totalPrice: totalPrice.value,
    };

    // Check for existing cart item
    const { data: carts, error: fetchError } = await supabase
      .from("carts")
      .select("*")
      .eq("user_id", authStore.userProfile.id)
      .eq("product_id", productId);

    if (fetchError) throw fetchError;

    let existingItem = null;

    if (orderDetails.hasOptions) {
      existingItem = carts?.find(
        (item) =>
          item.product_id === productId &&
          item.variant === orderDetails.variant,
      );
    } else {
      existingItem = carts?.[0];
    }

    if (existingItem) {
      const newQuantity = existingItem.quantity + orderDetails.quantity;
      const newTotal = newQuantity * orderDetails.pricePerUnit;

      const { error: updateError } = await supabase
        .from("carts")
        .update({
          quantity: newQuantity,
          totalPrice: newTotal,
        })
        .eq("id", existingItem.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("carts")
        .insert([orderDetails]);

      if (insertError) throw insertError;
    }

    emit("addToCartClicked");
    successToast(`${props.product.name} added to cart!`);

    // Reset form
    quantity.value = 1;
    selectedOptionIndex.value = 0;

    // Close modal after short delay
    setTimeout(() => {
      emit("close");
    }, 500);
  } catch (err) {
    errorToast(err.message || "Failed to add item to cart");
    console.error("Cart error:", err);
  } finally {
    isAddingToCart.value = false;
  }
}

onMounted(() => {
  console.log(
    "Product modal mounted, user authenticated:",
    authStore.isAuthenticated,
  );
});
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content stacked-layout">
      <button class="close-btn" @click="$emit('close')">&times;</button>

      <div class="product-image-container">
        <img :src="product.image" :alt="product.name" />
      </div>

      <div class="text-content">
        <h3>{{ product.name }}</h3>
        <p class="description">{{ product.description }}</p>
      </div>

      <div
        v-if="product.options && product.options.length > 0"
        class="options-section"
      >
        <h4>Choose Size</h4>
        <div class="options-list">
          <div
            v-for="(opt, index) in product.options"
            :key="index"
            class="option-item"
          >
            <input
              type="radio"
              :id="'size-' + index"
              name="product-size"
              :value="index"
              v-model="selectedOptionIndex"
              :disabled="opt.out_of_stock"
            />
            <label :for="'size-' + index">
              <span class="size-name">{{ opt.size }}</span>
              <span class="price" v-if="!opt.out_of_stock"
                >₦{{ opt.price }}</span
              >
              <span class="price" v-else>Out of Stock</span>
            </label>
          </div>
        </div>
      </div>
      <div class="">
        <h3 v-if="!product.options[selectedOptionIndex]?.out_of_stock">
          Total Price: ₦{{ totalPrice.toLocaleString() }}
        </h3>
        <h3 v-else class="out-of-stock">
          This option is currently out of stock
        </h3>
      </div>

      <div class="actions-section">
        <div
          class="quantity-control"
          v-if="!product.options[selectedOptionIndex]?.out_of_stock"
        >
          <button @click="decrement" :disabled="quantity <= 1">-</button>
          <span>{{ quantity }}</span>
          <button @click="increment">+</button>
        </div>

        <button
          class="add-btn stacked"
          :class="{
            'add-btn': true,
            stacked: true,
            disabled:
              product.options[selectedOptionIndex]?.out_of_stock ||
              isAddingToCart,
          }"
          @click="handleAddToCart"
          :disabled="
            product.options[selectedOptionIndex]?.out_of_stock || isAddingToCart
          "
        >
          {{ isAddingToCart ? "Adding..." : "Add To Cart" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal Animations */
@keyframes fadeInOverlay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUpModal {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeInOverlay 0.3s ease-out;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 400px;
  max-height: 500px;
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  border-radius: 20px;
  padding: 30px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideUpModal 0.4s ease-out;
}
.modal-content::-webkit-scrollbar {
  display: none;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  color: #aaa;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #5d2a18;
  transform: scale(1.1);
}

.stacked-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-image-container img {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.text-content h3 {
  color: #5d2a18;
  font-size: 24px;
  margin-bottom: 5px;
}
.text-content .description {
  color: #7a4a3a;
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.8;
}

.options-section h4 {
  color: #c05c3b;
  font-size: 16px;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item input {
  display: none;
}

.option-item label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border: 1px solid #ddd;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item label:hover {
  border-color: #c05c3b;
  background-color: #fdfdfd;
}

.option-item input:checked + label {
  background: #5d2a18;
  color: white;
  border-color: #5d2a18;
}

.size-name {
  font-weight: 600;
  font-size: 16px;
}
.option-item label .price {
  font-weight: 700;
  font-size: 16px;
}
.option-item input:checked + label .price {
  color: #fdf8f0;
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #f2ebe4;
}

.quantity-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 50px;
  padding: 5px;
  max-width: 150px;
  margin: 0 auto;
}

.quantity-control button {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: none;
  background-color: #fdf8f0;
  color: #5d2a18;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.quantity-control button:hover:not(:disabled) {
  background-color: #c05c3b;
  color: white;
  transform: scale(1.1);
}

.quantity-control button:disabled {
  opacity: 0.5;
  cursor: default;
}
.quantity-control span {
  font-size: 18px;
  font-weight: 700;
  color: #5d2a18;
}

.add-btn.stacked {
  width: 100%;
  background: #c05c3b;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 10px 20px rgba(192, 92, 59, 0.2);
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.add-btn.stacked:hover:not(:disabled) {
  background-color: #a04a2f;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(192, 92, 59, 0.35);
}
.add-btn.stacked:disabled {
  background: #eee;
  color: #aaa;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .modal-overlay {
    padding: 0;
  }

  .modal-content {
    border-radius: 12px;
  }
}
</style>
