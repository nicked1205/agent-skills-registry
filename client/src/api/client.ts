const API_BASE = import.meta.env.VITE_API_URL as string;

if (!API_BASE) throw new Error("VITE_API_URL is not set");

// shared fetch wrapepr, all api calls except login and register goes through here to check expiration of JWT token, redirect to login if expires
export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  } // add content-type header when body is formdata

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized access");
  }

  return res;
}
