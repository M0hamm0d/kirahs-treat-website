import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // This tells Vite that @/ is a shortcut for the src folder
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
