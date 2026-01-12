export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100">
      {/* Future homepage? */}
      <div className="hidden md:flex w-4/10 flex-col justify-center px-12">
        <h1 className="text-lg mb-4">agent-skill-registry</h1>

        <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
          &gt; store, version, and diff skills as structured artifacts.
          <br />
          &gt; built for agent workflows.
          <br />
          &gt; terminal-like aesthetic.
        </p>
      </div>

      {/* Content (right now just login and register) */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
}
