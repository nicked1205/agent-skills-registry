import { useEffect, useState } from "react";
import type { ErrorT, SkillCardT } from "../../types";
import { fetchSkills } from "../../api/skills";
import SkillCard from "../dashboard/SkillCard";

interface Props {
  username: string | null;
  view: "private" | "public";
  reloadKey: number;
  appliedSearch: string;
  appliedTags: string[];
  onError: (err: ErrorT) => void;
}

export default function SkillGrid({
  username,
  view,
  reloadKey,
  appliedSearch,
  appliedTags,
  onError,
}: Props) {
  const [skills, setSkills] = useState<SkillCardT[]>([]); // skills list
  const [loading, setLoading] = useState(false); // loading state

  useEffect(() => {
    let active = true;

    async function loadSkills() {
      setLoading(true);

      try {
        const data = await fetchSkills(view, appliedSearch, appliedTags);

        if (active) setSkills(data);
      } catch (err) {
        if (active) {
          onError({
            title: "failed to load skills",
            message: (err as Error).message,
            fatal: false,
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSkills();
    return () => {
      active = false;
    };
  }, [view, reloadKey, appliedSearch, appliedTags, onError]);

  return (
    <>
      {loading && (
        <p className="text-xs text-zinc-500 ml-2 mt-4">loading skills…</p>
      )}
      {!loading && skills.length === 0 && (
        <p className="text-xs text-zinc-500 ml-2 mt-4">
          {view === "private" ? "no local entries" : "no public entries"}
        </p>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 m-3">
          {skills
            .filter(
              (skill) => skill.ownerUsername !== username || view === "private" // only show own skills in private view
            )
            .map((skill) => (
              <SkillCard key={skill.id} skill={skill} username={username} />
            ))}
        </div>
      </div>
    </>
  );
}
