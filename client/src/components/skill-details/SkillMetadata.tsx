import type { SkillDetailsT } from "../../types";

interface Props {
  skill: SkillDetailsT;
}

export default function SkillMetadata({ skill }: Props) {
  return (
    <div className="h-full bg-zinc-950 p-3 text-xs sm:text-sm text-zinc-500 flex flex-col gap-3">
      {/* Identity */}
      <div className="min-w-0">
        <div className="text-sm md:text-md text-zinc-100 wrap-anywhere line-clamp-1 md:line-clamp-none">
          {skill.name}
        </div>
        <div className="text-zinc-400">version v{skill.latestVersion}</div>
        <div className="pt-2 text-zinc-300 leading-snug whitespace-pre-wrap text-xs sm:text-sm md:text-md wrap-anywhere line-clamp-3 md:line-clamp-none">
          {skill.description}
        </div>
      </div>

      {/* Ownership */}
      <div className="space-y-1 min-w-0">
        <div className="flex gap-1 min-w-0">
          <span className="text-zinc-400 shrink-0">owner:</span>
          <span className="min-w-0 wrap-anywhere line-clamp-2 md:line-clamp-none">
            {skill.ownerUsername}
          </span>
        </div>

        <div className="flex gap-1 min-w-0">
          <span className="text-zinc-400 shrink-0">origin:</span>
          <span className="min-w-0 wrap-anywhere line-clamp-2 md:line-clamp-none">
            {skill.isCloned
              ? `cloned from ${skill.clonedFromUsername}`
              : "original"}
          </span>
        </div>
      </div>

      {/* Timestamp and visibility */}
      <div className="space-y-1 min-w-0">
        <div>
          <span className="text-zinc-400">visibility:</span>{" "}
          {skill.isPublic ? "public" : "private"}
        </div>
        <div>
          <span className="text-zinc-400">modified:</span>{" "}
          {new Date(skill.updatedAt).toLocaleString()}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-1 min-w-0">
        <div>
          <span className="text-zinc-400">versions:</span> {skill.latestVersion}
        </div>
        {!skill.isCloned && (
          <>
            <div>
              <span className="text-zinc-400">download count:</span>{" "}
              {skill.downloadCount ?? 0}
            </div>
            <div>
              <span className="text-zinc-400">clone count:</span>{" "}
              {skill.cloneCount ?? 0}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
