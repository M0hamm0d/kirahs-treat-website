<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import ProductModal from "../components/ProductModal.vue";
import { supabase } from "@/supabase";
import EmptyState from "../components/EmptyState.vue";

const activeSlide = ref(0);
const slideInterval = ref(null);
const openProductModal = ref(false);
const selectedProduct = ref(null);
const products = ref([]);
const totalPages = ref(0);
const category = ref([]);

const slides = [
  { id: 1, name: "Zobo and Chops", image: "/kirah-zobo-chops.png" },
  { id: 2, name: "Women and Chops", image: "/kirah-women-chops.png" },
];

function closeModal() {
  openProductModal.value = false;
  selectedProduct.value = null;
}

function nextSlide() {
  activeSlide.value = (activeSlide.value + 1) % slides.length;
}

function goToSlide(index) {
  activeSlide.value = index;
  resetTimer();
}

function startTimer() {
  slideInterval.value = setInterval(nextSlide, 5000);
}

function addToCartClickEmit() {
  console.log("çlose");
  openProductModal.value = false;
}

async function fetchCategory() {
  let { data: categories, error } = await supabase
    .from("categories")
    .select("*");
  if (error) {
    console.error("Error fetching categories:", error);
  } else {
    category.value = ["All", ...categories.map((cat) => cat.category)];
  }
}

function resetTimer() {
  clearInterval(slideInterval.value);
  startTimer();
}

onMounted(() => {
  startTimer();
  fetchCategory();
});

onUnmounted(() => {
  clearInterval(slideInterval.value);
});

const selectedCategory = ref("All");

function addToCart(item) {
  openProductModal.value = true;
  selectedProduct.value = item;
  console.log("Added to cart:", { ...item });
}
const page = ref(1);
function filterMenuByCategory(category, page = 1) {
  const itemsPerPage = 6;
  const offset = (page - 1) * itemsPerPage;

  selectedCategory.value = category;
  if (category === "All") {
    supabase
      .from("MenuItem")
      .select("*", { count: "exact" })
      .range(offset, offset + itemsPerPage - 1)
      .then(({ data, error, count }) => {
        if (!error) {
          products.value = data.map((item) => ({
            ...item,
            options: item.options.map((opt) => JSON.parse(opt)),
          }));
          totalPages.value = Math.ceil(count / itemsPerPage);
          console.log("category is ALL", products.value);
        } else {
          console.error("Error fetching menu items:", error);
        }
      });
  } else {
    supabase
      .from("MenuItem")
      .select("*", { count: "exact" })
      .eq("category", category)
      .range(offset, offset + itemsPerPage - 1)
      .then(({ data, error, count }) => {
        if (!error) {
          products.value = data.map((item) => ({
            ...item,
            options: item.options.map((opt) => JSON.parse(opt)),
          }));
          totalPages.value = Math.ceil(count / itemsPerPage);
          console.log(`category is ${category}`, products.value);
        } else {
          console.error("Error fetching menu items:", error);
        }
      });
  }
}
onMounted(() => {
  filterMenuByCategory("All");
});
function loadMore(pageNumber) {
  page.value = pageNumber;
  filterMenuByCategory(selectedCategory.value, page.value);
}
watch(selectedCategory, (newCategory) => {
  page.value = 1;
  filterMenuByCategory(newCategory, page.value);
});
watch(page, (newPage) => {
  filterMenuByCategory(selectedCategory.value, newPage);
});
</script>

<template>
  <div class="slider-container">
    <div class="slider-content">
      <transition name="fade">
        <div v-show="activeSlide === 0" class="slide">
          <img src="/menu-1.png" alt="Kirah's Treat Box Zobo & Small Chops" />
        </div>
      </transition>

      <transition name="fade">
        <div v-show="activeSlide === 1" class="slide">
          <img
            src="/menu-png2.png"
            alt="Two women enjoying Kirah's Treat small chops and bliss"
          />
        </div>
      </transition>
    </div>

    <div class="slider-dots">
      <span
        v-for="(_, index) in slides"
        :key="index"
        :class="{ active: activeSlide === index }"
        @click="goToSlide(index)"
      ></span>
    </div>
  </div>
  <section class="menu-container">
    <div class="header-center">
      <h2>Our Regular <span>Menu Pack</span></h2>
    </div>

    <div class="filter-pills">
      <button
        v-for="cat in category"
        :key="cat"
        :class="{ active: selectedCategory === cat }"
        @click="filterMenuByCategory(cat)"
      >
        {{ cat }}
      </button>
    </div>

    <div class="product-grid">
      <div
        v-for="item in products"
        :key="item.id"
        class="product-card"
        v-animate-on-scroll="'fade-up'"
      >
        <div class="out-of-stock" v-if="!item.hasOptions && item.out_of_stock">
          Out of Stock
        </div>
        <div class="img-container">
          <img :src="item.image" :alt="item.name" />
        </div>
        <div class="card-body">
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
          <div class="card-footer">
            <span class="price"
              >₦{{
                item.hasOptions ? item.options[0].price : item.basePrice
              }}</span
            >
            <button
              :class="{
                'add-to-cart': true,
                disabled: !item.hasOptions && item.out_of_stock,
              }"
              @click="addToCart(item)"
              :disabled="!item.hasOptions && item.out_of_stock"
            >
              Add To Cart
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="empty-state" v-if="products.length === 0">
      <EmptyState @clear="filterMenuByCategory('All')" />
    </div>
    <div class="load-more" v-if="totalPages > 1">
      <div class="pagination-pill">
        <button
          class="arrow-btn"
          :disabled="page === 1"
          @click="loadMore(page - 1)"
        >
          &lt;
        </button>

        <div class="numbers">
          <button
            v-for="n in totalPages"
            :key="n"
            :class="{ active: page === n }"
            @click="loadMore(n)"
          >
            {{ n }}
          </button>
        </div>

        <button
          class="arrow-btn"
          :disabled="page === totalPages"
          @click="loadMore(page + 1)"
        >
          &gt;
        </button>

        <div class="go-to-page">
          <span>Go to</span>
          <input
            type="number"
            v-model.number="page"
            min="1"
            :max="totalPages"
            @keyup.enter="loadMore(page)"
          />
          <span>Page</span>
        </div>
      </div>
    </div>
    <div class="" v-if="openProductModal">
      <ProductModal
        :product="selectedProduct"
        @close="closeModal"
        @addToCartClicked="addToCartClickEmit"
      />
    </div>
  </section>
</template>

<style scoped>
/* Slider Styles */
.slider-container {
  position: relative;
  width: 100%;
  height: 60vh;
  /* overflow: hidden; */
  margin-top: -80px;
  background-color: #fdf8f0;
  padding: 230px 0 30px;
}

.slider-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide {
  position: absolute;
  top: 0px;
  left: 0;
  width: 100%;
  /* max-height: 800px;
  height: 100%; */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background-color: #fdf2ee;
}

.slide img {
  width: 100%;
  /* height: 100%; */
  object-fit: cover;
  object-position: center;
  border-radius: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slider-dots {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}

.slider-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(93, 42, 24, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.slider-dots span.active {
  background-color: #c05c3b;
  transform: scale(1.3);
}
/*Menu*/
.menu-container {
  padding: 100px 5%;
  background-color: #fdf8f0;
  text-align: center;
  font-family: Satoshi;
}

.header-center h2 {
  font-size: 38px;
  color: #5d2a18;
  margin-bottom: 40px;
}

.header-center h2 span {
  color: #c05c3b;
}

/* Filter Pills Styling */
.filter-pills {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.filter-pills button {
  padding: 10px 25px;
  border-radius: 50px;
  border: 1px solid #c05c3b;
  background: white;
  color: #c05c3b;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.filter-pills button.active,
.filter-pills button:hover {
  background: #c05c3b;
  color: white;
  box-shadow: 0 4px 15px rgba(192, 92, 59, 0.3);
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

.product-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  transition: transform 0.3s ease;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.02);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.out-of-stock {
  position: absolute;
  top: 25px;
  right: 25px;
  background: rgba(192, 92, 59, 0.9);
  background-color: #b91c1c;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(93, 42, 24, 0.1);
}

.img-container {
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: 15px;
}

.img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Keeps food looking realistic */
  margin-bottom: 15px;
}

.card-body {
  text-align: left;
}

.rating {
  font-size: 12px;
  margin-bottom: 8px;
}

.card-body h3 {
  margin: 0 0 10px;
  color: #5d2a18;
}

.card-body p {
  font-size: 14px;
  color: #7a4a3a;
  opacity: 0.8;
  margin-bottom: 20px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: 800;
  font-size: 20px;
  color: #5d2a18;
}

.add-to-cart {
  padding: 8px 15px;
  border-radius: 50px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: Satoshi;
}

.add-to-cart:hover {
  background: #c05c3b;
  color: white;
  border-color: #c05c3b;
}
.add-to-cart.disabled,
.add-to-cart:disabled {
  background: #eee;
  color: #aaa;
  border-color: #eee;
  cursor: not-allowed;
}
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.pagination-pill {
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 24px;
  border-radius: 100px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  gap: 15px;
}

.numbers {
  display: flex;
  align-items: center;
  gap: 5px;
}

.numbers button,
.arrow-btn {
  background: transparent;
  border: none;
  color: #7a4a3a;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.numbers button.active {
  background: #c05c3b;
  color: white;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(192, 92, 59, 0.3);
}

.arrow-btn {
  color: #c05c3b;
  font-weight: 900;
}

.arrow-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.go-to-page {
  display: flex;
  align-items: center;
  gap: 10px;
  border-left: 1px solid #eee;
  padding-left: 20px;
  color: #7a4a3a;
  font-weight: 500;
}

.go-to-page input {
  width: 50px;
  height: 35px;
  background: #fdf2ee;
  border: 1px solid #c05c3b;
  border-radius: 10px;
  text-align: center;
  color: #5d2a18;
  font-weight: 700;
  outline: none;
}

.go-to-page input::-webkit-inner-spin-button,
.go-to-page input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
@media (max-width: 768px) {
  .pagination-pill {
    flex-direction: column;
    border-radius: 24px;
    padding: 15px;
    gap: 10px;
    width: 90%;
  }

  .go-to-page {
    border-left: none; /* Remove vertical divider */
    border-top: 1px solid #eee; /* Add horizontal divider instead */
    padding-left: 0;
    padding-top: 10px;
    width: 100%;
    justify-content: center;
  }
  .slider-container {
    height: 0vh;
  }
  .slider-dots {
    display: none;
  }
}

@media (max-width: 480px) {
  .numbers button {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .numbers {
    flex-wrap: wrap;
    justify-content: center;
  }
  .header-center h2 {
    font-size: 32px;
  }
}
</style>
