import { useNavigate } from "react-router-dom";
import type { SkillDetailsT } from "../../types/skillDetailsT";
import {
  cloneSkill,
  fetchSkillById,
  fetchSkillVersions,
  updateSkillVisibility,
} from "../../api/skills";
import type { SkillVersionT } from "../../types/SkillVersionT";
import { useEffect, useRef, useState } from "react";

export interface Props {
  skill: SkillDetailsT;
  isOwner: boolean;
  setSkill: React.Dispatch<React.SetStateAction<SkillDetailsT | null>>;
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SkillDetailsHeader({
  skill,
  setSkill,
  isOwner,
  setShowDeleteConfirm,
}: Props) {
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<SkillVersionT[]>([]);

  const versionsRef = useRef<HTMLDivElement | null>(null);

  const isPublicView = !isOwner && skill?.isPublic;
  const isCloned = skill?.isCloned;

  const navigate = useNavigate();

  // fetch versions whenever versions is toggle
  useEffect(() => {
    if (!showVersions || !skill) return;

    fetchSkillVersions(skill.id).then(setVersions).catch(console.error);
  }, [showVersions, skill]);

  // close versions modal when clicking outside
  useEffect(() => {
    function handleClickOutsideVersionsModal(event: MouseEvent) {
      if (
        versionsRef.current &&
        !versionsRef.current.contains(event.target as Node)
      ) {
        setShowVersions(false);
      }
    }

    if (showVersions) {
      document.addEventListener("mousedown", handleClickOutsideVersionsModal);
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutsideVersionsModal
      );
    };
  }, [showVersions]);

  // handle visibility toggle
  async function handleToggleVisibility() {
    if (!skill) return;

    const next = !skill.isPublic;
    setUpdatingVisibility(true);
    try {
      await updateSkillVisibility(skill.id, next);
    } catch {
      alert("Failed to update visibility");
    } finally {
      // refresh skill details (mainly for last updated time)
      const fresh = await fetchSkillById(skill.id);
      setSkill(fresh);
      setUpdatingVisibility(false);
    }
  }

  async function handleCloneSkill() {
    if (!skill) return;

    try {
      await cloneSkill(skill.id);
      navigate("/dashboard?view=private");
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-2">
        <div className="flex justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 max-w-[60%] line-clamp-1">
            {skill.name}
          </h1>
          <div className="flex items-center gap-4">
            {/* Public Skill */}
            {isPublicView && (
              <button
                onClick={handleCloneSkill}
                className="text-xs text-orange-500 hover:underline hover:cursor-pointer"
              >
                Clone
              </button>
            )}

            {/* Private Skill */}
            {isOwner && (
              <>
                {/* Visibility toggle (only if not cloned) */}
                {!isCloned && (
                  <button
                    onClick={handleToggleVisibility}
                    disabled={updatingVisibility}
                    className="text-xs rounded-md text-orange-500 hover:underline disabled:opacity-50"
                  >
                    {skill.isPublic ? "Make Private" : "Make Public"}
                  </button>
                )}

                {/* Edit */}
                <button
                  onClick={() => navigate(`/skills/${skill.id}/edit`)}
                  className="text-xs text-orange-500 hover:underline hover:cursor-pointer"
                >
                  Edit
                </button>

                {/* Versions */}
                <div className="relative">
                  <button
                    onClick={() => setShowVersions(!showVersions)}
                    disabled={showVersions}
                    className={`text-xs text-orange-500 ${
                      showVersions ? "" : "hover:underline hover:cursor-pointer"
                    }`}
                  >
                    Versions
                  </button>

                  {showVersions && (
                    <div
                      ref={versionsRef}
                      className="absolute right-1/2 translate-x-1/2 top-4 z-10 mt-2 w-40 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg"
                    >
                      <div className="max-h-40 overflow-y-auto custom-scrollbar py-1 text-sm">
                        {versions.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-zinc-500">
                            No versions found
                          </div>
                        ) : (
                          versions.map((v) => (
                            <div
                              key={v.versionNumber}
                              className="flex justify-between px-3 py-2 text-zinc-700 dark:text-zinc-300"
                            >
                              <span>
                                v{v.versionNumber}
                                {v.versionNumber === skill.latestVersion && (
                                  <span className="ml-2 text-xs text-orange-500">
                                    Latest
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-zinc-500">
                                {new Date(v.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-red-500 hover:underline hover:cursor-pointer"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Skill Info */}
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
          <span>
            {skill.isCloned ? (
              <>
                Cloned from{" "}
                <span className="font-medium inline-block max-w-[15vw] truncate align-middle">
                  {skill.clonedFromUsername}
                </span>
              </>
            ) : (
              <>
                Posted by{" "}
                <span className="font-medium inline-block max-w-[15vw] truncate align-middle">
                  {skill.ownerUsername}
                </span>
              </>
            )}
          </span>
          <span>•</span>
          <span>v{skill.latestVersion}</span>
          <span>•</span>
          <span>{skill.isPublic ? "Public" : "Private"}</span>
          <span>•</span>
          <span>
            Last updated{" "}
            {new Date(skill.updatedAt).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </span>
        </div>
      </div>

      {/* Description */}
      {skill.description && (
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 max-h-[8vh] overflow-auto custom-scrollbar">
          {skill.description}
        </p>
      )}
    </>
  );
}
