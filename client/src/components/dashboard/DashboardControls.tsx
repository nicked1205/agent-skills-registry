type Props = {
  view: "private" | "public";
  layout: "card" | "row";
  searchOpen: boolean;

  onViewChange: (v: "private" | "public") => void;
  onLayoutChange: (l: "card" | "row") => void;
  onToggleSearch: () => void;
  onAddSkill: () => void;
};

export default function DashboardControls({
  view,
  layout,
  searchOpen,
  onViewChange,
  onLayoutChange,
  onToggleSearch,
  onAddSkill,
}: Props) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {/* Toggle Public/Private */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-600">view:</span>
          <button
            onClick={() => onViewChange("private")}
            className={
              view === "private" ? "text-(--glitch-green)" : "btn-neutral"
            }
          >
            {view === "private" ? "[my skills]" : "my skills"}
          </button>
          <button
            onClick={() => onViewChange("public")}
            className={
              view === "public" ? "text-(--glitch-green)" : "btn-neutral"
            }
          >
            {view === "public" ? "[public]" : "public"}
          </button>
        </div>

        {/* Toggle layout */}
        <div className="hidden md:flex items-center text-xs gap-2">
          <span className="text-zinc-600">layout:</span>
          <button
            onClick={() => onLayoutChange("card")}
            className={
              layout === "card" ? "text-(--glitch-green)" : "btn-neutral"
            }
          >
            {layout === "card" ? "[card]" : "card"}
          </button>
          <button
            onClick={() => onLayoutChange("row")}
            className={
              layout === "row" ? "text-(--glitch-green)" : "btn-neutral"
            }
          >
            {layout === "row" ? "[row]" : "row"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search toggle */}
        <button
          onClick={onToggleSearch}
          className="text-xs text-zinc-400 hover:text-(--glitch-green) hover:cursor-pointer"
        >
          {searchOpen ? "hide search" : "search"}
        </button>

        {/* Add Skill */}
        <button
          onClick={onAddSkill}
          className={`text-xs border px-3 py-1 ${
            view === "public"
              ? "border-zinc-800 text-zinc-600"
              : "btn-glitch-green-2"
          }`}
        >
          add skill
        </button>
      </div>
    </div>
  );
}
