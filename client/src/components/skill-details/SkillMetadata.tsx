import type { SkillDetailsT } from "../../types";

interface Props {
  skill: SkillDetailsT;
}

export default function SkillMetadata({ skill }: Props) {
  return (
    <div className="h-full border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-500 flex flex-col gap-3">
      {/* Identity */}
      <div className="min-w-0">
        <div className="text-sm text-zinc-100 break-all">{skill.name}</div>
        <div className="text-zinc-400">version v{skill.latestVersion}</div>
        <div className="pt-2 text-zinc-400 leading-snug whitespace-pre-wrap text-xs sm:text-sm break-all line-clamp-5">
          {skill.description}
        </div>
      </div>

      {/* Ownership */}
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-zinc-400 shrink-0">owner:</span>
          <span className="min-w-0 truncate">{skill.ownerUsername}</span>
        </div>

        <div className="flex items-center gap-1 min-w-0">
          <span className="text-zinc-400 shrink-0">origin:</span>
          <span className="min-w-0 truncate">
            {skill.isCloned
              ? `cloned from ${skill.clonedFromUsername}`
              : "original"}
          </span>
        </div>
      </div>

      {/* Timestamps */}
      <div className="space-y-1 min-w-0">
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
      <div className="space-y-1 min-w-0">
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
