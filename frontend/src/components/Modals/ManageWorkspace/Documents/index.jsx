import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Workspace from "@/models/workspace";
import showToast from "@/utils/toast";
import Directory from "./Directory";
import WorkspaceDirectory from "./WorkspaceDirectory";
import useDocumentPicker from "./hooks/useDocumentPicker";
import { useWorkspaceEmbeddingProgress } from "@/EmbeddingProgressContext";
export default function DocumentSettings({
  workspace,
  view,
  setView,
  onBusyChange,
}) {
  const { t } = useTranslation(),
    picker = useDocumentPicker(workspace);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  useEffect(
    () => onBusyChange(busy || uploading),
    [busy, uploading, onBusyChange]
  );
  const adding = useRef(false);
  const { refresh, resolveSelection, clearSelection, workspaceDocs } = picker;
  const { embeddingProgress, startEmbedding, clearEmbedding } =
    useWorkspaceEmbeddingProgress(workspace.slug, {
      onProgressCleared: refresh,
    });
  const hiddenPaths = useMemo(
    () => new Set(Object.keys(embeddingProgress ?? {})),
    [embeddingProgress]
  );
  async function addSelected() {
    if (adding.current) return;
    adding.current = true;
    setBusy(true);

    setError("");
    setMessage(t("management.adding"));
    try {
      const items = await resolveSelection();
      if (!items.length) return;
      const paths = items.map((item) => `${item.folderName}/${item.name}`);
      const request = Workspace.modifyEmbeddings(workspace.slug, {
        adds: paths,
      });
      startEmbedding(workspace.slug, paths);
      setView("library");
      const result = await request;
      if (!result.workspace || result.message) throw new Error();
      clearSelection();
      await refresh(true);
      showToast(t("management.added"), "success");
    } catch {
      clearEmbedding(workspace.slug);
      setError(t("management.addFailed"));
      await refresh(true);
    } finally {
      adding.current = false;
      setBusy(false);

      setMessage("");
    }
  }
  return (
    <div className="design-documents">
      {error && (
        <div className="design-inline-error" role="alert">
          {error}
          <button type="button" onClick={() => setView("add")}>
            {t("management.addFiles")}
          </button>
        </div>
      )}
      <section hidden={view !== "add"}>
        <p className="design-section-hint">{t("management.addHint")}</p>
        <Directory
          picker={picker}
          workspace={workspace}
          hiddenPaths={hiddenPaths}
          setHighlightWorkspace={() => {}}
          moveToWorkspace={addSelected}
          adding={busy || uploading}
          onUploadBusyChange={setUploading}
        />
      </section>
      <section hidden={view !== "library"}>
        <WorkspaceDirectory
          workspace={workspace}
          files={workspaceDocs}
          highlightWorkspace={false}
          loading={picker.status === "initializing" || busy}
          loadingMessage={message}
          setLoadingMessage={setMessage}
          setLoading={setBusy}
          fetchKeys={refresh}
          hasChanges={false}
          movedItems={[]}
        />
        <button
          type="button"
          className="design-button-primary design-add-documents"
          onClick={() => setView("add")}
        >
          {t("management.addFiles")}
        </button>
      </section>
    </div>
  );
}
