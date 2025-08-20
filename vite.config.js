import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // base: "/terminal-cv/", // GH Pages alt dizinde yayınlayacaksan aç
});
