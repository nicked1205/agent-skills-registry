import type { Skill } from "../types/skill";

const API_BASE = import.meta.env.VITE_API_URL as string;

if (!API_BASE) throw new Error("VITE_API_URL is not set");

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchMySkills() {
  const res = await fetch(`${API_BASE}/skills/mine`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to load your skills");
  return res.json();
}

export async function fetchPublicSkills() {
  const res = await fetch(`${API_BASE}/skills`);

  if (!res.ok) throw new Error("Failed to load public skills");
  return res.json();
}

export async function uploadSkill(file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/skills`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to upload skill");
  }
}

export async function fetchSkillById(id: number): Promise<Skill> {
  const res = await fetch(`${API_BASE}/skills/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch skill");
  }

  return res.json();
}

export async function updateSkillVisibility(
  id: number,
  isPublic: boolean
): Promise<void> {
  const res = await fetch(`${API_BASE}/skills/${id}/visibility`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isPublic }),
  });

  if (!res.ok) {
    throw new Error("Failed to update visibility");
  }
}

export async function deleteSkill(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/skills/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete skill");
  }
}
