import { useEffect, useState } from "react";
import type { SkillVersionT, VersionsDiffT } from "../../types";
import { fetchSkillDiff } from "../../api/skills";
import { useNavigate } from "react-router-dom";
import VersionsCustomSelect from "./VersionsCustomSelect";

interface Props {
  skillId: number;
  versions: SkillVersionT[];
  from: number;
  to: number;
  onChangeFrom: (v: number) => void;
  onChangeTo: (v: number) => void;
}

export default function SkillDiffViewer({
  skillId,
  versions,
  from,
  to,
  onChangeFrom,
  onChangeTo,
}: Props) {
  const [diff, setDiff] = useState<VersionsDiffT | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loading = !diff && !error;

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadDiff() {
      if (!from || !to) return;

      try {
        setError(null);
        const result = await fetchSkillDiff(skillId, from, to);

        if (!cancelled) {
          setDiff(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load diff");
        }
      }
    }

    loadDiff();

    return () => {
      cancelled = true;
    };
  }, [skillId, from, to]);

  return (
    <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-200 dark:bg-zinc-900 px-5 py-2">
        <div className="flex items-center gap-5 text-xs">
          <VersionsCustomSelect
            label="From"
            value={from}
            versions={versions}
            onChange={onChangeFrom}
          />

          <VersionsCustomSelect
            label="To"
            value={to}
            versions={versions}
            onChange={onChangeTo}
          />
        </div>

        <button
          onClick={() => {
            navigate(`/skills/${skillId}`);
          }}
          className="text-xs text-orange-500 hover:underline hover:cursor-pointer"
        >
          Exit diff
        </button>
      </div>

      {/* Content */}
      <div className="bg-zinc-50 dark:bg-zinc-950 p-4 min-h-[30vh] max-h-[46vh] overflow-auto custom-scrollbar">
        {loading && <div className="text-xs text-zinc-500">Loading diff…</div>}

        {error && <div className="text-xs text-red-500">{error}</div>}

        {!loading && diff && diff.lines.length === 0 && (
          <div className="text-xs text-zinc-500">
            No differences between these versions.
          </div>
        )}

        {!loading &&
          diff &&
          diff.lines.map((line, idx) => {
            const base =
              "whitespace-pre-wrap px-2 py-0.5 rounded-sm flex gap-3";

            if (line.type === "add") {
              return (
                <div
                  key={idx}
                  className={`${base} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300`}
                >
                  <div className="grid grid-cols-[3rem_1fr] items-start gap-3 px-2 py-0.5 whitespace-pre-wrap">
                    <span className="text-right text-xs opacity-50 leading-5 select-none">
                      {line.oldLineNumber ?? ""}
                    </span>
                    <span className="leading-5">+ {line.content}</span>
                  </div>
                </div>
              );
            }

            if (line.type === "remove") {
              return (
                <div
                  key={idx}
                  className={`${base} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300`}
                >
                  <div className="grid grid-cols-[3rem_1fr] items-start gap-3 px-2 py-0.5 whitespace-pre-wrap">
                    <span className="text-right text-xs opacity-50 leading-5 select-none">
                      {line.oldLineNumber ?? ""}
                    </span>
                    <span className="leading-5">- {line.content}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`${base} text-zinc-700 dark:text-zinc-300`}
              >
                <div className="grid grid-cols-[3rem_1fr] items-start gap-3 px-2 py-0.5 whitespace-pre-wrap">
                  <span className="text-right text-xs opacity-50 leading-5 select-none">
                    {line.oldLineNumber ?? ""}
                  </span>
                  <span className="leading-5">{line.content}</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
