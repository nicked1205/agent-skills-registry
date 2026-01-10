import { useState } from "react";
import type { SkillDetailsT } from "../../types";
import { downloadSkill } from "../../api/skills";

export interface Props {
  skill: SkillDetailsT;
}

export default function MarkdownViewer({ skill }: Props) {
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    try {
      const blob = await downloadSkill(skill.id);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${skill.name}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
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
            onClick={handleDownload}
            className="text-xs hover:underline hover:cursor-pointer"
          >
            Download
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-zinc-50 dark:bg-zinc-950 text-orange-500 p-4 max-h-[46vh] overflow-auto custom-scrollbar">
        <pre className="text-sm font-mono whitespace-pre-wrap">
          {skill.content || "// No content in this version"}
        </pre>
      </div>
    </div>
  );
}
