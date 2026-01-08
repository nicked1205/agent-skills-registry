import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSkillById, createSkillVersion } from "../api/skills";

export default function SkillEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [original, setOriginal] = useState("");
  const hasChanges = content !== original;

  useEffect(() => {
    async function load() {
      try {
        const skill = await fetchSkillById(Number(id));
        setContent(skill.content);
        setOriginal(skill.content);
      } catch (err) {
        alert((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    try {
      await createSkillVersion(Number(id), content);
      navigate(`/skills/${id}`);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-zinc-500">Loading…</div>;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-300 dark:border-zinc-700 px-6 py-3 bg-zinc-200 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
        <h1 className="text-sm font-semibold">Edit Skill</h1>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 resize-none p-6 font-mono text-sm outline-none dark:bg-zinc-950 bg-zinc-50 text-orange-500 custom-scrollbar"
      />

      <div className="flex justify-end gap-2 border-t border-zinc-300 dark:border-zinc-700 px-6 py-3 bg-zinc-200 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
        <button
          onClick={() => navigate(-1)}
          className="rounded px-3 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:cursor-pointer duration-300"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="rounded bg-orange-500 px-4 py-1.5 text-sm text-white disabled:opacity-50 hover:bg-orange-600 hover:cursor-pointer duration-300"
        >
          {saving ? "Saving…" : "Save new version"}
        </button>
      </div>
    </div>
  );
}
