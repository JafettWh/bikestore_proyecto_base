// Configuración central del frontend.
// Todo lo que cambie entre servidores (URL del API, nombre de la app) se lee de
// las variables VITE_* definidas en el archivo .env (ver .env.example).

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
export const APP_NAME = import.meta.env.VITE_APP_NAME || "BikeStore";

// Convierte una ruta de /public (ej. "/assets/logo.png") en una URL que funciona
// desde cualquier carpeta o dominio donde se publique la carpeta dist/.
// Se resuelve contra la URL real de la página, así no depende de la raíz del servidor.
export const asset = (path = "") => {
  if (!path || /^(https?:|data:|blob:)/.test(path)) return path;
  return new URL(path.replace(/^\/+/, ""), document.baseURI).href;
};
