import { useState } from "react";
import { addSkillTag, deleteSkillTag } from "../../api/tag";
import type { ErrorT, SkillDetailsT } from "../../types";
import type { TagT } from "../../types";

export interface Props {
  isOwner: boolean;
  skill: SkillDetailsT;
  tags: TagT[];
  setTags: React.Dispatch<React.SetStateAction<TagT[]>>;
  onError: (err: ErrorT) => void;
}

const MAX_TAGS = 5;

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
      !(raw.length >= 1 && raw.length <= 16 && /^[a-zA-Z0-9._-]+$/.test(raw))
    ) {
      onError({
        title: "failed to add tag",
        message:
          "Tag must be 1-16 characters long and can only contain letters, numbers, dots, underscores, and hyphens",
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
    <div className="flex items-center gap-2 text-xs text-zinc-400">
      <span className="text-zinc-500">tags:</span>

      <div className="flex flex-wrap gap-x-3 gap-y-1 max-h-20 overflow-hidden">
        {tags.length === 0 && <span className="text-zinc-600">none</span>}

        {tags.map((tag) => (
          <span key={tag.id} className="flex items-center gap-1">
            <span>{tag.name}</span>
            {isOwner && (
              <button
                onClick={() => handleDeleteTag(tag.id)}
                className="btn-red-tool text-xs"
                title="remove tag"
              >
                ×
              </button>
            )}
          </span>
        ))}

        {isOwner && canAddMore && (
          <div className="flex gap-2">
            <span className="text-zinc-600">add</span>
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTag();
              }}
              className="w-24 bg-transparent border-b border-zinc-700 focus:border-(--glitch-green-bg) focus:outline-none text-zinc-200 placeholder:text-zinc-700 caret-(--glitch-green)"
            />
            <span className="text-zinc-600 select-none">enter↵</span>
          </div>
        )}

        {isOwner && !canAddMore && (
          <span className="text-zinc-600 select-none">max {MAX_TAGS}</span>
        )}
      </div>
    </div>
  );
}
