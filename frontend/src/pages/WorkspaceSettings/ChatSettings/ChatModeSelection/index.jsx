import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAutosaveForm, SavedIndicator } from "@/components/AutosaveForm";
export default function ChatModeSelection({ workspace }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(workspace?.chatMode || "chat");
  const { markDirty, save } = useAutosaveForm();
  return (
    <fieldset className="design-answer-modes">
      <legend>
        {t("management.chatTitle")}
        <SavedIndicator name="chatMode" />
      </legend>
      <input type="hidden" name="chatMode" value={mode} />
      {["chat", "query", "automatic"].map((value) => (
        <label key={value} className={mode === value ? "is-selected" : ""}>
          <input
            type="radio"
            name="answer-mode-choice"
            value={value}
            checked={mode === value}
            onChange={() => {
              setMode(value);
              markDirty("chatMode");
              save();
            }}
          />
          <span>
            <strong>{t(`management.${value}`)}</strong>
            <small>{t(`management.${value}Hint`)}</small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
