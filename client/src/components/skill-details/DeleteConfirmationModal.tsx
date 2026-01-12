import { useNavigate } from "react-router-dom";
import { deleteSkill } from "../../api/skills";
import type { ErrorT, SkillDetailsT } from "../../types";

interface Props {
  skill: SkillDetailsT;
  deleting: boolean;
  setDeleting: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  fromDashboardState: string;
  onError: (err: ErrorT) => void;
}

export default function DeleteConfirmationModal({
  skill,
  deleting,
  setDeleting,
  setShowDeleteConfirm,
  fromDashboardState,
  onError,
}: Props) {
  const navigate = useNavigate();

  async function handleDeleteSkill() {
    if (!skill) return;

    setDeleting(true);

    try {
      await deleteSkill(skill.id);
      navigate(`/dashboard${fromDashboardState}`);
    } catch (err) {
      onError({
        title: "failed to delete skill",
        message: (err as Error).message,
        fatal: false,
      });
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={() => setShowDeleteConfirm(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
          <span className="text-red-400">⚠ system warning</span>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="btn-red-tool"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-2 leading-relaxed">
          <p>You are about to permanently delete:</p>

          <p className="text-red-400">
            {">"} <span className="text-zinc-100 break-all">{skill.name}</span>
          </p>

          <p className="text-zinc-500">
            All versions will be removed.
            <br />
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-4 py-2 border-t border-zinc-800">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            disabled={deleting}
            className="btn-neutral disabled:opacity-50"
          >
            cancel
          </button>

          <button
            onClick={handleDeleteSkill}
            disabled={deleting}
            className="btn-destructive-action-confirm disabled:opacity-50"
          >
            {deleting ? "deleting…" : "confirm delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
