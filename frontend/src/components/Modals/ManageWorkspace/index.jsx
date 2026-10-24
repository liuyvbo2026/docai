import { useState, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import Workspace from "@/models/workspace";
import System from "@/models/system";
import useUser from "@/hooks/useUser";
import DocumentSettings from "./Documents";
import DataConnectors from "./DataConnectors";
import Modal, { ModalHeader } from "@/components/lib/Modal";
import { EmbeddingProgressProvider } from "@/EmbeddingProgressContext";
import showToast from "@/utils/toast";
const ManageWorkspace = ({ hideModal, providedSlug = null }) => {
  const { t } = useTranslation(),
    { slug } = useParams();
  const [workspace, setWorkspace] = useState(null),
    [settings, setSettings] = useState({}),
    [tab, setTab] = useState("library"),
    [busy, setBusy] = useState(false),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([Workspace.bySlug(providedSlug ?? slug), System.keys()]).then(
      ([ws, config]) => {
        if (!active) return;
        setWorkspace(ws);
        if (ws && !ws.documents?.length) setTab("add");
        setSettings(config || {});
        setFailed(!ws);
      }
    );
    return () => {
      active = false;
    };
  }, [providedSlug, slug]);
  const close = () => {
    if (busy) {
      showToast(t("management.finishProcessing"), "info");
      return;
    }
    hideModal();
  };
  return (
    <Modal
      isOpen
      trapFocus
      onClose={close}
      ariaLabel={t("design.manageFiles")}
      size="xl"
      className="design-document-manager"
    >
      <ModalHeader
        title={
          workspace
            ? `${t("design.manageFiles")} · ${workspace.name}`
            : t("design.manageFiles")
        }
        subtitle={t("management.filesHint")}
        onClose={close}
      />
      {!workspace ? (
        <p role="status">
          {t(failed ? "management.notFound" : "management.working")}
        </p>
      ) : (
        <>
          <nav
            className="design-segmented"
            aria-label={t("design.manageFiles")}
          >
            {["library", "add", "import"].map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={tab === value}
                onClick={() => setTab(value)}
              >
                {t(
                  `management.${value === "library" ? "libraryFiles" : value === "add" ? "addFiles" : "importFiles"}`
                )}
              </button>
            ))}
          </nav>
          <EmbeddingProgressProvider>
            <DocumentSettings
              workspace={workspace}
              view={tab}
              setView={setTab}
              onBusyChange={setBusy}
            />
          </EmbeddingProgressProvider>
          {tab === "import" && (
            <DataConnectors workspace={workspace} systemSettings={settings} />
          )}
        </>
      )}
    </Modal>
  );
};
export default memo(ManageWorkspace);
export function useManageWorkspaceModal() {
  const { user } = useUser();
  const [showing, setShowing] = useState(false);
  return {
    showing,
    showModal: () => {
      if (user?.role !== "default") setShowing(true);
    },
    hideModal: () => setShowing(false),
  };
}
