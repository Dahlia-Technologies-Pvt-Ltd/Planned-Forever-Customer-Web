import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/plannedforever-customer/",
  plugins: [react()],
  server: {
    port: 5001,
    host: true,
  },

  resolve: {
    alias: {
      "@api": "/src/api/services",
      "@components": "/src/components",
      "@context": "/src/context/GlobalContext",
      "@sorting": "/src/hooks/useSortableData",
      "@utilities": "/src/utilities",
    },
  },
});
