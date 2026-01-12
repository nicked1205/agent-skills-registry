import { useEffect, useRef, useState } from "react";
import type { SkillVersionT } from "../../types";

interface Props {
  label?: string;
  value: number;
  versions: SkillVersionT[];
  onChange: (v: number) => void;
  disable?: number;
}

export default function VersionsCustomSelect({
  label,
  value,
  versions,
  onChange,
  disable,
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
    <div ref={ref} className="relative inline-flex items-center gap-2 text-xs">
      {label && <span className="text-zinc-600 select-none">{label}</span>}

      {/* Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-2 py-1 border border-zinc-700 bg-zinc-950 text-zinc-300 hover:text-(--glitch-green) hover:border-(--glitch-green-bg)transition-colors cursor-pointer`}
      >
        <span>{selected ? `v${selected.versionNumber}` : "—"}</span>
        <span className="text-zinc-600 select-none">▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 w-13 sm:w-32 md:w-44 max-h-48 overflow-y-auto border border-zinc-700 bg-zinc-950 shadow-[0_0_0_1px_rgba(0,0,0,0.6)] custom-scrollbar">
          {versions.map((v) => {
            const active = v.versionNumber === value;

            return (
              <button
                key={v.versionNumber}
                onClick={() => {
                  onChange(v.versionNumber);
                  setOpen(false);
                }}
                disabled={active || v.versionNumber === disable}
                className={`
                  w-full flex justify-between px-3 py-1.5 text-left text-xs
                  ${
                    active
                      ? "text-(--glitch-green) bg-(--glitch-green-highlight) cursor-default"
                      : v.versionNumber === disable
                      ? "text-zinc-600 cursor-default"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 hover:cursor-pointer"
                  }
                `}
              >
                <span>v{v.versionNumber}</span>
                <span className="hidden sm:block text-zinc-600">
                  {new Date(v.createdAt).toLocaleDateString()}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
