import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/backend-api": {
        target:
          "https://seinservices-api-ffhxg3a7h4gshpet.koreacentral-01.azurewebsites.net",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/backend-api/, "/api"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
