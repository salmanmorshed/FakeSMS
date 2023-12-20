import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
    base: "frontend",
    root: "frontend",
    plugins: [react(), viteSingleFile()],
    build: {
        emptyOutDir: false,
        rollupOptions: {
            input: "./frontend/index.html",
            output: { dir: "./build/frontend" },
        },
    },
});
