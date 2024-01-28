import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { mediapipe } from "vite-plugin-mediapipe";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mediapipe()],
  assetsInclude: ["@mediapipe*"],
  server: {
    hmr: false,
  },
});
