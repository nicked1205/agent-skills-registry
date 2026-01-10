import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchSkillById, deleteSkill } from "../api/skills";
import type { SkillDetailsT } from "../types";
import { fetchMe } from "../api/auth";
import type { TagT } from "../types";
import SkillDetailsHeader from "../components/skill-details/SkillDetailsHeader";
import MarkdownViewer from "../components/skill-details/MarkdownViewer";
import SkillTags from "../components/skill-details/SkillTags";

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
  const [username, setUsername] = useState<{ username: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tags, setTags] = useState<TagT[]>([]);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromDashboardState =
    (location.state as { from?: string })?.from ?? "?view=private"; // go back to the dashboard it comes from, else fall back to private view

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

  async function handleDeleteSkill() {
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

  // loading state
  if (loading) {
    return <div className="p-6 text-sm text-zinc-500">Loading skill…</div>;
  }

  // error state
  if (error || !skill) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6">
        <button
          onClick={() => navigate(`/dashboard${fromDashboardState}`)}
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
        onClick={() => navigate(`/dashboard${fromDashboardState}`)}
        className="mb-4 text-sm text-orange-500 hover:underline hover:cursor-pointer"
      >
        ← Back to dashboard
      </button>
      <div className="mx-auto max-w-4xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <SkillDetailsHeader
          skill={skill}
          isOwner={isOwner}
          setSkill={setSkill}
          setShowDeleteConfirm={setShowDeleteConfirm}
        />

        <MarkdownViewer skill={skill} />

        <SkillTags
          skill={skill}
          isOwner={isOwner}
          tags={tags}
          setTags={setTags}
        />
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
                onClick={handleDeleteSkill}
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
