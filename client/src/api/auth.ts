const API_BASE = import.meta.env.VITE_API_URL as string;

if (!API_BASE) throw new Error("VITE_API_URL is not set");

export async function login(
  username: string,
  password: string
): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to login");
  }

  const data = await res.json();
  return data.token;
}

export async function register(
  username: string,
  password: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to register");
  }
}

export async function fetchMe() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get user info");
  }

  return res.json();
}
