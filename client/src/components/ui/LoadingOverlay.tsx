export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-40 flex bg-zinc-950">
      <div className="text-sm text-zinc-400 space-y-1 m-4">
        <div className="text-zinc-500">[ system ]</div>
        <div>{">"} fetching metadata…</div>
        <div>{">"} fetching content…</div>
        <div>{">"} building ui…</div>
      </div>
    </div>
  );
}
