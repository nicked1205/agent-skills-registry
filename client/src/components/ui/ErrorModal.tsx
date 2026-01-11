interface Props {
  error: {
    title?: string;
    message: string;
    source?: string;
    fatal?: boolean;
  };
  onClose: () => void;
  onExit: () => void;
}

export default function ErrorModal({ error, onClose, onExit }: Props) {
  const isFatal = error.fatal;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70">
      <div
        className="
            w-full max-w-lg
            border border-zinc-800 bg-zinc-950
            font-mono text-xs text-zinc-300
          "
      >
        {/* Header */}
        <div className="px-4 py-2 border-b border-zinc-800 text-red-400">
          {error.title ?? "system error"}
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-2">
          <div className="text-zinc-500">[error]</div>

          <div className="text-red-400">{">"} operation failed</div>

          <pre className="text-zinc-400 whitespace-pre-wrap wrap-break-word">
            {error.message}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-4 py-2 border-t border-zinc-800">
          {!isFatal && (
            <button onClick={onClose} className="btn-neutral">
              dismiss
            </button>
          )}

          {isFatal && (
            <button
              onClick={onExit}
              className="text-red-400 hover:text-red-300 hover:cursor-pointer"
            >
              exit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
