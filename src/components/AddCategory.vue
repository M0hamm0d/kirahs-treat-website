<!-- <template>
  <div class="admin-panel" v-animate-on-scroll="'fade-up'">
    <div class="panel-header">
      <div>
        <h2>Add New Category</h2>
        <p>Create a new group for your treats</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="category-form">
      <div class="form-group">
        <label>Category Name</label>
        <input
          v-model="categoryName"
          type="text"
          placeholder="e.g. Gourmet Donuts"
          required
        />
      </div>
      <button type="submit" class="submit-btn" :disabled="isLoading">
        {{ isLoading ? "Creating..." : "Add Category" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

const categoryName = ref("");
const handleSubmit = async () => {
  isLoading.value = true;
  // Simulate API call
  setTimeout(() => {
    console.log("Category Added:", {
      name: categoryName.value,
      status: status.value,
    });
    isLoading.value = false;
    alert("Category created successfully!");
  }, 1000);
};
</script>

<style scoped>
.admin-panel {
  width: 100%;
  max-width: 450px;
  border-radius: 24px;
  padding: 32px;
  margin: 0 auto;
  /* box-shadow: 0 10px 40px rgba(93, 42, 24, 0.08); */
  /* border: 1px solid #f2ebe4; */
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 28px;
}

.header-icon {
  background: #fdf2ee;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
}

.panel-header h2 {
  color: #5d2a18;
  margin: 10px 0;
  font-size: 34px;
  text-align: center;
}
.panel-header p {
  color: #7a4a3a;
  margin: 0;
  font-size: 16px;
  opacity: 0.7;
  text-align: center;
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

input[type="text"] {
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #ddd;
  background: #fdfdfd;
  outline-color: #c05c3b;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #5d2a18;
}

.submit-btn {
  margin-top: 10px;
  background: #c05c3b;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s,
    background 0.2s;
}

.submit-btn:hover {
  background: #5d2a18;
}
.submit-btn:active {
  transform: scale(0.98);
}
</style> -->
<script setup>
const categories = ref([
  { id: 1, name: "Cakes" },
  { id: 2, name: "Donuts" },
  { id: 3, name: "Small Chops" },
]);

// Methods
const handleSubmit = async () => {};
</script>
<template>
  <div class="admin-container" @click.stop>
    <p>{{ categoryName }}</p>
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
            v-model="categoryName"
            type="text"
            placeholder="e.g. Gourmet Donuts"
            required
          />
        </div>

        <div class="button-group">
          <button type="submit" class="submit-btn" :disabled="isLoading">
            {{
              isLoading
                ? "Processing..."
                : isEditing
                  ? "Update Category"
                  : "Add Category"
            }}
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

    <!-- <div class="list-panel" v-animate-on-scroll="'fade-up'">
      <h3>Existing Categories</h3>
      <div v-if="categories.length === 0" class="empty-list">
        No categories found.
      </div>
      <div v-else class="category-list">
        <div v-for="cat in categories" :key="cat.id" class="category-item">
          <span class="cat-name">{{ cat.name }}</span>
          <div class="actions">
            <button class="edit-icon" @click="startEdit(cat)" title="Edit">
              ✏️
            </button>
            <button
              class="delete-icon"
              @click="deleteCategory(cat.id)"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<style scoped>
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
