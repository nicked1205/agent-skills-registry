import { useNavigate } from "react-router-dom";
import type { ErrorT, SkillDetailsT, SkillVersionT } from "../../types";
import {
  cloneSkill,
  fetchSkillById,
  fetchSkillVersions,
  updateSkillVisibility,
} from "../../api/skills";
import { useEffect } from "react";
import VersionsCustomSelect from "./VersionsCustomSelect";

export interface Props {
  skill: SkillDetailsT;
  isOwner: boolean;
  setSkill: React.Dispatch<React.SetStateAction<SkillDetailsT | null>>;
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  versions: SkillVersionT[];
  setVersions: React.Dispatch<React.SetStateAction<SkillVersionT[]>>;
  fromDashboardState: string;
  onError: (err: ErrorT) => void;
}

export default function SkillDetailsHeader({
  skill,
  setSkill,
  isOwner,
  setShowDeleteConfirm,
  versions,
  setVersions,
  fromDashboardState,
  onError,
}: Props) {
  const isPublicView = !isOwner && skill?.isPublic;
  const isCloned = skill?.isCloned;

  const navigate = useNavigate();

  const layout =
    new URLSearchParams(fromDashboardState).get("layout") || "grid";

  // fetch versions whenever skill changes
  useEffect(() => {
    if (!skill) return;

    let cancelled = false;

    async function loadVersions() {
      try {
        const versions = await fetchSkillVersions(skill.id);
        if (!cancelled) {
          setVersions(versions);
        }
      } catch (err) {
        if (!cancelled) {
          onError({
            title: "failed to load skill versions",
            message: (err as Error).message,
            fatal: false,
          });
        }
      }
    }

    loadVersions();

    return () => {
      cancelled = true;
    };
    // onError is intentionally omitted to avoid effect loops because error handling does not affect version fetching
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill, setVersions]);

  // handle visibility toggle
  async function handleToggleVisibility() {
    if (!skill) return;

    const next = !skill.isPublic;
    try {
      await updateSkillVisibility(skill.id, next);
    } catch (err) {
      onError({
        title: "failed to update visibility",
        message: (err as Error).message,
        fatal: false,
      });
      return;
    } finally {
      // refresh skill details (mainly for last updated time)
      const fresh = await fetchSkillById(skill.id);
      setSkill(fresh);
    }
  }

  async function handleCloneSkill() {
    if (!skill) return;

    try {
      await cloneSkill(skill.id);
      navigate(`/dashboard?view=private&layout=${layout}`);
    } catch (err) {
      onError({
        title: "failed to clone skill",
        message: (err as Error).message,
        fatal: false,
      });
    }
  }

  return (
    <div className="min-h-12 flex flex-row items-center justify-between gap-6 md:gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-950">
      {/* Back */}
      <button
        onClick={() => navigate(`/dashboard${fromDashboardState}`)}
        className="text-lg md:text-xs btn-neutral"
      >
        ← <span className="hidden md:inline-block">dashboard</span>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-4 text-xs text-zinc-400">
        {isPublicView && (
          <button onClick={handleCloneSkill} className="btn-yellow-tool">
            clone
          </button>
        )}
        {isOwner && (
          <>
            {/* Visibility */}
            {!isCloned && (
              <button
                onClick={handleToggleVisibility}
                className="btn-glitch-green-tool whitespace-nowrap"
              >
                {skill?.isPublic ? "set private" : "set public"}
              </button>
            )}

            {skill.latestVersion > 1 && (
              <>
                {/* Versions */}
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-zinc-500">versions</span>
                  <VersionsCustomSelect
                    value={skill.latestVersion}
                    versions={versions}
                    onChange={(v) =>
                      navigate(
                        `/skills/${skill.id}?from=${v}&to=${skill.latestVersion}&allowRollback=false`
                      )
                    }
                  />
                </div>

                {/* Diff */}
                <button
                  onClick={() =>
                    navigate(
                      `/skills/${skill.id}?from=${skill.latestVersion - 1}&to=${
                        skill.latestVersion
                      }&allowRollback=false`
                    )
                  }
                  className="btn-neutral"
                >
                  diff
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/skills/${skill.id}?from=${skill.latestVersion}&to=${
                        skill.latestVersion - 1
                      }&allowRollback=true`
                    )
                  }
                  className="btn-yellow-tool"
                >
                  rollback
                </button>
              </>
            )}

            {/* Edit */}
            <button
              onClick={() => navigate(`/skills/${skill.id}/edit`)}
              className="btn-yellow-tool"
            >
              edit
            </button>

            {/* Delete */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-red-tool"
            >
              delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
