import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSkillById, createSkillVersion } from "../api/skills";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import ErrorModal from "../components/ui/ErrorModal";
import type { ErrorT } from "../types";

export default function SkillEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [systemError, setSystemError] = useState<ErrorT | null>(null);

  const hasChanges = content !== original;

  // fetch skill content on mount
  useEffect(() => {
    if (!id) return;

    async function loadSkill() {
      setLoading(true);
      try {
        const skill = await fetchSkillById(Number(id));
        setContent(skill.content);
        setOriginal(skill.content);
      } catch (err) {
        setSystemError({
          title: "failed to load skill",
          message: (err as Error).message,
          fatal: true,
        });
      } finally {
        setLoading(false);
      }
    }

    loadSkill();
  }, [id]);

  async function handleSave() {
    if (!hasChanges || saving) return;

    setSaving(true);
    try {
      await createSkillVersion(Number(id), content);
      navigate(`/skills/${id}`);
    } catch (err) {
      setSystemError({
        title: "failed to save new version",
        message: (err as Error).message,
        fatal: false,
      });
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingOverlay />;
  }

  if (systemError?.fatal) {
    return (
      <ErrorModal
        error={systemError}
        onExit={() => navigate(`/skills/${id}`)}
        onClose={() => setSystemError(null)}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-zinc-950 font-mono text-xs text-zinc-300">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-zinc-800">
        <div className="flex items-center gap-3 text-zinc-400">
          <span>editing skill</span>
        </div>

        <div className="text-zinc-500">
          {hasChanges ? (
            <span className="text-yellow-400">modified</span>
          ) : (
            <span>no changes</span>
          )}
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        spellCheck={false}
        className="flex-1 resize-none p-4 bg-zinc-950 text-zinc-200 outline-none caret-(--glitch-green) custom-scrollbar"
      />

      {/* Footer */}
      <div className="h-12 flex items-center justify-end gap-4 px-4 border-t border-zinc-800">
        <button onClick={() => navigate(-1)} className="btn-neutral">
          exit
        </button>

        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`
            ${
              hasChanges
                ? "btn-edit-action-confirm"
                : "text-zinc-600 hover:cursor-default"
            }
            disabled:opacity-50
          `}
        >
          {saving ? "committing…" : "commit new version"}
        </button>
      </div>

      {/* Error modal */}
      {systemError && !systemError.fatal && (
        <ErrorModal
          error={systemError}
          onClose={() => setSystemError(null)}
          onExit={() => navigate(`/skills/${id}`)}
        />
      )}
    </div>
  );
}
