import { useNavigate, useLocation } from "react-router-dom";
import type { SkillCardT } from "../../types";
import { CloneIcon, DownloadIcon, VisibilityIcon } from "../../icons";
import HudCorners from "../ui/HudCorners";
import FadeHoriScroll from "../ui/FadeHoriScroll";
import { formatStat } from "../../utils/format";

interface Props {
  skill: SkillCardT;
  username: string | null;
  view: "private" | "public";
}

export default function SkillCard({ skill, username, view }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      onClick={() =>
        navigate(`/skills/${skill.id}`, { state: { from: location.search } })
      }
      className="relative group border border-zinc-800 bg-zinc-950 p-3 hover:cursor-pointer flex flex-col h-full"
    >
      <HudCorners
        className="text-(--glitch-green) opacity-0 group-hover:opacity-60 pointer-events-none"
        offset={0.5}
        length={12}
        strokeWidth={3}
      />

      {/* Name */}
      <div className="flex flex-col min-w-0 gap-0.5">
        <span className="text-sm sm:text-md text-zinc-100 font-medium truncate">
          {skill.name}
        </span>
        <span className="text-xs sm:text-sm text-zinc-500 truncate">
          {skill.isCloned
            ? `cloned from ${skill.clonedFromUsername}`
            : skill.ownerUsername === username
            ? "posted by you"
            : `posted by ${skill.ownerUsername}`}
        </span>
      </div>

      {/* Description */}
      <div className="flex flex-col mt-2 flex-1">
        {skill.description && (
          <p className="text-xs sm:text-sm text-zinc-400 line-clamp-3 leading-relaxed wrap-anywhere">
            {skill.description}
          </p>
        )}
      </div>

      {/* Tags */}
      {skill.tags && skill.tags.length > 0 && (
        <div className="relative">
          <FadeHoriScroll className="flex gap-1">
            {skill.tags.map((tag) => (
              <span
                key={tag.id}
                className="shrink-0 border border-zinc-800 px-1.5 py-0.5 text-xs sm:text-sm text-zinc-500 max-w-30 sm:max-w-35 truncate"
                title={tag.name}
              >
                {tag.name}
              </span>
            ))}
          </FadeHoriScroll>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-500 mt-auto pt-2">
        <div className="flex items-center gap-3">
          <span>v{skill.latestVersion}</span>
          <span>{new Date(skill.updatedAt).toLocaleDateString()}</span>
          {view === "private" && (
            <VisibilityIcon
              isPublic={skill.isPublic}
              className="h-3.5 w-3.5 text-zinc-500 shrink-0"
            />
          )}
        </div>

        {!skill.isCloned && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 w-[calc(14px+4ch)]">
              <DownloadIcon className="h-3.5 w-3.5" />
              {formatStat(skill.downloadCount)}
            </span>
            <span className="flex items-center gap-1 w-[calc(14px+4ch)]">
              <CloneIcon className="h-3.5 w-3.5" />
              {formatStat(skill.cloneCount)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
