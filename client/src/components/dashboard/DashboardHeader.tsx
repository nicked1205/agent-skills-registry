import { useEffect, useRef, useState } from "react";

interface Props {
  username: string | null;
  layout: "card" | "row";
  onLayoutChange: (layout: "card" | "row") => void;
}

export default function DashboardHeader({
  username,
  layout,
  onLayoutChange,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="text-sm border-b border-zinc-800 bg-zinc-950 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-(--glitch-green) font-semibold">&gt;_</span>
          <span className="text-zinc-200">agent-skills-registry</span>
          <span className="text-zinc-500">dashboard</span>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <button
            onClick={() => onLayoutChange("card")}
            disabled={layout === "card"}
            className={`p-1 ${
              layout === "card" ? "text-(--glitch-green)" : "btn-neutral"
            }`}
          >
            card
          </button>
          <span className="text-zinc-600">|</span>
          <button
            onClick={() => onLayoutChange("row")}
            disabled={layout === "row"}
            className={`p-1 ${
              layout === "row" ? "text-(--glitch-green)" : "btn-neutral"
            }`}
          >
            row
          </button>
        </div>
      </div>
      <div className="relative flex items-center gap-2" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-zinc-400 hover:text-(--glitch-green) hover:cursor-pointer"
        >
          {username ?? "unknown"}@local
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-6 min-w-40 border border-zinc-800 bg-zinc-950">
            <div className="px-3 py-2 text-zinc-500 border-b border-zinc-800">
              session active
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              className="w-full text-left px-3 py-2 text-red-400 hover:bg-zinc-900 hover:cursor-pointer"
            >
              logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
