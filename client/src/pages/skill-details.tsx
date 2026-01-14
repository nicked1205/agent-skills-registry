import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchSkillById } from "../api/skills";
import type { ErrorT, SkillDetailsT, SkillVersionT } from "../types";
import { fetchMe } from "../api/auth";
import type { TagT } from "../types";
import SkillDetailsHeader from "../components/skill-details/SkillDetailsHeader";
import MarkdownViewer from "../components/skill-details/MarkdownViewer";
import SkillTags from "../components/skill-details/SkillTags";
import SkillDiffViewer from "../components/skill-details/SkillDiffViewer";
import SkillMetadata from "../components/skill-details/SkillMetadata";
import DeleteConfirmationModal from "../components/skill-details/DeleteConfirmationModal";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import ErrorModal from "../components/ui/ErrorModal";

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
  const [username, setUsername] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tags, setTags] = useState<TagT[]>([]);
  const [versions, setVersions] = useState<SkillVersionT[]>([]);
  const [systemError, setSystemError] = useState<ErrorT | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const location = useLocation();
  const fromDashboardState =
    (location.state as { from?: string })?.from ?? "?view=private"; // go back to the dashboard it comes from, else fall back to private view

  // params for diffchecker mode\
  const params = new URLSearchParams(location.search);
  const fromParam = params.get("from");
  const toParam = params.get("to");
  const rollbackParam = params.get("allowRollback");
  const from = fromParam ? Number(fromParam) : null;
  const to = toParam ? Number(toParam) : null;
  const isRollback = rollbackParam === "true";
  const isDiffMode = from !== null && to !== null;

  const isOwner = username === skill?.ownerUsername;

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

  // fetch skill details
  useEffect(() => {
    if (!id) return;

    async function loadSkillDetails() {
      setLoading(true);

      try {
        const data = await fetchSkillById(Number(id));
        setSkill(data);
        setTags(data.tags);
      } catch (err) {
        setSystemError({
          title: "failed to load skill details",
          message: (err as Error).message,
          fatal: true,
        });
      } finally {
        setLoading(false);
      }
    }

    loadSkillDetails();
  }, [id, reloadKey]);

  if (loading) {
    return <LoadingOverlay />;
  }

  if (systemError?.fatal) {
    return (
      <ErrorModal
        error={systemError}
        onExit={() => navigate(`/dashboard${fromDashboardState}`)}
        onClose={() => setSystemError(null)}
      />
    );
  }

  // at this point, skill must exist because fatal errors are handled above
  if (!skill) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden bg-zinc-950">
      {/* Topbar */}
      <SkillDetailsHeader
        skill={skill}
        versions={versions}
        isOwner={isOwner}
        setSkill={setSkill}
        setShowDeleteConfirm={setShowDeleteConfirm}
        setVersions={setVersions}
        fromDashboardState={fromDashboardState}
        onError={(err) => setSystemError(err)}
      />

      <div className="flex flex-col md:flex-row gap-4 p-3 sm:p-4 h-[calc(100vh-48px)]">
        {/* Metadata */}
        <div className="md:h-full md:w-3/10 min-h-0 border border-zinc-800 bg-zinc-950">
          <div className="h-full min-h-0 overflow-y-auto custom-scrollbar">
            <SkillMetadata skill={skill} />
          </div>
        </div>

        <div className="md:h-full flex flex-col flex-1 min-h-0 min-w-0 border border-zinc-800 bg-zinc-950">
          {/* Viewers */}
          <div className="flex-1 min-h-0">
            {isDiffMode ? (
              <SkillDiffViewer
                skillId={skill.id}
                from={from}
                to={to}
                onError={(err) => setSystemError(err)}
                versions={versions}
                isRollback={isRollback}
                reloadKey={reloadKey}
                setReloadKey={setReloadKey}
              />
            ) : (
              <MarkdownViewer
                skill={skill}
                onError={(err) => setSystemError(err)}
                onDownload={() => setReloadKey(reloadKey + 1)}
              />
            )}
          </div>

          {/* Tags */}
          <div className="relative px-3 py-2 border border-t-zinc-800">
            <SkillTags
              tags={tags}
              setTags={setTags}
              isOwner={isOwner}
              skill={skill}
              onError={(err) => setSystemError(err)}
            />
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          skill={skill}
          deleting={deleting}
          setDeleting={setDeleting}
          setShowDeleteConfirm={setShowDeleteConfirm}
          fromDashboardState={fromDashboardState}
          onError={(err) => setSystemError(err)}
        />
      )}

      {systemError && !systemError.fatal && (
        <ErrorModal
          error={systemError}
          onClose={() => setSystemError(null)}
          onExit={() => navigate(`/dashboard${fromDashboardState}`)}
        />
      )}
    </div>
  );
}
