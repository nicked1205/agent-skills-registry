import { useEffect, useState } from "react";
import type { ErrorT, SkillVersionT, VersionsDiffT } from "../../types";
import { fetchSkillDiff } from "../../api/skills";
import { useNavigate } from "react-router-dom";
import VersionsCustomSelect from "./VersionsCustomSelect";

interface Props {
  skillId: number;
  from: number;
  to: number;
  onError: (err: ErrorT) => void;
  versions: SkillVersionT[];
}

export default function SkillDiffViewer({
  skillId,
  from,
  to,
  onError,
  versions,
}: Props) {
  const [diff, setDiff] = useState<VersionsDiffT | null>(null);

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
  }, [skillId, from, to, onError]);

  return (
    <div className="h-full flex flex-col border border-zinc-800 bg-zinc-950">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-3 py-2 border-b border-zinc-800 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <VersionsCustomSelect
            value={from}
            versions={versions}
            onChange={(v) => navigate(`/skills/${skillId}?from=${v}&to=${to}`)}
          />

          <span className="text-zinc-600">→</span>

          <VersionsCustomSelect
            value={to}
            versions={versions}
            onChange={(v) =>
              navigate(`/skills/${skillId}?from=${from}&to=${v}`)
            }
          />
        </div>

        <button
          onClick={() => navigate(`/skills/${skillId}`)}
          className="hover:text-(--glitch-green) hover:cursor-pointer"
        >
          exit diff
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto text-sm leading-relaxed text-zinc-200 max-w-none custom-scrollbar">
        {from == to ? (
          <div className="h-full flex items-center justify-center text-xs text-zinc-500">
            select two different versions to compare
          </div>
        ) : (
          diff?.lines.map((line, i) => (
            <div
              key={i}
              className={`flex px-3 py-0.5 ${
                line.type === "add"
                  ? "bg-[rgba(74,246,38,0.06)] text-zinc-200"
                  : line.type === "remove"
                  ? "bg-[rgba(239,68,68,0.08)] text-zinc-200"
                  : "text-zinc-400"
              }`}
            >
              {/* Line numbers */}
              <span className="w-12 shrink-0 text-right pr-2 text-zinc-600">
                {line.oldLineNumber ?? ""}
              </span>
              <span className="w-12 shrink-0 text-right pr-2 text-zinc-600">
                {line.newLineNumber ?? ""}
              </span>

              {/* Texts */}
              <span className="whitespace-pre-wrap wrap-break-word">
                {line.type === "add"
                  ? "+ "
                  : line.type === "remove"
                  ? "- "
                  : "  "}
                {line.content}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
