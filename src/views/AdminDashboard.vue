<script setup>
import { onMounted, ref } from "vue";
import { useEvent } from "../composables/useEvent";
import { supabase } from "@/supabase";

const { uploadFile } = useEvent();

const category = ref([]);
const imagePreview = ref(null);
const addMenuClicked = ref(false);
const addCategoryClicked = ref(false);
const currentFileName = ref("");
const loading = ref(false);
const errorMessage = ref("");
const menuItems = ref([]);
const editingItem = ref(false);
const isLoading = ref(false);
const isEditing = ref(false);

const form = ref({
  name: "",
  category: "Donuts",
  description: "",
  image: null,
  hasOptions: false,
  basePrice: "",
  out_of_stock: false,
  options: [{ size: "", price: "", out_of_stock: false }],
});
const categoryForm = ref({
  name: "",
});

async function fetchCategory() {
  let { data: categories, error } = await supabase
    .from("categories")
    .select("*");
  if (error) {
    console.error("Error fetching categories:", error);
  } else {
    category.value = categories.map((cat) => cat.category);
    // console.log(category.value);
  }
}

function resetForm() {
  form.value = {
    name: "",
    category: "Donuts",
    description: "",
    image: null,
    hasOptions: false,
    basePrice: "",
    out_of_stock: false,
    options: [{ size: "", price: "", out_of_stock: false }],
  };
  currentFileName.value = "";
  editingItem.value = false;
}

function addMenuItemClickedFunction() {
  addMenuClicked.value = false;
  resetForm();
}

function addCategoryClickedFunction() {
  addCategoryClicked.value = false;
  categoryForm.value = {
    name: "",
  };
  isEditing.value = false;
}

function addOption() {
  form.value.options.push({ size: "", price: "" });
}

function removeOption(index) {
  form.value.options.splice(index, 1);
}

function editCategory(cat) {
  isEditing.value = true;
  categoryForm.value.name = cat;
  addCategoryClicked.value = true;
  console.log("Edit category:", cat);
}
async function createCategory() {
  isLoading.value = true;
  try {
    await supabase
      .from("categories")
      .insert([{ category: categoryForm.value.name }]);
    addCategoryClicked.value = false;
    categoryForm.value.name = "";
  } catch (err) {
    console.error("Failed to create category:", err.message);
  } finally {
    isLoading.value = false;
  }
}

function editItem(item) {
  console.log({ ...item });
  form.value = {
    name: item.name,
    category: item.category,
    description: item.description,
    image: item.image,
    hasOptions: item.hasOptions,
    basePrice: item.basePrice,
    out_of_stock: item.out_of_stock,
    options: item.options.map((opt) => ({
      size: opt.size,
      price: opt.price,
      out_of_stock: opt.out_of_stock,
    })),
    id: item.id,
  };
  editingItem.value = true;
  addMenuClicked.value = true; // Open modal
}

function deleteItem(item) {
  // Logic to delete the item from the database
  if (confirm(`Are you sure you want to delete ${item.name}?`)) {
    supabase
      .from("MenuItem")
      .delete()
      .eq("id", item.id)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error deleting item:", error);
        } else {
          alert("Product Deleted Successfully!");
          menuItems.value = menuItems.value.filter((i) => i.id !== item.id);
        }
      });
  }
}

// function handleFileUpload(e) {
//   const file = e.target.files[0];
//   form.value.image = file;
//   imagePreview.value = URL.createObjectURL(file);
// }

async function handleFileUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const maxSize = 3 * 1024 * 1024;
  loading.value = true;
  if (file.size > maxSize) {
    console.error("File is too large! Please upload an image under 3MB.");
    loading.value = false;
    return;
  }
  const result = await uploadFile(file, currentFileName.value);
  console.log(result);
  loading.value = false;

  if (result.success) {
    form.value.image = result.url;
    imagePreview.value = result.url;
    currentFileName.value = result.fileName;
  } else {
    errorMessage.value = result.error;
    console.error(result.error);
  }
}
const editingLoading = ref(false);
async function updateItem() {
  console.log("Updating item with form data:", { ...form.value });
  editingLoading.value = true;
  try {
    const { data, error } = await supabase
      .from("MenuItem")
      .update({ ...form.value })
      .eq("id", form.value.id)
      .select();
    menuItems.value = menuItems.value.map((item) =>
      item.id === form.value.id ? { ...item, ...form.value } : item,
    );
    if (error) throw error;
    alert("Product Updated Successfully!");
  } catch (err) {
    console.error("Update failed:", err.message);
  } finally {
    editingLoading.value = false;
    addMenuClicked.value = false;
    resetForm();
  }
}

async function saveProduct() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const payload = {
      name: form.value.name,
      category: form.value.category,
      description: form.value.description,
      image: form.value.image,
      hasOptions: form.value.hasOptions,
      out_of_stock: form.value.out_of_stock,
      basePrice: form.value.basePrice ? Number(form.value.basePrice) : 0,
      options: form.value.hasOptions
        ? form.value.options.map((opt) => ({
            size: opt.size,
            price: Number(opt.price),
          }))
        : [],
    };

    console.log("Saving Clean Payload:", payload);

    const { data, error } = await supabase.from("MenuItem").insert([payload]);
    menuItems.value.push(payload);

    if (error) throw error;

    alert("Product Saved Successfully!");
    addMenuClicked.value = false; // Close modal
    resetForm();
  } catch (err) {
    console.error("Save failed:", err.message);
    errorMessage.value = "Failed to save: " + err.message;
  } finally {
    loading.value = false;
  }
}
onMounted(async () => {
  await fetchCategory();
  let { data, error } = await supabase.from("MenuItem").select("*");
  console.log(data, "data");
  menuItems.value = data.map((item) => ({
    ...item,
    options: item.options.map((opt) => JSON.parse(opt)),
  }));
  if (error) {
    console.log(error);
  }
});

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
  <div class="admin-dashboard">
    <div class="admin-header">
      <h1>Admin Dashboard</h1>
      <button class="add-btn" @click="addMenuClicked = true">
        + Add Menu Item
      </button>
    </div>

    <div class="admin-content">
      <div class="product-list">
        <h2>Product List</h2>
        <!-- Render list of products here -->
        <div class="product-grid">
          <div
            v-for="item in menuItems"
            :key="item.id"
            class="product-card"
            v-animate-on-scroll="'fade-up'"
          >
            <div class="img-container">
              <img :src="item.image" :alt="item.name" />
            </div>
            <div class="card-body">
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
              <div class="card-footer">
                <!-- <span class="price"
                  >₦{{
                    item.hasOptions ? item.options[0].price : item.basePrice
                  }}</span
                > -->
                <button class="edit" @click="editItem(item)">Edit</button>
                <button class="delete" @click="deleteItem(item)">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="category-container">
      <div class="admin-category-header">
        <button class="add-btn" @click="addCategoryClicked = true">
          + Add Category
        </button>
      </div>
      <h2>Categories</h2>
      <div class="categories-grid">
        <div
          v-for="cat in category"
          :key="cat"
          class="category-card"
          v-animate-on-scroll="'fade-up'"
        >
          <p class="">{{ cat }}</p>
          <div class="actions">
            <button class="edit" title="Edit" @click="editCategory(cat)">
              Edit
            </button>
            <button
              class="delete"
              title="Delete"
              @click="deleteCategory(cat.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Menu Modal -->
  </div>
  <div
    class="admin-modal-overlay"
    @click.self="addMenuItemClickedFunction"
    v-if="addMenuClicked"
  >
    <div class="admin-card" @click.stop>
      <div class="admin-header">
        <h2>Add New Menu Item</h2>
        <button class="close-x" @click="addMenuItemClickedFunction">
          &times;
        </button>
      </div>

      <form @submit.prevent="saveProduct" class="admin-form">
        <div class="form-group">
          <label>Product Name</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. Donut Pack"
            required
          />
        </div>

        <div class="form-group">
          <label>Category</label>
          <select v-model="form.category">
            <option v-for="cat in category" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
            rows="6"
            v-model="form.description"
            placeholder="Describe the treat..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>Image Upload</label>
          <div class="image-upload-zone">
            <input type="file" @change="handleFileUpload" accept="image/*" />
            <p v-if="!form.image">Click to upload product image</p>
            <img v-else :src="imagePreview" class="preview-img" />
          </div>
        </div>

        <div class="checkbox-group">
          <input type="checkbox" id="hasOptions" v-model="form.hasOptions" />
          <label for="hasOptions">Does this product have size options?</label>
        </div>

        <hr class="divider" />

        <div class="" v-if="!form.hasOptions">
          <div class="form-group animate-fade">
            <label>Price (₦)</label>
            <input v-model="form.basePrice" type="number" placeholder="4500" />
          </div>
          <div class="out-of-stock" v-if="editingItem && !form.hasOptions">
            <label>
              <input type="checkbox" v-model="form.out_of_stock" />
              Out of Stock
            </label>
          </div>
        </div>

        <div v-else class="options-manager animate-fade">
          <label>Size Options</label>
          <div class="options-header">
            <span>Size</span>
            <span>Price (₦)</span>
          </div>

          <div class="option-row-container">
            <div
              v-for="(opt, index) in form.options"
              :key="index"
              class="option-row"
            >
              <input v-model="opt.size" type="text" placeholder="Small" />
              <input v-model="opt.price" type="number" placeholder="4500" />
              <button
                type="button"
                @click="removeOption(index)"
                class="remove-btn"
              >
                &times;
              </button>
              <div class="out-of-stock" v-if="editingItem">
                <label>
                  <input type="checkbox" v-model="opt.out_of_stock" />
                  Out of Stock
                </label>
              </div>
            </div>
          </div>

          <button type="button" @click="addOption" class="add-option-btn">
            + Add Another Option
          </button>
        </div>

        <div class="form-actions">
          <button type="submit" class="save-btn" v-if="!editingItem">
            {{ loading ? "Saving..." : "Save Product" }}
          </button>
          <button
            v-else
            type="button"
            class="save-edit-btn save-btn"
            @click="updateItem"
          >
            {{ editingLoading ? "Updating..." : "Update Item" }}
          </button>
        </div>
      </form>
    </div>
  </div>
  <div
    class="add-category-modal"
    v-if="addCategoryClicked"
    @click.self="addCategoryClickedFunction"
  >
    <div class="admin-container" @click.stop>
      <div class="admin-panel" v-animate-on-scroll="'fade-up'">
        <div class="panel-header">
          <div>
            <h2>{{ isEditing ? "Edit" : "Add New" }} Category</h2>
            <p>
              {{
                isEditing
                  ? "Update the details below"
                  : "Create a new group for your treats"
              }}
            </p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="category-form">
          <div class="form-group">
            <label>Category Name</label>
            <input
              v-model="categoryForm.name"
              type="text"
              placeholder="e.g. Gourmet Donuts"
              required
            />
          </div>

          <div class="button-group">
            <button
              v-if="isEditing"
              type="button"
              class="save-edit-btn submit-btn"
              @click="handleCategoryEdit"
            >
              {{ isLoading ? "Processing..." : "Update Category" }}
            </button>
            <button
              v-else
              type="submit"
              class="submit-btn"
              @click="createCategory"
              :disabled="isLoading"
            >
              {{ isLoading ? "Processing..." : "Add Category" }}
            </button>
            <button
              v-if="isEditing"
              type="button"
              class="cancel-btn"
              @click="resetForm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  outline: none;
  resize: none;
}
.admin-dashboard {
  font-family: Satoshi;
  padding-top: 100px;
  background-color: #fdf8f0;
}
.admin-dashboard button {
  font-family: Satoshi;
  background-color: #c05c3b;
  color: white;
  border: none;
  padding: 8px 20px;
  font-size: 16px;
  border-radius: 10px;
}
.admin-dashboard .delete {
  background-color: #ff4d4d;
}
.admin-dashboard .edit {
  background-color: #5d2a18;
}
.product-list {
  margin-top: 100px auto;
}
.product-list h2 {
  color: #5d2a18;
  font-size: 34px;
  margin-bottom: 20px;
  text-align: center;
}
.admin-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
}

.admin-card {
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
  padding: 30px;
  max-height: 90vh;
  overflow-y: auto;
  font-family: Satoshi;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.admin-card::-webkit-scrollbar {
  display: none;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* margin-bottom: 25px; */
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  max-width: 90%;
  margin: 0 auto 25px;
}

.admin-header h2 {
  color: #5d2a18;
  font-size: 22px;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.admin-category-header {
  display: flex;
  justify-content: flex-end;
  max-width: 90%;
  margin: 0 auto 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #5d2a18;
  font-size: 14px;
}

input,
select,
textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  outline: none;
}

.image-upload-zone {
  border: 2px dashed #ddd;
  padding: 20px;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-img {
  max-height: 100px;
  margin-top: 10px;
  border-radius: 6px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.divider {
  border: 0;
  border-top: 1px solid #eee;
  margin: 10px 0;
}

/* Options Table Logic */
.options-header {
  display: grid;
  grid-template-columns: 1fr 1fr 40px;
  gap: 10px;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 10px;
}
.option-row-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-row {
  display: grid;
  grid-template-columns: 1fr 1fr 40px;
  gap: 10px;
  margin-bottom: 10px;
}

.out-of-stock {
  margin-left: 5px;
  font-size: 13px;
  color: #ff4d4d;
}

.remove-btn {
  background: #ffeded;
  color: #ff4d4d;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-option-btn {
  background: none;
  border: 1px dashed #c05c3b;
  color: #c05c3b;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.save-btn {
  background: #000;
  color: #fff;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
}

.animate-fade {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  max-width: 90%;
  margin: 0 auto;
  padding-bottom: 50px;
}

.product-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  transition: transform 0.3s ease;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.02);
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(93, 42, 24, 0.1);
}

.img-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 15px;
}

.img-container img {
  width: 100%;
  object-fit: contain; /* Keeps food looking realistic */
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
.category-container {
  margin-top: 50px;
  max-width: 90%;
  margin: 50px auto 0;
  padding-bottom: 50px;
}
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
.category-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.add-category-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
}
.admin-container {
  max-width: 500px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
  font-family: Satoshi;
}

.admin-panel,
.list-panel {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(93, 42, 24, 0.05);
  border: 1px solid #f2ebe4;
}
/* .admin-panel {
  width: 100%;
  margin: auto;
} */

.panel-header h2 {
  color: #5d2a18;
  margin: 0 0 10px;
  font-size: 28px;
  text-align: center;
}

.panel-header p {
  color: #7a4a3a;
  font-size: 14px;
  opacity: 0.7;
  text-align: center;
  margin-bottom: 20px;
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
  color: #5d2a18;
  font-size: 14px;
}

input[type="text"] {
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #ddd;
  outline-color: #c05c3b;
}

.button-group {
  display: flex;
  gap: 10px;
}

.submit-btn {
  flex: 2;
  background: #c05c3b;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-btn {
  flex: 1;
  background: #eee;
  color: #5d2a18;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* List Styling */
.list-panel h3 {
  color: #5d2a18;
  margin-bottom: 20px;
  font-size: 20px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: #fdfaf8;
  border-radius: 12px;
  border: 1px solid #f2ebe4;
}

.cat-name {
  font-weight: 600;
  color: #5d2a18;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  background: white;
  border: 1px solid #eee;
  padding: 5px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.actions button:hover {
  border-color: #c05c3b;
  transform: scale(1.1);
}
</style>
