import { useState } from "react";
import { addSkillTag, deleteSkillTag } from "../../api/tag";
import type { ErrorT, SkillDetailsT } from "../../types";
import type { TagT } from "../../types";
import FadeHoriScroll from "../ui/FadeHoriScroll";

export interface Props {
  isOwner: boolean;
  skill: SkillDetailsT;
  tags: TagT[];
  setTags: React.Dispatch<React.SetStateAction<TagT[]>>;
  onError: (err: ErrorT) => void;
}

const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;

export default function SkillTags({
  isOwner,
  skill,
  tags,
  setTags,
  onError,
}: Props) {
  const [newTag, setNewTag] = useState("");

  const canAddMore = tags.length < MAX_TAGS;

  async function handleAddTag() {
    const raw = newTag.trim();
    if (!raw || !skill) return;

    if (!canAddMore) {
      onError({
        title: "failed to add tag",
        message: `Maximum of ${MAX_TAGS} tags reached`,
        fatal: false,
      });
      return;
    }

    if (
      !(
        raw.length >= 1 &&
        raw.length <= MAX_TAG_LENGTH &&
        /^[a-zA-Z0-9._-]+$/.test(raw)
      )
    ) {
      onError({
        title: "failed to add tag",
        message: `Tag must be 1-${MAX_TAG_LENGTH} characters long and can only contain letters, numbers, dots, underscores, and hyphens. Current length: ${raw.length}/${MAX_TAG_LENGTH}`,
        fatal: false,
      });
      return;
    }

    try {
      const res = await addSkillTag(skill.id, raw);

      if (res) {
        setTags((prev) =>
          prev.some((t) => t.id === res.id) ? prev : [...prev, res]
        );
      }

      setNewTag("");
    } catch (err) {
      onError({
        title: "failed to add tag",
        message: (err as Error).message,
        fatal: false,
      });
    }
  }

  async function handleDeleteTag(tagId: number) {
    if (!skill) return;

    try {
      await deleteSkillTag(skill.id, tagId);

      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch (err) {
      onError({
        title: "failed to delete tag",
        message: (err as Error).message,
        fatal: false,
      });
    }
  }

  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
      <span className="text-zinc-500 shrink-0">tags:</span>

      <div className="flex-1 min-w-0 pr-2 sm:pr-4">
        <FadeHoriScroll className="flex items-center gap-2">
          {tags.length === 0 && (
            <span className="text-zinc-600 shrink-0">none</span>
          )}

          {tags.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1 shrink-0 border border-zinc-800 px-1.5 py-0.5 text-xs sm:text-sm text-zinc-500"
            >
              <span
                className="whitespace-nowrap truncate max-w-30 sm:max-w-35"
                title={tag.name}
              >
                {tag.name}
              </span>

              {isOwner && (
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  className="btn-red-tool text-xs sm:text-sm shrink-0"
                  title="remove tag"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </FadeHoriScroll>
      </div>
      {isOwner && canAddMore && (
        <div className="flex items-center gap-2 shrink-0">
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTag();
            }}
            className="w-16 sm:w-26 md:w-35 bg-transparent border-b border-zinc-700 focus:border-(--glitch-green-bg) focus:outline-none text-zinc-200 placeholder:text-zinc-700 caret-(--glitch-green)"
          />
          <span className="text-zinc-600 select-none">enter↵</span>
        </div>
      )}

      {isOwner && !canAddMore && (
        <span className="text-zinc-600 select-none shrink-0">
          max {MAX_TAGS}
        </span>
      )}
    </div>
  );
}
