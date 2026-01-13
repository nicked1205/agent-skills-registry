import { useEffect, useRef, useState } from "react";

interface Props {
  username: string | null;
}

export default function DashboardHeader({ username }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  function middleTruncate(text: string, start = 12, end = 12) {
    if (text.length <= start + end + 1) return text;
    return `${text.slice(0, start)}…${text.slice(-end)}`;
  }

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
    <header className="text-xs sm:text-sm border-b border-zinc-800 bg-zinc-950 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-(--glitch-green) font-semibold">&gt;_</span>
        <span className="hidden md:block text-zinc-200">
          agent-skills-registry
        </span>
        <span className="block md:hidden text-zinc-200">asr</span>
        <span className="text-zinc-500">dashboard</span>
      </div>
      <div className="relative flex items-center gap-2 min-w-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center min-w-0 text-zinc-400 hover:text-(--glitch-green) hover:cursor-pointer"
          title={`${username ?? "unknown"}@local`}
        >
          <span>{username ? middleTruncate(username) : "unknown"}</span>
          <span className="shrink-0">@local</span>
        </button>

        {menuOpen && (
          <div className="z-20 absolute right-0 top-6 min-w-40 border border-zinc-800 bg-zinc-950">
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
