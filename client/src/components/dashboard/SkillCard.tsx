import { useNavigate, useLocation } from "react-router-dom";
import type { SkillCardT } from "../../types";
import { CloneIcon, DownloadIcon } from "../../icons";

interface Props {
  skill: SkillCardT;
  username: string | null;
}

const TAGS_DISPLAYED = 3;

export default function SkillCard({ skill, username }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      onClick={() =>
        navigate(`/skills/${skill.id}`, {
          state: { from: location.search },
        })
      }
      className="flex h-full flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 duration-300 hover:cursor-pointer hover:shadow-md hover:scale-105 hover:dark:brightness-125"
    >
      {/* Skill Card */}
      <h2 className="mb-1 text-sm font-semibold line-clamp-1">{skill.name}</h2>

      <p className="mb-2 text-[11px] text-zinc-500 max-w-[60%] truncate">
        {skill.isCloned // cloned skill, own skill and public skill in order
          ? `Cloned from ${skill.clonedFromUsername}`
          : skill.ownerUsername === username
          ? "Posted by you"
          : `Posted by ${skill.ownerUsername}`}
      </p>

      <p className="mb-3 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 duration-300">
        {skill.description}
      </p>

      <div className="mt-auto flex items-center justify-between text-xs text-zinc-500">
        {/* Metadata */}
        <div className="flex items-center gap-2">
          <span>v{skill.latestVersion}</span>
          <span>•</span>
          <span>{new Date(skill.updatedAt).toLocaleDateString()}</span>
        </div>

        {/* Stats */}
        {!skill.isCloned && (
          <div className="flex items-center gap-3 text-zinc-500">
            <div className="flex items-center gap-1">
              <DownloadIcon className="h-3.5 w-3.5" />
              <span>{skill.downloadCount}</span>
            </div>

            <div className="flex items-center gap-1">
              <CloneIcon className="h-3.5 w-3.5" />
              <span>{skill.cloneCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tags row */}
      {skill.tags.length > 0 && (
        <div className="mt-2 flex items-center text-[11px] text-zinc-500">
          <span className="shrink-0 mr-3">Tags:</span>

          {/* Tags*/}
          <div className="flex-1 flex justify-start">
            <div className="flex items-center gap-2 overflow-hidden">
              {skill.tags.slice(0, TAGS_DISPLAYED).map((tag) => (
                <span
                  key={tag.id}
                  className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 truncate max-w-20 duration-300"
                >
                  {tag.name}
                </span>
              ))}

              {/* Remaining tags */}
              {skill.tags.length > TAGS_DISPLAYED && (
                <span className="text-zinc-400 shrink-0">
                  +{skill.tags.length - TAGS_DISPLAYED}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
