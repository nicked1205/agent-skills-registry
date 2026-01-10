import type { TagT } from "./TagT";

// mirrors skillCardsDto
export type SkillCardT = {
  id: number;
  name: string;
  description: string;
  ownerUsername: string;
  latestVersion: number;
  updatedAt: string;
  tags: TagT[];
  isPublic: boolean;
  isCloned: boolean;
  clonedFromUsername: string | null;
};
