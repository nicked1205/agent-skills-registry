import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSkillById } from "../api/skills";
import type { Skill } from "../types/skill";

type SkillDetails = {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  ownerUsername: string;
  latestVersion: number;
  content: string;
  updatedAt: string;
};

export default function SkillDetails() {
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchSkillById(Number(id));
        setSkill(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-sm text-zinc-500">Loading skill…</div>;
  }

  if (error || !skill) {
    return (
      <div className="p-6">
        <p className="mb-4 text-sm text-red-500">
          {error ?? "Skill not found"}
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-orange-500 hover:underline hover:cursor-pointer"
        >
          ← Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6">
      {/* Back */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 text-sm text-orange-500 hover:underline hover:cursor-pointer"
      >
        ← Back to dashboard
      </button>

      <div className="mx-auto max-w-4xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {skill.name}
          </h1>

          <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
            <span>
              Posted by{" "}
              <span className="font-medium">{skill.ownerUsername}</span>
            </span>
            <span>•</span>
            <span>v{skill.latestVersion}</span>
            <span>•</span>
            <span>{skill.isPublic ? "Public" : "Private"}</span>
            <span>•</span>
            <span>
              Last updated {new Date(skill.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Description */}
        {skill.description && (
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            {skill.description}
          </p>
        )}

        {/* Markdown viewer */}
        <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between bg-zinc-200 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-3 py-2">
            <span className="text-xs font-mono opacity-80">markdown</span>

            <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(skill.content);
                  setCopied(true);

                  setTimeout(() => {
                    setCopied(false);
                  }, 1500);
                }}
                className={`text-xs flex items-center gap-1 transition ${
                  copied ? "" : "hover:cursor-pointer hover:underline"
                }`}
                disabled={copied}
              >
                {copied ? (
                  <>
                    Copied
                    <span aria-hidden>✓</span>
                  </>
                ) : (
                  "Copy"
                )}
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([skill.content], {
                    type: "text/markdown",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${skill.name}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-xs hover:underline hover:cursor-pointer"
              >
                Download
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-zinc-50 dark:bg-zinc-950 text-orange-500 p-4 max-h-[70vh] overflow-auto">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {skill.content || "// No content in this version"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
