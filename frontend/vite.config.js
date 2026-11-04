import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: "./" genera rutas relativas en dist/, así la carpeta compilada
// funciona en la raíz de un dominio o dentro de una subcarpeta
// (Apache, Nginx, IIS, XAMPP, Netlify, GitHub Pages, etc.) sin cambiar nada.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  server: { host: "0.0.0.0", port: 5173 },
  preview: { host: "0.0.0.0", port: 4173 },
});
