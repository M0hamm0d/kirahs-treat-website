import { ref, computed, watch } from "vue";
import { supabase } from "@/supabase";
import { useAuthStore } from "@/stores/auth";

export function useCart() {
  const authStore = useAuthStore();
  const cartItems = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
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

  // Fetch carts from Supabase
  const fetchCarts = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      if (!authStore?.userProfile?.id) {
        throw new Error("User not authenticated");
      }

      const { data, error: fetchError } = await supabase
        .from("carts")
        .select("*")
        .eq("user_id", authStore.userProfile.id);

      if (fetchError) throw fetchError;

      cartItems.value = data || [];
    } catch (err) {
      error.value = err.message || "Failed to fetch cart items";
      console.error("Cart fetch error:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Increment quantity
  const incrementQty = async (cartItemId, currentItem) => {
    try {
      error.value = null;
      const newQuantity = currentItem.quantity + 1;
      const newTotalPrice = newQuantity * currentItem.pricePerUnit;

      const { error: updateError } = await supabase
        .from("carts")
        .update({
          quantity: newQuantity,
          totalPrice: newTotalPrice,
        })
        .eq("id", cartItemId);

      if (updateError) throw updateError;

      // Update local state
      const itemIndex = cartItems.value.findIndex(
        (item) => item.id === cartItemId,
      );
      if (itemIndex !== -1) {
        cartItems.value[itemIndex].quantity = newQuantity;
        cartItems.value[itemIndex].totalPrice = newTotalPrice;
      }
    } catch (err) {
      error.value = err.message || "Failed to update quantity";
      console.error("Increment error:", err);
    }
  };

  // Decrement quantity
  const decrementQty = async (cartItemId, currentItem) => {
    try {
      error.value = null;
      if (currentItem.quantity <= 1) {
        throw new Error("Quantity cannot be less than 1");
      }

      const newQuantity = currentItem.quantity - 1;
      const newTotalPrice = newQuantity * currentItem.pricePerUnit;

      const { error: updateError } = await supabase
        .from("carts")
        .update({
          quantity: newQuantity,
          totalPrice: newTotalPrice,
        })
        .eq("id", cartItemId);

      if (updateError) throw updateError;

      // Update local state
      const itemIndex = cartItems.value.findIndex(
        (item) => item.id === cartItemId,
      );
      if (itemIndex !== -1) {
        cartItems.value[itemIndex].quantity = newQuantity;
        cartItems.value[itemIndex].totalPrice = newTotalPrice;
      }
    } catch (err) {
      error.value = err.message || "Failed to update quantity";
      console.error("Decrement error:", err);
    }
  };

  // Remove item from cart
  const removeItem = async (cartItemId) => {
    try {
      error.value = null;

      const { error: deleteError } = await supabase
        .from("carts")
        .delete()
        .eq("id", cartItemId);

      if (deleteError) throw deleteError;

      // Update local state
      cartItems.value = cartItems.value.filter(
        (item) => item.id !== cartItemId,
      );
    } catch (err) {
      error.value = err.message || "Failed to remove item";
      console.error("Remove error:", err);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      error.value = null;

      if (!authStore?.userProfile?.id) {
        throw new Error("User not authenticated");
      }

      const { error: deleteError } = await supabase
        .from("carts")
        .delete()
        .eq("user_id", authStore.userProfile.id);

      if (deleteError) throw deleteError;

      cartItems.value = [];
    } catch (err) {
      error.value = err.message || "Failed to clear cart";
      console.error("Clear cart error:", err);
    }
  };

  return {
    cartItems,
    isLoading,
    error,
    customerInfo,
    itemCount,
    totalPrice,
    fetchCarts,
    incrementQty,
    decrementQty,
    removeItem,
    clearCart,
  };
}
