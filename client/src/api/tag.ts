import type { TagT } from "../types";
import { apiFetch } from "./client";

// get tags of a skill
export async function fetchSkillTags(skillId: number): Promise<TagT> {
  const res = await apiFetch(`/skills/${skillId}/tags`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get skill's tags");
  }
  return res.json();
}

// add new tag to skill
export async function addSkillTag(skillId: number, tag: string) {
  const res = await apiFetch(`/skills/${skillId}/tags`, {
    method: "POST",
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
  const res = await apiFetch(`/skills/${skillId}/tags/${tagId}`, {
    method: "DELETE",
  });

  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(text || "Failed to delete skill's tags");
  }
}

// get every tags
export async function fetchAllTags(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";

  const res = await apiFetch(`/skills/tags${qs}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch tags");
  }

  return res.json();
}
