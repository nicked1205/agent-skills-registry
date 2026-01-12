type DiffLineT = {
  type: "add" | "remove" | "same" | "modify";
  content: string;
  oldLineNumber?: number | null;
  newLineNumber?: number | null;
  words: DiffWordT[];
};

type DiffWordT = {
  type: "add" | "remove" | "same";
  content: string;
};

export type VersionsDiffT = {
  fromVersion: number;
  toVersion: number;
  lines: DiffLineT[];
};
