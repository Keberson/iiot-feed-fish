import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "#assets": path.resolve(__dirname, "./src/assets"),
            "#core": path.resolve(__dirname, "./src/core"),
            "#common": path.resolve(__dirname, "./src/common"),
            "#routes": path.resolve(__dirname, "./src/routes"),
            "#types": path.resolve(__dirname, "./src/types"),
            "#services": path.resolve(__dirname, "./src/services"),
            "#store": path.resolve(__dirname, "./src/store"),
        },
    },
});
