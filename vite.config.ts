import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    lib: {
      entry: "src/index.ts",
      name: "PDFReader",
      formats: ["es", "cjs"],
      fileName: (format) => `pdfreader.${format}.js`,
    },
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        exports: "named",
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].[format].js",
        chunkFileNames: "[name].[format].js",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "react/jsx-runtime",
        },
      },
      external: (id) => {
        return ["react", "react-dom", "react/jsx-runtime"].some(
          (pkg) => id === pkg || id.startsWith(pkg + "/"),
        );
      },
    },
  },
  plugins: [react()],
});
