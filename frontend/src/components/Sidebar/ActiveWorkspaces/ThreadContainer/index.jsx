import { useTranslation } from "react-i18next";
import Workspace from "@/models/workspace";
import paths from "@/utils/paths";
import showToast from "@/utils/toast";
import { useEffect, useState } from "react";
import ThreadItem from "./ThreadItem";
import { useNavigate, useParams } from "react-router-dom";
import Modal, {
  ModalHeader,
  ModalFooter,
  ModalSecondaryButton,
  ModalDangerButton,
} from "@/components/lib/Modal";
export const THREAD_RENAME_EVENT = "renameThread";
export const THREAD_FORK_EVENT = "forkToThread";

export default function ThreadContainer({
  workspace,
  isVirtualThread = false,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { threadSlug = null } = useParams();
  const [threads, setThreads] = useState([]);
  const [defaultThreadHasChats, setDefaultThreadHasChats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const rename = ({ detail }) =>
      setThreads((prev) =>
        prev.map((thread) =>
          thread.slug === detail.threadSlug
            ? { ...thread, name: detail.newName }
            : thread
        )
      );
    window.addEventListener(THREAD_RENAME_EVENT, rename);
    return () => window.removeEventListener(THREAD_RENAME_EVENT, rename);
  }, []);

  useEffect(() => {
    let active = true;
    async function refresh() {
      const result = await Workspace.threads.all(workspace.slug);
      if (!active) return;
      setThreads(result.threads || []);
      setDefaultThreadHasChats(result.defaultThreadChatCount > 0);
      setLoading(false);
    }
    setLoading(true);
    setSelecting(false);
    setSelected([]);
    refresh();
    window.addEventListener(THREAD_FORK_EVENT, refresh);
    return () => {
      active = false;
      window.removeEventListener(THREAD_FORK_EVENT, refresh);
    };
  }, [workspace.slug, threadSlug]);

  function toggle(slug) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }
  async function deleteSelected() {
    if (deleting || !selected.length) return;
    setDeleting(true);
    setError("");
    const success = await Workspace.threads.deleteBulk(
      workspace.slug,
      selected
    );
    setDeleting(false);
    if (!success) {
      setError(t("simple.deleteChatFailed"));
      return;
    }
    setThreads((prev) =>
      prev.filter((thread) => !selected.includes(thread.slug))
    );
    setConfirming(false);
    setSelecting(false);
    setSelected([]);
    showToast(t("simple.deleteChatDone"), "success");
    if (selected.includes(threadSlug)) navigate(paths.home());
  }
  const close = () => {
    if (!deleting) setConfirming(false);
  };
  if (loading)
    return (
      <p className="design-thread-status">{t("interaction.loadingChats")}</p>
    );

  return (
    <div className="design-thread-list">
      <div role="list" aria-label={t("interaction.chatHistory")}>
        {defaultThreadHasChats && (
          <ThreadItem
            workspace={workspace}
            thread={{ slug: null, name: t("interaction.earlierChats") }}
            isActive={!isVirtualThread && !threadSlug}
          />
        )}
        {threads.map((thread) => (
          <ThreadItem
            key={thread.slug}
            workspace={workspace}
            thread={thread}
            isActive={!isVirtualThread && thread.slug === threadSlug}
            selecting={selecting}
            selected={selected.includes(thread.slug)}
            onSelect={() => toggle(thread.slug)}
            onRemove={(id) =>
              setThreads((prev) => prev.filter((item) => item.id !== id))
            }
            onRename={(name) =>
              setThreads((prev) =>
                prev.map((item) =>
                  item.id === thread.id ? { ...item, name } : item
                )
              )
            }
          />
        ))}
      </div>
      {!!threads.length && (
        <div className="design-thread-management">
          <button
            type="button"
            onClick={() => {
              setSelecting(!selecting);
              setSelected([]);
            }}
          >
            {t(selecting ? "design.cancel" : "interaction.manageChats")}
          </button>
          {selecting && (
            <button
              type="button"
              disabled={!selected.length}
              onClick={() => {
                setError("");
                setConfirming(true);
              }}
            >
              {t("interaction.deleteSelected", { count: selected.length })}
            </button>
          )}
        </div>
      )}
      <Modal
        trapFocus
        isOpen={confirming}
        onClose={close}
        ariaLabel={t("simple.deleteChat")}
        size="sm"
      >
        <ModalHeader
          title={t("interaction.deleteSelected", { count: selected.length })}
          onClose={deleting ? undefined : close}
        />
        <p className="text-sm text-theme-text-secondary">
          {t("interaction.bulkDeleteHint", { count: selected.length })}
        </p>
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        <ModalFooter>
          <ModalSecondaryButton autoFocus disabled={deleting} onClick={close}>
            {t("design.cancel")}
          </ModalSecondaryButton>
          <ModalDangerButton disabled={deleting} onClick={deleteSelected}>
            {t(deleting ? "interaction.deleting" : "simple.deleteChat")}
          </ModalDangerButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}
