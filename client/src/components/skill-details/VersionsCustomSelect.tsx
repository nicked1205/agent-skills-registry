import { useEffect, useRef, useState } from "react";
import type { SkillVersionT } from "../../types";
import { ArrowUpIcon } from "../../icons";

interface Props {
  label?: string;
  value: number;
  versions: SkillVersionT[];
  onChange: (v: number) => void;
}

export default function VersionsCustomSelect({
  label,
  value,
  versions,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = versions.find((v) => v.versionNumber === value);

  return (
    <div ref={ref} className="relative inline-flex items-center gap-2">
      {label && (
        <span className="text-xs text-zinc-500 select-none">{label}</span>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between gap-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 min-w-18 text-xs text-zinc-800 dark:text-zinc-200 duration-200 "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:cursor-pointer`}
      >
        <span>{selected ? `v${selected.versionNumber}` : "—"}</span>
        <span className={`p-0.75 ${open ? "rotate-180" : ""}`}>
          <ArrowUpIcon className="h-3 w-3 fill-zinc-600 dark:fill-zinc-400" />
        </span>
      </button>
      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 z-20 mt-1 w-full min-w-24 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg max-h-40 overflow-y-auto custom-scrollbar">
          {versions.map((v) => {
            const active = v.versionNumber === value;

            return (
              <button
                key={v.versionNumber}
                onClick={() => {
                  onChange(v.versionNumber);
                  setOpen(false);
                }}
                className={`
                  w-full text-left px-2 py-1.5 text-xs
                  ${
                    active
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-500"
                      : "select-option"
                  }
                `}
              >
                v{v.versionNumber} {new Date(v.createdAt).toLocaleDateString()}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
