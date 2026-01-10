import type { TagT } from "../types";

// mirrors skillDetailsDto
export type SkillDetailsT = {
  id: number;
  name: string;
  description: string;
  ownerUsername: string;
  latestVersion: number;
  content: string;
  updatedAt: string;
  isPublic: boolean;
  tags: TagT[];
  isCloned: boolean;
  clonedFromUsername: string | null;
  cloneCount: number;
  downloadCount: number;
};
