import { useNavigate, useLocation } from "react-router-dom";
import type { SkillCardT } from "../../types";
import { CloneIcon, DownloadIcon } from "../../icons";
import HudCorners from "../ui/HudCorners";

interface Props {
  skill: SkillCardT;
  username: string | null;
}

export default function SkillCard({ skill, username }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      onClick={() =>
        navigate(`/skills/${skill.id}`, { state: { from: location.search } })
      }
      className="relative group border border-zinc-900 bg-zinc-950 rounded-sm p-3 hover:cursor-pointer flex flex-col h-full"
    >
      <HudCorners
        className="text-(--glitch-green) opacity-0 group-hover:opacity-60 pointer-events-none"
        offset={0.5}
        length={12}
        strokeWidth={3}
      />

      {/* Name */}
      <div className="flex flex-col min-w-0 gap-0.5">
        <span className="text-sm text-zinc-100 font-medium truncate">
          {skill.name}
        </span>
        <span className="text-[11px] text-zinc-500 truncate">
          {skill.isCloned
            ? `cloned from ${skill.clonedFromUsername}`
            : skill.ownerUsername === username
            ? "posted by you"
            : `posted by ${skill.ownerUsername}`}
        </span>
      </div>

      {/* Description and Tags */}
      <div className="flex flex-col gap-2 mt-2 flex-1">
        {skill.description && (
          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
            {skill.description}
          </p>
        )}

        {skill.tags && skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {skill.tags.map((tag) => (
              <span
                key={tag.id}
                className="border border-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-auto pt-2">
        <div className="flex items-center gap-3">
          <span>v{skill.latestVersion}</span>
          <span>{new Date(skill.updatedAt).toLocaleDateString()}</span>
        </div>

        {!skill.isCloned && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <DownloadIcon className="h-3.5 w-3.5" />
              {skill.downloadCount}
            </span>
            <span className="flex items-center gap-1">
              <CloneIcon className="h-3.5 w-3.5" />
              {skill.cloneCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
