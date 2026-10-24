import { useTranslation } from "react-i18next";
import Workspace from "@/models/workspace";
import paths from "@/utils/paths";
import { DotsThree, PencilSimple, Trash } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Modal, {
  ModalHeader,
  ModalInput,
  ModalFooter,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalDangerButton,
} from "@/components/lib/Modal";

export default function ThreadItem({
  workspace,
  thread,
  isActive,
  onRemove,
  onRename,
  selecting,
  selected,
  onSelect,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { threadSlug } = useParams();
  const displayName =
    thread.name === "Thread" ? t("design.defaultThread") : thread.name;
  const [menu, setMenu] = useState(false);
  const [action, setAction] = useState(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  useEffect(() => {
    if (!menu) return;
    const outside = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenu(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setMenu(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [menu]);
  const close = () => {
    if (!busy) {
      setAction(null);
      triggerRef.current?.focus();
    }
  };
  function open(next) {
    setMenu(false);
    setError("");
    setName(thread.name === "Thread" ? "" : thread.name);
    setAction(next);
  }
  async function submit(event) {
    event.preventDefault();
    if (busy || (action === "rename" && !name.trim())) return;
    setBusy(true);
    setError("");
    try {
      if (action === "rename") {
        const result = await Workspace.threads.update(
          workspace.slug,
          thread.slug,
          { name: name.trim() }
        );
        if (result.message || !result.thread) throw new Error();
        onRename(name.trim());
      } else {
        if (!(await Workspace.threads.delete(workspace.slug, thread.slug)))
          throw new Error();
        onRemove(thread.id);
        if (threadSlug === thread.slug) navigate(paths.home());
      }
      setAction(null);
      triggerRef.current?.focus();
    } catch {
      setError(
        t(
          action === "rename"
            ? "simple.renameFailed"
            : "simple.deleteChatFailed"
        )
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      role="listitem"
      className={`design-thread-row ${isActive ? "design-thread-active" : ""}`}
    >
      {selecting && thread.slug ? (
        <label className="design-thread-select">
          <input
            type="checkbox"
            aria-label={displayName}
            checked={selected}
            onChange={onSelect}
          />
          <span title={displayName}>{displayName}</span>
        </label>
      ) : (
        <Link
          to={
            thread.slug
              ? paths.workspace.thread(workspace.slug, thread.slug)
              : paths.workspace.chat(workspace.slug)
          }
          aria-current={isActive ? "page" : undefined}
          title={displayName}
        >
          {displayName}
        </Link>
      )}
      {!!thread.slug && !selecting && (
        <div ref={menuRef} className="design-thread-menu-wrap">
          <button
            ref={triggerRef}
            type="button"
            className="design-thread-options"
            aria-label={t("interaction.chatActions", { name: displayName })}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <DotsThree size={22} />
          </button>
          {menu && (
            <div className="design-thread-menu">
              <button type="button" onClick={() => open("rename")}>
                <PencilSimple size={16} />
                {t("simple.renameChat")}
              </button>
              <button type="button" onClick={() => open("delete")}>
                <Trash size={16} />
                {t("simple.deleteChat")}
              </button>
            </div>
          )}
        </div>
      )}
      <Modal
        trapFocus
        isOpen={!!action}
        onClose={close}
        size="sm"
        ariaLabel={t(
          action === "rename" ? "simple.renameChat" : "simple.deleteChat"
        )}
      >
        <form onSubmit={submit} className="flex flex-col gap-5">
          <ModalHeader
            title={t(
              action === "rename" ? "simple.renameChat" : "simple.deleteChat"
            )}
            onClose={busy ? undefined : close}
          />
          {action === "rename" ? (
            <ModalInput
              id={`thread-name-${thread.id}`}
              label={t("simple.renamePrompt")}
              autoFocus
              required
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
            />
          ) : (
            <p className="text-sm text-theme-text-secondary break-words">
              {t("interaction.deleteNamedChat", { name: displayName })}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          )}
          <ModalFooter>
            <ModalSecondaryButton
              type="button"
              autoFocus={action === "delete"}
              disabled={busy}
              onClick={close}
            >
              {t("design.cancel")}
            </ModalSecondaryButton>
            {action === "rename" ? (
              <ModalPrimaryButton type="submit" disabled={busy || !name.trim()}>
                {t(busy ? "simple.saving" : "interaction.saveName")}
              </ModalPrimaryButton>
            ) : (
              <ModalDangerButton type="submit" disabled={busy}>
                {t(busy ? "interaction.deleting" : "simple.deleteChat")}
              </ModalDangerButton>
            )}
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
