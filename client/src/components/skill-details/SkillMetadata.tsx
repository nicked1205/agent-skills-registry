import type { SkillDetailsT } from "../../types";

interface Props {
  skill: SkillDetailsT;
}

export default function SkillMetadata({ skill }: Props) {
  return (
    <div className="h-full border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-500 flex flex-col gap-4">
      {/* Identity */}
      <div>
        <div className="text-sm text-zinc-100">{skill.name}</div>
        <div className="text-zinc-400">version v{skill.latestVersion}</div>
        <div className="pt-2 text-zinc-400 leading-snug whitespace-pre-wrap">
          {skill.description}
        </div>
      </div>

      {/* Ownership */}
      <div className="space-y-1">
        <div>
          <span className="text-zinc-400">owner:</span> {skill.ownerUsername}
        </div>
        <div>
          <span className="text-zinc-400">origin:</span>{" "}
          {skill.isCloned
            ? `cloned from ${skill.clonedFromUsername}`
            : "original"}
        </div>
      </div>

      {/* Timestamps */}
      <div className="space-y-1">
        <div>
          <span className="text-zinc-400">created:</span>{" "}
          {new Date(skill.createdAt).toLocaleString()}
        </div>
        <div>
          <span className="text-zinc-400">updated:</span>{" "}
          {new Date(skill.updatedAt).toLocaleString()}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-1">
        <div>
          <span className="text-zinc-400">versions:</span> {skill.latestVersion}
        </div>
        <div>
          <span className="text-zinc-400">download count:</span>{" "}
          {skill.downloadCount ?? 0}
        </div>
        <div>
          <span className="text-zinc-400">clone count:</span>{" "}
          {skill.cloneCount ?? 0}
        </div>
      </div>
    </div>
  );
}
