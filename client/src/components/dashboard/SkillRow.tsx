import { useNavigate, useLocation } from "react-router-dom";
import type { SkillCardT } from "../../types";
import { CloneIcon, DownloadIcon, VisibilityIcon } from "../../icons";
import HudCorners from "../ui/HudCorners";
import FadeHoriScroll from "../ui/FadeHoriScroll";

interface Props {
  skill: SkillCardT;
  username: string | null;
  view: "private" | "public";
}

export default function SkillRowCard({ skill, username, view }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  // for showing only some tags in the row
  // const MAX_VISIBLE_TAGS = 2;

  // const visibleTags = skill.tags.slice(0, MAX_VISIBLE_TAGS);
  // const hiddenCount = skill.tags.length - visibleTags.length;

  return (
    <div
      onClick={() =>
        navigate(`/skills/${skill.id}`, { state: { from: location.search } })
      }
      className="relative group cursor-pointer border border-zinc-900 bg-zinc-950 px-4 py-2 flex items-center text-xs hover:bg-(--glitch-green-container-bg) gap-[3%] min-w-0"
    >
      <HudCorners
        className="text-(--glitch-green) opacity-0 group-hover:opacity-60"
        offset={1}
        length={8}
        strokeWidth={2}
      />

      {/* Name */}
      <div className="w-[25%] text-zinc-100 truncate">{skill.name}</div>

      {/* Visibility*/}
      {view === "private" && (
        <VisibilityIcon
          isPublic={skill.isPublic}
          className="h-3.5 w-3.5 text-zinc-500 shrink-0"
        />
      )}

      {/* Owner */}
      <div className="w-[15%] flex items-center gap-1 text-zinc-400 min-w-0">
        <span className="truncate">
          {skill.isCloned
            ? skill.clonedFromUsername
            : skill.ownerUsername === username
            ? "you"
            : skill.ownerUsername}
        </span>

        {skill.isCloned && (
          <CloneIcon className="h-3 w-3 shrink-0 text-zinc-500" />
        )}
      </div>

      {/* Updated and version */}
      {/* w-17ch makes the tag space not wiggle due to different amount of digits version */}
      <div className="w-[17ch] text-zinc-500 whitespace-nowrap">
        v{skill.latestVersion}
        {" • "}
        {new Date(skill.updatedAt).toLocaleDateString()}
      </div>

      {/* Tags */}
      <div className="hidden md:block relative flex-1 min-w-0">
        <FadeHoriScroll className="flex gap-1 pr-2">
          {skill.tags.map((tag) => (
            <span
              key={tag.id}
              className="shrink-0 px-1.5 py-0.5 border border-zinc-800 text-[10px] text-zinc-400 whitespace-nowrap"
              title={tag.name}
            >
              {tag.name}
            </span>
          ))}
        </FadeHoriScroll>
      </div>

      {/* Stats */}
      <div className="ml-auto flex items-center gap-4 text-zinc-400">
        <span className="flex items-center gap-1">
          <DownloadIcon className="h-3.5 w-3.5" /> {skill.downloadCount}
        </span>
        <span className="flex items-center gap-1">
          <CloneIcon className="h-3.5 w-3.5" /> {skill.cloneCount}
        </span>
      </div>
    </div>
  );
}
