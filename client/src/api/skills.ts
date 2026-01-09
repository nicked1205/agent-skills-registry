import type { SkillCardT } from "../types/skill-card";
import type { SkillDetailsT } from "../types/skill-details";
import type { TagT } from "../types/tag";

const API_BASE = import.meta.env.VITE_API_URL as string;

if (!API_BASE) throw new Error("VITE_API_URL is not set");

// JWT token check for authentication
function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

// get private skills
export async function fetchMySkills(): Promise<SkillCardT[]> {
  const res = await fetch(`${API_BASE}/skills/mine`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get your skills");
  }
  return res.json();
}

// GET public skills
export async function fetchPublicSkills(): Promise<SkillCardT[]> {
  const res = await fetch(`${API_BASE}/skills`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get public skills");
  }
  return res.json();
}

// upload new skill file
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

// get skill details by id
export async function fetchSkillById(id: number): Promise<SkillDetailsT> {
  const res = await fetch(`${API_BASE}/skills/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get skill details");
  }

  return res.json();
}

// update skill's visibility
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
    const text = await res.text();
    throw new Error(text || "Failed to update skill visibility");
  }
}

// delete skill file and all of its history
export async function deleteSkill(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/skills/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to delete skill");
  }
}

// create a new skill version (assists skill edit)
export async function createSkillVersion(
  id: number,
  rawContent: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/skills/${id}/versions`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rawContent }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to save new version");
  }
}

// get all skill versions
export async function fetchSkillVersions(id: number) {
  const res = await fetch(`${API_BASE}/skills/${id}/versions`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get skill versions");
  }

  return res.json() as Promise<{ versionNumber: number; createdAt: string }[]>;
}

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
