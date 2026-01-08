export type Skill = {
  id: number;
  name: string;
  description: string;
  latestVersion: number;
  updatedAt: string;
  isPublic?: boolean; // only there for /mine
  ownerUsername: string;
  content: string;
};
