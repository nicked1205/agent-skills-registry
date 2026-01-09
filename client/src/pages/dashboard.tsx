import { useEffect, useState, useRef } from "react";
import { uploadSkill } from "../api/skills";
import { fetchMe } from "../api/auth";
import { fetchAllTags } from "../api/tag";
import type { TagT } from "../types/tag";
import { useSearchParams } from "react-router-dom";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import SkillGrid from "../components/dashboard/SkillGrid";

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

  const fileInputRef = useRef<HTMLInputElement | null>(null); // ref for Add Skill

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
    fetchMe().then((data) => setUsername(data.username));
  }, []);

  // fetch tags when dropdown open or the search state changes
  useEffect(() => {
    if (!tagFilterOpen) return;

    fetchAllTags(tagSearch).then(setAvailableTags).catch(console.error);
  }, [tagFilterOpen, tagSearch]);

  // handle file upload
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".md")) {
      alert("Only .md files are supported");
      return;
    }

    try {
      await uploadSkill(file);
      setView("private");
      updateUrl("private", appliedSearch, appliedTags);
      setReloadKey((k) => k + 1);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 duration-300 flex flex-col overflow-hidden">
      <input
        type="file"
        accept=".md"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <DashboardHeader username={username} />

      <main className="p-6 flex flex-col flex-1 overflow-hidden">
        <div className="mb-2 flex items-center justify-between">
          {/* Toggle Public/Private */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setView("private");
                updateUrl("private", appliedSearch, appliedTags);
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition duration-300 ${
                view === "private"
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 hover:dark:text-zinc-200 hover:cursor-pointer"
              }`}
            >
              My Skills
            </button>

            <button
              onClick={() => {
                setView("public");
                updateUrl("public", appliedSearch, appliedTags);
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition duration-300 ${
                view === "public"
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800  hover:dark:text-zinc-200 hover:cursor-pointer"
              }`}
            >
              Public Skills
            </button>
          </div>

          {/* Add Skill */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen((o) => !o)}
              className="p-1 rounded hover:cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 duration-300 transition"
              aria-label="Search"
            >
              {/* Magnifying glass */}
              <svg
                className={`h-4 w-4 transition-transform duration-300 ${
                  searchOpen ? "rotate-90 text-orange-500" : "text-zinc-500"
                }`}
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M20 20L17 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Add Skill */}
            <button
              disabled={view === "public"}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-sm px-3 py-1 text-xs font-medium transition duration-300 ${
                view === "public"
                  ? "bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 opacity-30"
                  : "bg-orange-500 text-white hover:bg-orange-600 hover:cursor-pointer"
              }`}
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Search panel */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            searchOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="rounded-md p-2 flex items-center gap-3">
            {/* Name search */}
            <input
              type="text"
              placeholder="Search skills by name…"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="flex-1 min-w-60 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1 text-xs outline-none focus:ring-1 focus:ring-orange-500 duration-300 caret-amber-500"
            />

            {/* Tag filter toggle */}
            <div className="relative">
              <button
                onClick={() => setTagFilterOpen((o) => !o)}
                className="flex whitespace-nowrap rounded-md border border-zinc-300 dark:border-zinc-700 pl-3 pr-2 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:cursor-pointer duration-300 transition"
              >
                Filter by tags{" "}
                <span className={`p-0.75 ${tagFilterOpen ? "rotate-180" : ""}`}>
                  <svg
                    className="h-3 w-3 fill-zinc-600 dark:fill-zinc-400"
                    viewBox="0 0 16 16"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#000000"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <rect
                        width="16"
                        height="16"
                        id="icon-bound"
                        fill="none"
                      ></rect>{" "}
                      <polygon points="8,5 13,10 3,10"></polygon>{" "}
                    </g>
                  </svg>
                </span>
              </button>

              {/* Tag filter dropdown */}
              {tagFilterOpen && (
                <div className="z-10 -translate-x-1/2 left-1/2 absolute mt-2 w-50 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-md duration-300">
                  {/* Tag Search */}
                  <input
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="Search tags..."
                    className="mb-2 w-full rounded border border-zinc-300 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-orange-500 duration-300 px-2 py-1 text-xs caret-amber-500"
                  />

                  <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 text-xs items-center">
                    {availableTags.length === 0 && (
                      <div className="text-zinc-400 text-center">
                        No tags with that name
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
                            className={`accent-orange-500 ${
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
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => {
                  setSearchName("");
                  setSelectedTags([]);
                  setAppliedSearch("");
                  setAppliedTags([]);
                  updateUrl(view, "", []);
                }}
                className="text-xs px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:cursor-pointer duration-300"
              >
                Clear
              </button>

              <button
                onClick={() => {
                  setAppliedSearch(searchName);
                  setAppliedTags(selectedTags);
                  updateUrl(view, searchName, selectedTags);
                }}
                className="text-xs px-3 py-1 rounded bg-orange-500 text-white hover:bg-orange-600 hover:cursor-pointer duration-300"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
        <SkillGrid
          username={username}
          view={view}
          reloadKey={reloadKey}
          appliedSearch={appliedSearch}
          appliedTags={appliedTags}
        />
      </main>
    </div>
  );
}
