import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import { resolve } from "path";

export default defineConfig({
  server: {
    port: 5175,
  },
  plugins: [
    react(),
    cssInjectedByJsPlugin({
      styleId: "nostr-comments-styles",
      topExecutionPriority: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "NostrComments",
      formats: ["es", "cjs", "umd"],
      fileName: (format) => {
        if (format === "es") return "nostr-comments.js";
        if (format === "cjs") return "nostr-comments.cjs";
        return "nostr-comments.umd.js";
      },
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "style.css";
          return assetInfo.name || "assets/[name].[hash][extname]";
        },
      },
    },
    cssCodeSplit: false,
  },
});
