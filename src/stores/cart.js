import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useCartStore = defineStore(
  "cart",
  () => {
    const cartItems = ref([]);
    const customerInfo = ref({
      name: "",
      address: "",
      note: "",
    });

    const itemCount = computed(() =>
      cartItems.value.reduce((sum, item) => sum + item.quantity, 0),
    );

    const totalPrice = computed(() =>
      cartItems.value.reduce((sum, item) => sum + item.totalPrice, 0),
    );

    function incrementQty(index) {
      if (!cartItems.value[index]) return;
      cartItems.value[index].quantity++;
      cartItems.value[index].totalPrice =
        cartItems.value[index].pricePerUnit * cartItems.value[index].quantity;
    }

    function decrementQty(index) {
      if (!cartItems.value[index] || cartItems.value[index].quantity <= 1)
        return;
      cartItems.value[index].quantity--;
      cartItems.value[index].totalPrice =
        cartItems.value[index].pricePerUnit * cartItems.value[index].quantity;
    }

    function removeItem(index) {
      cartItems.value.splice(index, 1);
    }

    function clearCart() {
      cartItems.value = [];
    }

    return {
      cartItems,
      customerInfo,
      itemCount,
      totalPrice,
      incrementQty,
      decrementQty,
      removeItem,
      clearCart,
    };
  },
  {
    persist: true,
  },
);
