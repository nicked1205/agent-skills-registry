import { useEffect, useState } from "react";
import type { ErrorT, SkillVersionT, VersionsDiffT } from "../../types";
import { fetchSkillDiff } from "../../api/skills";
import { useNavigate } from "react-router-dom";
import VersionsCustomSelect from "./VersionsCustomSelect";
import RollbackConfirmationModal from "./RollbackConfirmationModal";

interface Props {
  skillId: number;
  from: number;
  to: number;
  onError: (err: ErrorT) => void;
  versions: SkillVersionT[];
  isRollback: boolean;
  reloadKey: number;
  setReloadKey: React.Dispatch<React.SetStateAction<number>>;
}

export default function SkillDiffViewer({
  skillId,
  from,
  to,
  onError,
  versions,
  isRollback,
  reloadKey,
  setReloadKey,
}: Props) {
  const [diff, setDiff] = useState<VersionsDiffT | null>(null);
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false);

  const navigate = useNavigate();

  // fetch diff when from/to changes
  useEffect(() => {
    let cancelled = false;

    async function loadDiff() {
      if (!from || !to || from === to) return;

      setDiff(null);

      try {
        const result = await fetchSkillDiff(skillId, from, to);
        if (!cancelled) {
          setDiff(result);
        }
      } catch (err) {
        if (!cancelled) {
          onError({
            title: "failed to load version diff",
            message: (err as Error).message,
            fatal: false,
          });
        }
      }
    }

    loadDiff();

    return () => {
      cancelled = true;
    };
  }, [skillId, from, to, onError, reloadKey]);

  function renderLineContent(line: VersionsDiffT["lines"][number]) {
    if (line.type !== "modify" || !line.words) {
      return line.content;
    }

    return line.words.map((word, i) => {
      const base = "px-0.5 rounded-sm";

      if (word.type === "add") {
        return (
          <span
            key={i}
            className={`${base} bg-(--glitch-green-word-highlight) text-zinc-100`}
          >
            {word.content}{" "}
          </span>
        );
      }

      if (word.type === "remove") {
        return (
          <span
            key={i}
            className={`${base} bg-(--red-word-highlight) text-zinc-100 line-through`}
          >
            {word.content}{" "}
          </span>
        );
      }

      return <span key={i}>{word.content} </span>;
    });
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-3 py-2 border-b border-zinc-800 text-xs sm:text-sm text-zinc-500 justify-between">
        <div className="flex items-center gap-2">
          {isRollback ? (
            <span className="text-zinc-400">v{from}</span>
          ) : (
            <VersionsCustomSelect
              value={from}
              versions={versions}
              disable={to}
              onChange={(v) =>
                navigate(
                  `/skills/${skillId}?from=${v}&to=${to}&allowRollback=${isRollback}`
                )
              }
            />
          )}
          <span className="text-zinc-600">→</span>

          <VersionsCustomSelect
            value={to}
            versions={versions}
            disable={from}
            onChange={(v) =>
              navigate(
                `/skills/${skillId}?from=${from}&to=${v}&allowRollback=${isRollback}`
              )
            }
          />
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(`/skills/${skillId}`)}
            className="btn-neutral"
          >
            exit <span className="hidden md:inline-block">diff</span>
          </button>

          {isRollback && (
            <button
              onClick={() => setShowRollbackConfirm(true)}
              className="btn-yellow-tool"
            >
              rollback{" "}
              <span className="hidden md:inline-block">
                to selected version
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto text-xs sm:text-sm md:text-md leading-relaxed text-zinc-200 max-w-none custom-scrollbar">
        {from == to ? (
          <div className="h-full flex items-center justify-center text-xs sm:text-sm text-zinc-500">
            select two different versions to compare
          </div>
        ) : (
          diff?.lines.map((line, i) => (
            <div
              key={i}
              className={`flex px-3 py-0.5 ${
                line.type === "add"
                  ? "bg-(--glitch-green-highlight) text-zinc-200"
                  : line.type === "remove"
                  ? "bg-(--red-highlight) text-zinc-200"
                  : line.type === "modify"
                  ? "bg-[rgba(99,102,241,0.06)] text-zinc-200"
                  : "text-zinc-400"
              }`}
            >
              {/* Line numbers */}
              <span className="w-10 md:w-12 shrink-0 text-right pr-2 text-zinc-600">
                {line.oldLineNumber ?? ""}
              </span>
              <span className="w-10 md:w-12 shrink-0 text-right pr-2 text-zinc-600">
                {line.newLineNumber ?? ""}
              </span>

              {/* Texts */}
              <span className="whitespace-pre-wrap wrap-anywhere">
                {line.type === "add"
                  ? "+ "
                  : line.type === "remove"
                  ? "- "
                  : line.type === "modify"
                  ? "~ "
                  : "  "}
                {renderLineContent(line)}
              </span>
            </div>
          ))
        )}
      </div>
      {showRollbackConfirm && (
        <RollbackConfirmationModal
          skillId={skillId}
          fromVersion={from}
          toVersion={to}
          setShowRollbackConfirm={setShowRollbackConfirm}
          onError={onError}
          onSuccess={() => {
            setReloadKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
