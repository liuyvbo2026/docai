import { useState, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, CircleNotch, XCircle } from "@phosphor-icons/react";
import Workspace from "@/models/workspace";
import { humanFileSize } from "@/utils/numbers";
function FileUploadProgress({
  slug,
  uuid,
  file,
  setFiles,
  rejected = false,
  folderName = null,
  relativePath = null,
  onSettled,
}) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(rejected ? "failed" : "pending");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (rejected || !file) return;
    let active = true,
      timer;
    setStatus("pending");
    setFiles((files) =>
      files.map((entry) =>
        entry.uid === uuid ? { ...entry, settled: false } : entry
      )
    );
    async function upload() {
      const data = new FormData();
      if (folderName && relativePath) {
        data.append("folderName", folderName);
        data.append(
          "metadata",
          JSON.stringify({ title: relativePath, docSource: relativePath })
        );
        data.append("file", file, relativePath.replace(/\//g, "_"));
      } else data.append("file", file, file.name);
      try {
        const { response } = await Workspace.uploadFile(slug, data);
        if (!response?.ok) throw new Error();
        if (!active) return;
        setStatus("complete");
        onSettled?.();
        timer = setTimeout(
          () =>
            setFiles((files) => files.filter((entry) => entry.uid !== uuid)),
          5000
        );
      } catch {
        if (active) setStatus("failed");
      } finally {
        if (active)
          setFiles((files) =>
            files.map((entry) =>
              entry.uid === uuid ? { ...entry, settled: true } : entry
            )
          );
      }
    }
    upload();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [attempt]);
  const failed = status === "failed";
  function dismiss(e) {
    e.stopPropagation();
    setFiles((files) => files.filter((entry) => entry.uid !== uuid));
  }
  return (
    <div
      className={`design-upload-result ${failed ? "is-failed" : ""}`}
      role="status"
    >
      {failed ? (
        <XCircle size={22} />
      ) : status === "complete" ? (
        <CheckCircle size={22} />
      ) : (
        <CircleNotch size={22} className="animate-spin" />
      )}
      <div>
        <strong title={relativePath || file.name}>
          {relativePath || file.name}
        </strong>
        <span>
          {t(
            rejected
              ? "journey.unsupportedFile"
              : failed
                ? "journey.uploadFailed"
                : status === "complete"
                  ? "journey.uploadDone"
                  : "simple.uploading"
          )}
        </span>
        <small>{humanFileSize(file.size)}</small>
        {failed && (
          <div className="design-upload-actions">
            {!rejected && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAttempt((n) => n + 1);
                }}
              >
                {t("journey.retryUpload")}
              </button>
            )}
            <button type="button" onClick={dismiss}>
              {t("journey.dismiss")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default memo(FileUploadProgress);
