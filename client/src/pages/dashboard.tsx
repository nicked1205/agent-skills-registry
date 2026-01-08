import { useEffect, useState, useRef } from "react";
import { fetchMySkills, fetchPublicSkills, uploadSkill } from "../api/skills";
import type { Skill } from "../types/skill";

type ViewMode = "private" | "public";

export default function Dashboard() {
  const [view, setView] = useState<ViewMode>("private");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      setSkills([]);

      try {
        const data =
          view === "private"
            ? await fetchMySkills()
            : await fetchPublicSkills();

        if (active) setSkills(data);
      } catch (err) {
        if (active) setError((err as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [view, reloadKey]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".md")) {
      alert("Only .md files are supported");
      return;
    }

    try {
      await uploadSkill(file);
      setView("private"); // ensure added file is initially private
      setReloadKey((k) => k + 1);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <input
        type="file"
        accept=".md"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      {/* Header and Utility Bar */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Agent Skill Registry</h1>

        <div className="flex items-center gap-2">
          {/* future buttons like logout, profile and settings go here */}
        </div>
      </header>

      <main className="p-6">
        {/* Toggle and Add Skill */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("private")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition duration-300 ${
                view === "private"
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:cursor-pointer"
              }`}
            >
              My Skills
            </button>

            <button
              onClick={() => setView("public")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition duration-300 ${
                view === "public"
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:cursor-pointer"
              }`}
            >
              Public Skills
            </button>
          </div>

          {/* Add Skill */}
          <button
            disabled={view === "public"}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-sm px-3 py-1 text-xs font-medium transition duration-300 ${
              view === "public"
                ? "bg-zinc-700 text-zinc-400"
                : "bg-orange-500 text-white hover:bg-orange-600 hover:cursor-pointer"
            }`}
          >
            Add Skill
          </button>
        </div>

        {/* Cards grid */}
        {loading && <p className="text-xs text-zinc-400">Loading skills…</p>}

        {error && <p className="text-xs text-red-500">{error}</p>}

        {!loading && !error && skills.length === 0 && (
          <p className="text-xs text-zinc-500">
            {view === "private"
              ? "You haven’t uploaded any skills yet."
              : "No public skills available."}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <h2 className="mb-1 text-sm font-semibold line-clamp-1">
                {skill.name}
              </h2>

              <p className="mb-2 text-[11px] text-zinc-500 line-clamp-1">
                {view === "private" ? "Posted by you" : "Posted by user"}
              </p>

              <p className="mb-3 text-xs text-zinc-400 line-clamp-2">
                {skill.description}
              </p>

              <div className="mt-auto flex justify-between text-xs text-zinc-500">
                <span>v{skill.latestVersion}</span>
                <span>{new Date(skill.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
