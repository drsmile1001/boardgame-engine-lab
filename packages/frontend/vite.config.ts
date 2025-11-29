import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [tailwindcss(), solid()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      // "/ws": {
      //   target: "ws://localhost:3000",
      //   //rewriteWsOrigin: true,
      //   ws: true,
      // },
    },
  },
});
