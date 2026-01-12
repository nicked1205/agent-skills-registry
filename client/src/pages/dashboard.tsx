import { useEffect, useState, useRef } from "react";
import { uploadSkill } from "../api/skills";
import { fetchMe } from "../api/auth";
import { fetchAllUsedTags } from "../api/tag";
import type { ErrorT, TagT } from "../types";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import SkillGrid from "../components/dashboard/SkillGrid";
import ErrorModal from "../components/ui/ErrorModal";

type ViewMode = "private" | "public";

const MAX_TAG_FILTERS = 5;

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialView =
    (searchParams.get("view") as "private" | "public") ?? "private";

  const initialSearch = searchParams.get("search") ?? "";

  const initialTags = searchParams.get("tags")
    ? searchParams.get("tags")!.split(",").filter(Boolean)
    : [];

  const [view, setView] = useState<ViewMode>(initialView); // view mode
  const [reloadKey, setReloadKey] = useState(0); // helps with refetch skill list after update
  const [username, setUsername] = useState<string | null>(null); // current user

  // search dropdown
  const [searchOpen, setSearchOpen] = useState(
    initialSearch.length > 0 || initialTags.length > 0
  );
  const [searchName, setSearchName] = useState(initialSearch);
  const [tagFilterOpen, setTagFilterOpen] = useState(false);

  // tag dropdown
  const [availableTags, setAvailableTags] = useState<TagT[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);

  // applied filters (important)
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);
  const [appliedTags, setAppliedTags] = useState<string[]>(initialTags);

  const [systemError, setSystemError] = useState<ErrorT | null>(null);

  const [layout, setLayout] = useState<"card" | "row">(
    () => (localStorage.getItem("layout") as "card" | "row") || "card"
  );

  const [isNarrow, setIsNarrow] = useState(
    () => window.matchMedia("(max-width: 768px)").matches
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null); // ref for Add Skill
  const navigate = useNavigate();

  // update url when search params are applied and depend on view mode
  function updateUrl(
    view: "private" | "public",
    search: string,
    tags: string[]
  ) {
    const params = new URLSearchParams();

    params.set("view", view);

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (tags.length > 0) {
      params.set("tags", tags.join(","));
    }

    setSearchParams(params);
  }

  // fetch user info on mount
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const data = await fetchMe();
        if (!cancelled) {
          setUsername(data.username);
        }
      } catch (err) {
        if (!cancelled) {
          setSystemError({
            title: "failed to load user",
            message: (err as Error).message,
            fatal: true,
          });
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  // fetch tags when dropdown open or the search state changes
  useEffect(() => {
    if (!tagFilterOpen) return;

    let cancelled = false;

    async function loadTags() {
      try {
        const tags = await fetchAllUsedTags(tagSearch);
        if (!cancelled) {
          setAvailableTags(tags);
        }
      } catch (err) {
        if (!cancelled) {
          setSystemError({
            title: "failed to load tags",
            message: (err as Error).message,
            fatal: false,
          });
        }
      }
    }

    loadTags();

    return () => {
      cancelled = true;
    };
  }, [tagFilterOpen, tagSearch]);

  // handle narrow screen changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    function handleChange(e: MediaQueryListEvent) {
      setIsNarrow(e.matches);
    }

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // switch to card layout on narrow screens
  useEffect(() => {
    if (isNarrow && layout === "row") {
      setLayout("card");
    }
  }, [isNarrow, layout]);

  // handle file upload
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".md")) {
      setSystemError({
        title: "invalid file type",
        message: "only markdown (.md) files are allowed",
        fatal: false,
      });
      return;
    }

    try {
      await uploadSkill(file);
      setView("private");
      updateUrl("private", appliedSearch, appliedTags);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setSystemError({
        title: "failed to upload skill",
        message: (err as Error).message,
        fatal: false,
      });
    } finally {
      e.target.value = "";
    }
  }

  if (systemError?.fatal) {
    return (
      <ErrorModal
        error={systemError}
        onExit={() => navigate(`/login`)}
        onClose={() => setSystemError(null)}
      />
    );
  }

  return (
    <div className="h-screen bg-zinc-950 text-zinc-200 flex flex-col overflow-hidden">
      <input
        type="file"
        accept=".md"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <DashboardHeader username={username} />

      <main className="px-3 sm:px-6 py-3 flex flex-col flex-1 overflow-hidden">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Toggle Public/Private */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-600">view:</span>
              <button
                onClick={() => {
                  setView("private");
                  updateUrl("private", appliedSearch, appliedTags);
                }}
                className={`p-1 ${
                  view === "private" ? "text-(--glitch-green)" : "btn-neutral"
                }`}
              >
                {view === "private" ? "[my skills]" : "my skills"}
              </button>
              <button
                onClick={() => {
                  setView("public");
                  updateUrl("public", appliedSearch, appliedTags);
                }}
                className={`p-1 ${
                  view === "public" ? "text-(--glitch-green)" : "btn-neutral"
                }`}
              >
                {view === "public" ? "[public]" : "public"}
              </button>
            </div>

            <div className="hidden md:flex items-center text-xs gap-2">
              <span className="text-zinc-600">layout:</span>
              <button
                onClick={() => setLayout("card")}
                disabled={layout === "card"}
                className={`p-1 ${
                  layout === "card" ? "text-(--glitch-green)" : "btn-neutral"
                }`}
              >
                {layout === "card" ? "[card]" : "card"}
              </button>
              <button
                onClick={() => setLayout("row")}
                disabled={layout === "row"}
                className={`p-1 ${
                  layout === "row" ? "text-(--glitch-green)" : "btn-neutral"
                }`}
              >
                {layout === "row" ? "[row]" : "row"}
              </button>
            </div>
          </div>

          {/* Add Skill */}
          <div className="flex items-center gap-4">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen((o) => !o)}
              className="text-xs text-zinc-400 hover:text-(--glitch-green) hover:cursor-pointer"
            >
              {searchOpen ? "hide search" : "search"}
            </button>

            {/* Add Skill */}
            <button
              disabled={view === "public"}
              onClick={() => fileInputRef.current?.click()}
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

        {/* Search panel */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            searchOpen ? "max-h-40 opacity-100 mb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4 p-1">
            {/* Name search */}
            <input
              type="text"
              placeholder="search filename"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full md:flex-1 input-glitch-green"
            />
            <div className="flex items-center gap-3 justify-between">
              {/* Tag filter toggle */}
              <div className="relative md:mr-6">
                <button
                  onClick={() => setTagFilterOpen((o) => !o)}
                  className="btn-glitch-green-2"
                >
                  filter tags
                </button>

                {/* Tag filter dropdown */}
                {tagFilterOpen && (
                  <div className="absolute z-10 -translate-x-1/2 left-1/2 mt-2 w-50 border border-zinc-800 bg-zinc-950 p-3">
                    {/* Tag Search */}
                    <input
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      placeholder="search tags"
                      className="mb-2 w-full input-glitch-green"
                    />

                    <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 text-xs items-center">
                      {availableTags.length === 0 && (
                        <div className="text-zinc-400 text-center">
                          no tags with that name
                        </div>
                      )}

                      {availableTags.map((tag) => {
                        const checked = selectedTags.includes(tag.name);
                        const disabled =
                          !checked && selectedTags.length >= MAX_TAG_FILTERS;

                        return (
                          <label
                            key={tag.id}
                            className={`flex items-center gap-2 text-zinc-600 dark:text-zinc-400 ${
                              disabled ? "" : "cursor-pointer"
                            }`}
                          >
                            <input
                              className={`accent-(--glitch-green) ${
                                disabled ? "" : "cursor-pointer"
                              }`}
                              type="checkbox"
                              checked={checked}
                              disabled={disabled}
                              onChange={() =>
                                setSelectedTags((prev) =>
                                  checked
                                    ? prev.filter((t) => t !== tag.name)
                                    : [...prev, tag.name]
                                )
                              }
                            />
                            {tag.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSearchName("");
                    setSelectedTags([]);
                    setAppliedSearch("");
                    setAppliedTags([]);
                    updateUrl(view, "", []);
                  }}
                  className="text-xs btn-neutral"
                >
                  clear
                </button>

                <button
                  onClick={() => {
                    setAppliedSearch(searchName);
                    setAppliedTags(selectedTags);
                    updateUrl(view, searchName, selectedTags);
                  }}
                  className={`btn-glitch-green-2`}
                >
                  apply
                </button>
              </div>
            </div>
          </div>
        </div>
        <SkillGrid
          username={username}
          view={view}
          reloadKey={reloadKey}
          appliedSearch={appliedSearch}
          appliedTags={appliedTags}
          onError={(err) => setSystemError(err)}
          layout={layout}
          isNarrow={isNarrow}
        />
      </main>
      {systemError && !systemError.fatal && (
        <ErrorModal
          error={systemError}
          onClose={() => setSystemError(null)}
          onExit={() => navigate(`/login`)}
        />
      )}
    </div>
  );
}
