import { API_URL } from "../config/env";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("El servidor devolvió una respuesta inválida", response.status);
  }
  if (!response.ok || payload?.ok === false) {
    throw new ApiError(payload?.message || "No fue posible completar la solicitud", response.status);
  }
  return payload;
}
