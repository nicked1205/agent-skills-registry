import type { Tag } from "./tag";

// mirrors skillDetailsDto
export type SkillDetails = {
  id: number;
  name: string;
  description: string;
  ownerUsername: string;
  latestVersion: number;
  content: string;
  updatedAt: string;
  isPublic: boolean;
  tags: Tag[];
};
