import { useEffect, useState } from "react";
import type { SkillCardT } from "../../types/skill-card";
import { fetchSkills } from "../../api/skills";
import SkillCard from "../dashboard/SkillCard";

interface Props {
  username: string | null;
  view: "private" | "public";
  reloadKey: number;
  appliedSearch: string;
  appliedTags: string[];
}

export default function SkillGrid({
  username,
  view,
  reloadKey,
  appliedSearch,
  appliedTags,
}: Props) {
  const [skills, setSkills] = useState<SkillCardT[]>([]); // skills list
  const [loading, setLoading] = useState(false); // loading state
  const [error, setError] = useState<string | null>(null); // error message

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchSkills(view, appliedSearch, appliedTags);

        if (active) setSkills(data);
      } catch (err) {
        if (active) setError((err as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [view, reloadKey, appliedSearch, appliedTags]);

  return (
    <>
      {loading && (
        <p className="text-xs text-zinc-600 dark:text-zinc-400 duration-300 ml-2 mt-4">
          Loading skills…
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {!loading && !error && skills.length === 0 && (
        <p className="text-xs text-zinc-500 ml-2 mt-4">
          {view === "private"
            ? "You haven’t uploaded any skills yet."
            : "No public skills available."}
        </p>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 m-3">
          {skills
            .filter(
              (skill) => skill.ownerUsername !== username || view === "private" // only show own skills in private view
            )
            .map((skill) => (
              <SkillCard skill={skill} username={username} />
            ))}
        </div>
      </div>
    </>
  );
}
