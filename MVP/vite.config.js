import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { splitVendorChunkPlugin } from "vite";
import compression from "vite-plugin-compression";

// Get directory path using import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom plugin to set JSX MIME types
const jsxMimeTypePlugin = () => ({
  name: "jsx-mime-type-plugin",
  configureServer(server) {
    return () => {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.endsWith(".jsx")) {
          res.setHeader("Content-Type", "text/jsx; charset=utf-8");
        }
        next();
      });
    };
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    compression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 10240, // Only compress files > 10kb
    }),
    jsxMimeTypePlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  server: {
    historyApiFallback: true,
  },
  preview: {
    port: 4173,
    historyApiFallback: true,
  },
  build: {
    // Generate sourcemaps for production build
    sourcemap: false,
    // Minify output
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Chunk optimization
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor";
            }
          }
        },
      },
    },
    // Reduce chunk size for faster loading
    chunkSizeWarningLimit: 1000,
  },
  // Performance optimizations
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});
