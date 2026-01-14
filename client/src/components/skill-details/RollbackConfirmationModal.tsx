import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ErrorT } from "../../types";
import { rollbackSkill } from "../../api/skills";

interface Props {
  skillId: number;
  fromVersion: number;
  toVersion: number;
  setShowRollbackConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  onError: (err: ErrorT) => void;
  onSuccess: () => void;
}

export default function RollbackConfirmationModal({
  skillId,
  fromVersion,
  toVersion,
  setShowRollbackConfirm,
  onError,
  onSuccess,
}: Props) {
  const navigate = useNavigate();
  const [rollingBack, setRollingBack] = useState(false);

  async function handleRollback() {
    setRollingBack(true);

    try {
      await rollbackSkill(skillId, toVersion);
      onSuccess();
      navigate(`/skills/${skillId}`);
    } catch (err) {
      onError({
        title: "failed to rollback skill",
        message: (err as Error).message,
        fatal: false,
      });
      setRollingBack(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={() => setShowRollbackConfirm(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md border border-zinc-800 bg-zinc-950 text-sm text-zinc-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
          <span className="text-amber-400">⚠ rollback confirmation</span>
          <button
            onClick={() => setShowRollbackConfirm(false)}
            className="text-zinc-500 hover:text-amber-400 hover:cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-2 leading-relaxed">
          <p>You are about to rollback this skill.</p>

          <p className="text-amber-400">
            {">"} restore version{" "}
            <span className="text-zinc-100">v{toVersion}</span>
          </p>

          <p className="text-zinc-500">
            A new version will be created.
            <br />
            Current version (v{fromVersion}) will remain in history.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-4 py-2 border-t border-zinc-800">
          <button
            onClick={() => setShowRollbackConfirm(false)}
            disabled={rollingBack}
            className="btn-neutral disabled:opacity-50"
          >
            cancel
          </button>

          <button
            onClick={handleRollback}
            disabled={rollingBack}
            className="btn-edit-action-confirm disabled:opacity-50"
          >
            {rollingBack ? "rolling back…" : "confirm rollback"}
          </button>
        </div>
      </div>
    </div>
  );
}
