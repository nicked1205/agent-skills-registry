import { SettingsIcon } from "../../icons";
import { setTheme } from "../../utils/theme";
import { useEffect, useRef, useState } from "react";

interface Props {
  username: string | null;
}

export default function DashboardHeader({ username }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setThemeState] = useState<"dark" | "light">(
    (localStorage.getItem("theme") as "dark" | "light") ?? "dark"
  );

  const menuRef = useRef<HTMLDivElement | null>(null); // ref for settings menu

  // close settings menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }

    if (settingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsOpen]);

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between duration-300">
      <h1 className="text-lg font-semibold">Agent Skill Registry</h1>

      <div className="relative flex items-center gap-3" ref={menuRef}>
        {/* Profile */}
        <span className="text-sm text-zinc-600 dark:text-zinc-400 duration-300 font-light">
          Hi,{" "}
          <span className="font-medium inline-block max-w-[20vw] truncate align-bottom">
            {username ?? "…"}
          </span>
        </span>

        {/* Settings */}
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="p-1"
          aria-label="Settings"
        >
          <SettingsIcon
            className={`h-5 w-5 transition-transform hover:cursor-pointer hover:rotate-90 duration-300 text-orange-500 ${
              settingsOpen ? "rotate-90" : ""
            }`}
          />
        </button>

        {/* Settings Modal */}
        {settingsOpen && (
          <div className="z-10 absolute right-0 top-8 w-44 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-md duration-300">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-zinc-600 dark:text-zinc-400 duration-300">
                Dark mode
              </span>

              <button
                onClick={() => {
                  const next = theme === "dark" ? "light" : "dark";
                  setTheme(next);
                  setThemeState(next);
                }}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition duration-300 hover:cursor-pointer hover:dark:brightness-125 hover:brightness-90 ${
                  theme === "dark"
                    ? "bg-orange-500"
                    : "bg-zinc-300 dark:bg-zinc-700"
                }`}
                aria-checked={theme === "dark"}
                role="switch"
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-300 ${
                    theme === "dark" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 duration-300" />

            {/* Logout Button */}
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              className="block rounded-b-md w-full px-3 py-2 text-left text-xs text-red-400 bg-zinc-100 hover:bg-zinc-200 hover:dark:bg-zinc-800 dark:bg-zinc-900 duration-300 hover:cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
