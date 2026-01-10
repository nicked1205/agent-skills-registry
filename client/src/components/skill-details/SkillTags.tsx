import { useState } from "react";
import { addSkillTag, deleteSkillTag } from "../../api/tag";
import type { SkillDetailsT } from "../../types";
import type { TagT } from "../../types";

export interface Props {
  isOwner: boolean;
  skill: SkillDetailsT;
  tags: TagT[];
  setTags: React.Dispatch<React.SetStateAction<TagT[]>>;
}

export default function SkillTags({ isOwner, skill, tags, setTags }: Props) {
  const [newTag, setNewTag] = useState("");

  async function handleAddTag() {
    const raw = newTag.trim();
    if (!raw || !skill) return;

    if (!(raw.length <= 20 && /^[a-zA-Z0-9._-]+$/.test(raw))) {
      alert(
        "Tag must be 20 characters or fewer and only contain letters, numbers, '.', '-', or '_'"
      );
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
      alert((err as Error).message);
    }
  }

  async function handleDeleteTag(tagId: number) {
    if (!skill) return;

    try {
      await deleteSkillTag(skill.id, tagId);

      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <div className="mt-3">
      {/* Tags header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Tags
        </h2>

        {isOwner && (
          <div className="flex items-center gap-2">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTag();
              }}
              placeholder="Add tag"
              className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent focus:outline-none placeholder:text-zinc-500 caret-zinc-500 text-zinc-500"
            />

            <button
              onClick={handleAddTag}
              className="text-xs text-orange-500 hover:underline hover:cursor-pointer"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Tags container */}
      <div className="flex gap-2 h-8 overflow-x-auto overflow-y-hidden pr-1 custom-scrollbar">
        {tags.length === 0 && (
          <span className="text-xs text-zinc-500">No tags</span>
        )}

        {tags.map((tag) => (
          <span
            key={tag.id}
            className="flex h-6 items-center gap-1 px-2 py-0.5 rounded-sm text-xs bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 whitespace-nowrap"
          >
            {tag.name}

            {isOwner && (
              <div
                onClick={() => handleDeleteTag(tag.id)}
                className="text-zinc-500 hover:text-red-500 hover:cursor-pointer transition"
                title="Remove tag"
              >
                ×
              </div>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
