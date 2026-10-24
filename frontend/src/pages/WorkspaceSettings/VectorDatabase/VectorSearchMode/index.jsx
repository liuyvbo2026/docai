import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SavedIndicator } from "@/components/AutosaveForm";
export default function VectorSearchMode({ workspace }) {
  const { t } = useTranslation(),
    [selection, setSelection] = useState(
      workspace?.vectorSearchMode ?? "default"
    );
  if (workspace?.vectorDB !== "lancedb")
    return <p>{t("management.advancedHint")}</p>;
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="vectorSearchMode" className="input-label">
        {t("management.searchPreference")}
        <SavedIndicator name="vectorSearchMode" />
      </label>
      <p>
        {t(
          selection === "rerank"
            ? "management.accuracyHint"
            : "management.speedHint"
        )}
      </p>
      <select
        id="vectorSearchMode"
        name="vectorSearchMode"
        value={selection}
        onChange={(e) => setSelection(e.target.value)}
        className="bg-theme-settings-input-bg p-3 rounded-lg text-sm"
      >
        <option value="default">{t("management.speed")}</option>
        <option value="rerank">{t("management.accuracy")}</option>
      </select>
    </div>
  );
}
