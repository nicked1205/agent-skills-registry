import { useEffect, useState, useRef } from "react";
import type { ErrorT, SkillCardT } from "../../types";
import { fetchSkills } from "../../api/skills";
import SkillCard from "../dashboard/SkillCard";
import SkillRow from "../dashboard/SkillRow";

interface Props {
  username: string | null;
  view: "private" | "public";
  reloadKey: number;
  appliedSearch: string;
  appliedTags: string[];
  onError: (err: ErrorT) => void;
  layout: "card" | "row";
  isNarrow: boolean;
}

export default function SkillGrid({
  username,
  view,
  reloadKey,
  appliedSearch,
  appliedTags,
  onError,
  layout,
  isNarrow,
}: Props) {
  const [skills, setSkills] = useState<SkillCardT[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 12;

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadSkills() {
      setLoading(true);
      loadingRef.current = true;

      try {
        const { items, total } = await fetchSkills(
          view,
          appliedSearch,
          appliedTags,
          page,
          PAGE_SIZE
        );

        if (!active) return;

        setSkills((prev) => (page === 1 ? items : [...prev, ...items]));
        setTotal(total);
      } catch (err) {
        if (active) {
          onError({
            title: "failed to load skills",
            message: (err as Error).message,
            fatal: false,
          });
        }
      } finally {
        if (active) {
          setLoading(false);
          loadingRef.current = false;
        }
      }
    }

    loadSkills();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, reloadKey, appliedSearch, appliedTags, page]);

  // reset skills when view, search, tags, or reloadKey changes
  useEffect(() => {
    setSkills([]);
    setPage(1);
    setTotal(0);
  }, [view, appliedSearch, appliedTags, reloadKey]);

  // infinite scroll observer
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    const root = scrollContainerRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !loadingRef.current &&
          total > 0 &&
          skills.length < total
        ) {
          setPage((p) => p + 1);
        }
      },
      {
        root,
        rootMargin: "200px",
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [skills.length, total]);

  return (
    <>
      {page === 1 && loading && (
        <p className="text-xs text-zinc-500 justify-center flex mt-6">
          loading skills…
        </p>
      )}

      {!loading && skills.length === 0 && (
        <p className="text-xs text-zinc-500 justify-center flex mt-6">
          {view === "private" ? "no local entries" : "no public entries"}
        </p>
      )}

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar"
      >
        {/* Grid Card */}
        {layout === "card" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mx-3">
            {skills.map((skill) => (
              <div key={skill.id} className="h-44 flex flex-col">
                <SkillCard skill={skill} username={username} />
              </div>
            ))}
          </div>
        )}

        {/* Grid Row */}
        {layout === "row" && !isNarrow && (
          <div className="flex flex-col gap-2 mx-3">
            {skills.map((skill) => (
              <SkillRow key={skill.id} skill={skill} username={username} />
            ))}
          </div>
        )}

        {/* Ref block to detect scroll beyond */}
        <div
          ref={loadMoreRef}
          className="h-10 flex items-center justify-center text-xs text-zinc-500"
        >
          {loading && page > 1 && "loading more…"}
        </div>
      </div>
    </>
  );
}
