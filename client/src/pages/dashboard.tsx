import { useEffect, useState, useRef } from "react";
import { uploadSkill } from "../api/skills";
import { fetchMe } from "../api/auth";
import { fetchAllUsedTags } from "../api/tag";
import type { ErrorT, TagT } from "../types";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import SkillGrid from "../components/dashboard/SkillGrid";
import ErrorModal from "../components/ui/ErrorModal";
import DashboardControls from "../components/dashboard/DashboardControls";
import DashboardSearchPanel from "../components/dashboard/DashboardSearchPanel";

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialView =
    (searchParams.get("view") as "private" | "public") ?? "private";

  const initialSearch = searchParams.get("search") ?? "";

  const initialTags = searchParams.get("tags")
    ? searchParams.get("tags")!.split(",").filter(Boolean)
    : [];

  const [view, setView] = useState<"private" | "public">(initialView); // view mode
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

  // applied filters
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
  const tagDropdownRef = useRef<HTMLDivElement | null>(null);

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

  // close tag dropdown when clicked outside
  useEffect(() => {
    if (!tagFilterOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(e.target as Node)
      ) {
        setTagFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tagFilterOpen]);

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
        <DashboardControls
          view={view}
          layout={layout}
          searchOpen={searchOpen}
          onViewChange={(v) => {
            setView(v);
            updateUrl(v, searchName, selectedTags);
          }}
          onLayoutChange={(l) => {
            setLayout(l);
            localStorage.setItem("layout", l);
          }}
          onToggleSearch={() => setSearchOpen(!searchOpen)}
          onAddSkill={() => fileInputRef.current?.click()}
        />

        <DashboardSearchPanel
          open={searchOpen}
          searchName={searchName}
          setSearchName={setSearchName}
          tagSearch={tagSearch}
          setTagSearch={setTagSearch}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          availableTags={availableTags}
          tagFilterOpen={tagFilterOpen}
          setTagFilterOpen={setTagFilterOpen}
          tagDropdownRef={tagDropdownRef}
          onApply={() => {
            setAppliedSearch(searchName);
            setAppliedTags(selectedTags);
            updateUrl(view, searchName, selectedTags);
          }}
          onClear={() => {
            setSearchName("");
            setSelectedTags([]);
            setAppliedSearch("");
            setAppliedTags([]);
            updateUrl(view, "", []);
          }}
        />

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
