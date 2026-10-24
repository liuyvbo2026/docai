import { Warning } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

export default function ContextualSaveBar({
  showing = false,
  onSave,
  onCancel,
  saving = false,
}) {
  const { t } = useTranslation();
  if (!showing) return null;
  return (
    <div className="design-contextual-save fixed bottom-0 left-0 right-0 flex items-center justify-between gap-3 px-4 py-3 z-[999] bg-theme-bg-secondary border-t border-theme-sidebar-border">
      <p
        role="status"
        className="flex items-center gap-2 text-theme-text-primary text-xs"
      >
        <Warning size={18} className="shrink-0" />
        {t(saving ? "management.saving" : "management.unsaved")}
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={saving}
          className="design-button-secondary"
          onClick={onCancel}
        >
          {t("journey.discardChanges")}
        </button>
        <button
          type="button"
          disabled={saving}
          className="design-button-primary"
          onClick={onSave}
        >
          {t(saving ? "management.saving" : "management.confirmSave")}
        </button>
      </div>
    </div>
  );
}
