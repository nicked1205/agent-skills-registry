import { useState } from "react";
import type { ErrorT, SkillDetailsT } from "../../types";
import { downloadSkill } from "../../api/skills";
export interface Props {
  skill: SkillDetailsT;
  onError: (err: ErrorT) => void;
  onDownload: () => void;
}

export default function MarkdownViewer({ skill, onError, onDownload }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(skill.content);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

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

      onDownload();
    } catch (err) {
      onError({
        title: "failed to download skill",
        message: (err as Error).message,
        fatal: false,
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-3 py-2 border-b border-zinc-800 text-xs sm:text-sm text-zinc-500">
        <span className="text-zinc-400">markdown</span>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className={`${copied ? "cursor-default" : "btn-glitch-green-tool"}`}
            disabled={copied}
          >
            {copied ? "copied" : "copy"}
          </button>

          <button onClick={handleDownload} className="btn-glitch-green-tool">
            download
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 p-4 overflow-y-auto text-zinc-200 max-w-none custom-scrollbar">
        <pre className="text-xs sm:text-sm md:text-md whitespace-pre-wrap wrap-anywhere leading-relaxed">
          {skill.content || "// No content in this version"}
        </pre>
      </div>
    </div>
  );
}
