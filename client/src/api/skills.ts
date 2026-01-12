import type { SkillCardT } from "../types";
import type { SkillDetailsT } from "../types";
import type { SkillVersionT } from "../types";
import { apiFetch } from "./client";

// get private skills
export async function fetchMySkills(): Promise<SkillCardT[]> {
  const res = await apiFetch("skills/mine");

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get your skills");
  }
  return res.json();
}

// GET public skills
export async function fetchPublicSkills(): Promise<SkillCardT[]> {
  const res = await apiFetch("/skills");

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get public skills");
  }
  return res.json();
}

export async function fetchSkills(
  view: "private" | "public",
  search: string,
  tags: string[]
) {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (tags.length > 0) {
    params.set("tags", tags.join(","));
  }

  const base = view === "private" ? "/skills/mine" : "/skills";
  const url = params.toString() ? `${base}?${params}` : base;

  const res = await apiFetch(`${url}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch skills");
  }

  return res.json();
}

// upload new skill file
export async function uploadSkill(file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch(`/skills`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to upload skill");
  }
}

// get skill details by id
export async function fetchSkillById(id: number): Promise<SkillDetailsT> {
  const res = await apiFetch(`/skills/${id}`);

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
  const res = await apiFetch(`/skills/${id}/visibility`, {
    method: "PATCH",
    body: JSON.stringify({ isPublic }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update skill visibility");
  }
}

// delete skill file and all of its history
export async function deleteSkill(id: number): Promise<void> {
  const res = await apiFetch(`/skills/${id}`, {
    method: "DELETE",
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
  const res = await apiFetch(`/skills/${id}/versions`, {
    method: "POST",
    body: JSON.stringify({ rawContent }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to save new version");
  }
}

// get all skill versions
export async function fetchSkillVersions(id: number) {
  const res = await apiFetch(`/skills/${id}/versions`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get skill versions");
  }

  return res.json() as Promise<SkillVersionT[]>;
}

// clone a public skill to private library
export async function cloneSkill(id: number): Promise<void> {
  const res = await apiFetch(`/skills/${id}/clone`, {
    method: "POST",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to clone skill");
  }
}

export async function downloadSkill(id: number) {
  const res = await apiFetch(`/skills/${id}/download`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to download skill");
  }

  return res.blob();
}

// get diffs between 2 skill versions
export async function fetchSkillDiff(
  skillId: number,
  from: number,
  to: number
) {
  const res = await apiFetch(`/skills/${skillId}/diff?from=${from}&to=${to}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get diffs");
  }

  return res.json();
}

export async function rollbackSkill(skillId: number, toVersionNumber: number) {
  const res = await apiFetch(
    `/skills/${skillId}/rollback?to=${toVersionNumber}`,
    {
      method: "POST",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to rollback skill");
  }

  return res.json();
}
