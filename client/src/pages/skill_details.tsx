import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchSkillById,
  fetchSkillVersions,
  updateSkillVisibility,
  deleteSkill,
  addSkillTag,
  deleteSkillTag,
} from "../api/skills";
import type { SkillDetailsT } from "../types/skill-details";
import { fetchMe } from "../api/auth";
import type { TagT } from "../types/tag";

type SkillDetails = {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  ownerUsername: string;
  latestVersion: number;
  content: string;
  updatedAt: string;
};

export default function SkillDetails() {
  const [skill, setSkill] = useState<SkillDetailsT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState<{ username: string } | null>(null);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<
    { versionNumber: number; createdAt: string }[]
  >([]);
  const [tags, setTags] = useState<TagT[]>([]);
  const [newTag, setNewTag] = useState("");

  const versionsRef = useRef<HTMLDivElement | null>(null);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isOwner = username?.username === skill?.ownerUsername;

  // fetch user info on mount
  useEffect(() => {
    fetchMe().then((data) => setUsername(data));
  }, []);

  // fetch skill details
  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchSkillById(Number(id));
        setSkill(data);
        setTags(data.tags);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

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

  // handle skill deletion
  async function handleDelete() {
    if (!skill) return;

    setDeleting(true);

    try {
      await deleteSkill(skill.id);
      navigate("/dashboard");
    } catch (err) {
      alert((err as Error).message);
      setDeleting(false);
    }
  }

  // handle add tag to skill
  async function handleAddTag() {
    const raw = newTag.trim();
    if (!raw || !skill) return;

    if (!(raw.length <= 20 && /^[a-zA-Z0-9._-]+$/.test(raw))) {
      alert(
        "Tag must be 20 characters or fewer and only contain letters, numbers, '.', '-', or '_'"
      );
      return;
    }

    try {
      const res = await addSkillTag(skill.id, raw);

      if (res) {
        setTags((prev) =>
          prev.some((t) => t.id === res.id) ? prev : [...prev, res]
        );
      }

      setNewTag("");
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function handleDeleteTag(tagId: number) {
    if (!skill) return;

    try {
      await deleteSkillTag(skill.id, tagId);

      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch (err) {
      alert((err as Error).message);
    }
  }

  // loading state
  if (loading) {
    return <div className="p-6 text-sm text-zinc-500">Loading skill…</div>;
  }

  // error state
  if (error || !skill) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-orange-500 hover:underline hover:cursor-pointer"
        >
          ← Back to dashboard
        </button>
        <p className="mb-4 text-sm text-red-500">
          {error ?? "Skill not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6">
      {/* Back */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 text-sm text-orange-500 hover:underline hover:cursor-pointer"
      >
        ← Back to dashboard
      </button>

      <div className="mx-auto max-w-4xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        {/* Header */}
        <div className="mb-2">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 max-w-[60%] line-clamp-1">
              {skill.name}
            </h1>
            {isOwner && (
              <div className="flex items-center gap-4">
                {/* Visibility toggle */}
                <button
                  onClick={handleToggleVisibility}
                  disabled={updatingVisibility}
                  className="text-xs rounded-md text-orange-500 hover:underline disabled:opacity-50 duration-300 hover:cursor-pointer"
                >
                  {skill.isPublic ? "Make Private" : "Make Public"}
                </button>

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
                      showVersions ? "" : "hover:cursor-pointer hover:underline"
                    }`}
                  >
                    Versions
                  </button>

                  {/* Versions modal */}
                  {showVersions && (
                    <div
                      className="absolute right-1/2 translate-x-1/2 top-4 z-10 mt-2 w-40 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg"
                      ref={versionsRef}
                    >
                      <div className="max-h-40 overflow-y-auto custom-scrollbar py-1 text-sm">
                        {versions.length === 0 ? ( // just in case
                          <div className="px-3 py-2 text-zinc-500 text-xs">
                            No versions found
                          </div>
                        ) : (
                          versions.map((v) => (
                            <div
                              key={v.versionNumber}
                              className="flex items-center justify-between px-3 py-2 text-zinc-700 dark:text-zinc-300"
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
              </div>
            )}
          </div>

          {/* Skill Info */}
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
            <span>
              Posted by{" "}
              <span className="font-medium inline-block max-w-[15vw] truncate align-middle">
                {skill.ownerUsername}
              </span>
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

        {/* Markdown viewer */}
        <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between bg-zinc-200 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-3 py-2">
            <span className="text-xs font-mono opacity-80">markdown</span>

            <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(skill.content);
                  setCopied(true);

                  setTimeout(() => {
                    setCopied(false);
                  }, 1500);
                }}
                className={`text-xs flex items-center gap-1 transition ${
                  copied ? "" : "hover:cursor-pointer hover:underline"
                }`}
                disabled={copied}
              >
                {copied ? (
                  <>
                    Copied
                    <span aria-hidden>✓</span>
                  </>
                ) : (
                  "Copy"
                )}
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([skill.content], {
                    type: "text/markdown",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${skill.name}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-xs hover:underline hover:cursor-pointer"
              >
                Download
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-zinc-50 dark:bg-zinc-950 text-orange-500 p-4 max-h-[46vh] overflow-auto custom-scrollbar">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {skill.content || "// No content in this version"}
            </pre>
          </div>
        </div>

        <div className="mt-3">
          {/* Tags header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Tags
            </h2>

            {isOwner && (
              <div className="flex items-center gap-2">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTag();
                  }}
                  placeholder="Add tag"
                  className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent focus:outline-none placeholder:text-zinc-500 caret-zinc-500 text-zinc-500"
                />

                <button
                  onClick={handleAddTag}
                  className="text-xs text-orange-500 hover:underline hover:cursor-pointer"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Tags container */}
          <div className="flex gap-2 h-8 overflow-x-auto overflow-y-hidden pr-1 custom-scrollbar">
            {tags.length === 0 && (
              <span className="text-xs text-zinc-500">No tags</span>
            )}

            {tags.map((tag) => (
              <span
                key={tag.id}
                className="flex h-6 items-center gap-1 px-2 py-0.5 rounded-sm text-xs bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 whitespace-nowrap"
              >
                {tag.name}

                {isOwner && (
                  <div
                    onClick={() => handleDeleteTag(tag.id)}
                    className="text-zinc-500 hover:text-red-500 hover:cursor-pointer transition"
                    title="Remove tag"
                  >
                    ×
                  </div>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-10"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()} // helps with close when click outside modal (doesnt close when clicking inside)
          >
            <h2 className="text-sm font-semibold mb-2 dark:text-zinc-200 text-zinc-800">
              Delete skill?
            </h2>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              This will permanently delete <strong>{skill.name}</strong> and all
              its versions. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-sm dark:text-zinc-400 text-zinc-600 hover:underline hover:cursor-pointer"
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm text-red-500 font-medium hover:underline hover:cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
