type DiffLineT = {
  type: "add" | "remove" | "context";
  content: string;
  oldLineNumber?: number | null;
  newLineNumber?: number | null;
};

export type VersionsDiffT = {
  fromVersion: number;
  toVersion: number;
  lines: DiffLineT[];
};
