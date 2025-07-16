import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build output
    target: "es2015",
    minify: "terser",
    cssMinify: true,

    // Enable chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large dependencies
          vendor: ["react", "react-dom", "react-router-dom"],

          // UI library chunk
          ui: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-toast",
            "lucide-react",
          ],

          // Charts and data visualization
          charts: ["recharts"],

          // 3D and complex UI
          three: ["@react-three/fiber", "@react-three/drei", "three"],

          // Utilities
          utils: [
            "clsx",
            "tailwind-merge",
            "class-variance-authority",
            "date-fns",
            "zod",
          ],

          // Payment and external services
          services: [
            "@stripe/stripe-js",
            "@supabase/supabase-js",
            "@tanstack/react-query",
          ],
        },

        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split("/")
                .pop()
                .replace(".tsx", "")
                .replace(".ts", "")
            : "chunk";
          return `js/${facadeModuleId}-[hash].js`;
        },

        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const extType = info[info.length - 1];

          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${extType}`;
          }

          if (/\.(css)$/i.test(assetInfo.name)) {
            return `css/[name]-[hash].${extType}`;
          }

          if (/\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${extType}`;
          }

          return `assets/[name]-[hash].${extType}`;
        },
      },
    },

    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,

    // Enable sourcemaps for production debugging
    sourcemap: process.env.NODE_ENV === "development",
  },

  // Development server optimization
  server: {
    host: true,
    port: 8080,
    open: false,
    hmr: {
      overlay: true,
    },
  },

  // Preview server settings
  preview: {
    port: 8080,
    host: true,
  },

  // Enable CSS code splitting
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: "camelCase",
    },
  },

  // Define environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@stripe/stripe-js",
      "lucide-react",
    ],
    exclude: ["@react-three/fiber", "@react-three/drei", "three"],
  },

  // ESbuild options
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
    legalComments: "none",
  },
});
