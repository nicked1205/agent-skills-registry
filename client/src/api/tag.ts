import type { TagT } from "../types/tag";
import { authHeaders } from "./auth";

const API_BASE = import.meta.env.VITE_API_URL as string;

if (!API_BASE) throw new Error("VITE_API_URL is not set");

// get tags of a skill
export async function fetchSkillTags(skillId: number): Promise<TagT> {
  const res = await fetch(`${API_BASE}/skills/${skillId}/tags`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get skill's tags");
  }
  return res.json();
}

// add new tag to skill
export async function addSkillTag(skillId: number, tag: string) {
  const res = await fetch(`${API_BASE}/skills/${skillId}/tags`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tag }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to add tag");
  }

  return res.json();
}

// delete tag of a skill
export async function deleteSkillTag(skillId: number, tagId: number) {
  const res = await fetch(`${API_BASE}/skills/${skillId}/tags/${tagId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(text || "Failed to delete skill's tags");
  }
}

// get every tags
export async function fetchAllTags(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";

  const res = await fetch(`${API_BASE}/skills/tags${qs}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch tags");
  }

  return res.json();
}
