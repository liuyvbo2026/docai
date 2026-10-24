import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { saveAs } from "file-saver";
import Workspace from "@/models/workspace";
import showToast from "@/utils/toast";
import moment from "moment";
const FORMATS = [
  { key: "pdf", label: "PDF", ext: "pdf" },
  { key: "plaintext", label: "TXT", ext: "txt" },
  { key: "markdown", label: "Markdown", ext: "md" },
  { key: "html", label: "HTML", ext: "html" },
  { key: "json", label: "JSON", ext: "json" },
];
export default function ExportRow({
  history = [],
  workspace = null,
  threadSlug = null,
  onClose,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false),
    [exporting, setExporting] = useState(false);
  const lock = useRef(false);
  async function exportChat(format) {
    if (lock.current || !workspace?.slug) return;
    lock.current = true;
    setExporting(true);
    try {
      const blob = await Workspace.exportChatsToType(
        workspace.slug,
        threadSlug,
        format.key
      );
      if (!blob) throw new Error();
      saveAs(
        blob,
        `DocAI-${moment().format("YYYY-MM-DD-HH-mm-ss")}.${format.ext}`
      );
      onClose();
    } catch {
      showToast(t("journey.exportFailed"), "error");
    } finally {
      lock.current = false;
      setExporting(false);
    }
  }
  if (!history.length) return null;
  return (
    <div>
      <button
        type="button"
        className="design-chat-menu-row"
        aria-expanded={open}
        disabled={exporting}
        onClick={() => setOpen(!open)}
      >
        {t(exporting ? "chat_window.exporting" : "chat_window.export")}
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="design-export-options">
          <p>{t("journey.exportHint")}</p>
          {FORMATS.map((format) => (
            <button
              type="button"
              key={format.key}
              disabled={exporting}
              onClick={() => exportChat(format)}
            >
              {format.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
