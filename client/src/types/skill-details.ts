import type { TagT } from "./tag";

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
};
