import { useTranslation } from "react-i18next";
import System from "@/models/system";
import Workspace from "@/models/workspace";
import showToast from "@/utils/toast";
import { castToType } from "@/utils/types";
import { useEffect, useState } from "react";
import AutosaveForm from "@/components/AutosaveForm";
import ChatHistorySettings from "./ChatHistorySettings";
import ChatPromptSettings from "./ChatPromptSettings";
import ChatTemperatureSettings from "./ChatTemperatureSettings";
import ChatModeSelection from "./ChatModeSelection";
import WorkspaceLLMSelection from "./WorkspaceLLMSelection";
import ChatQueryRefusalResponse from "./ChatQueryRefusalResponse";

export default function ChatSettings({ workspace }) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    async function fetchSettings() {
      const _settings = await System.keys();
      setSettings(_settings ?? {});
    }
    fetchSettings();
  }, []);

  const handleUpdate = async (formEl) => {
    const data = {};
    const form = new FormData(formEl);
    for (var [key, value] of form.entries())
      if (key !== "answer-mode-choice") data[key] = castToType(key, value);

    const { workspace: updatedWorkspace, message } = await Workspace.update(
      workspace.slug,
      data
    );
    if (!updatedWorkspace) {
      showToast(`Error: ${message}`, "error", { clear: true });
      // Returning false keeps the fields dirty so the next save retries them.
      return false;
    }
    return true;
  };

  if (!workspace || !settings) return null;
  return (
    <div id="workspace-chat-settings-container" className="relative">
      <AutosaveForm
        onSave={handleUpdate}
        id="chat-settings-form"
        className="w-1/2 flex flex-col gap-y-[32px]"
      >
        <ChatModeSelection workspace={workspace} />
        <details className="design-settings-disclosure">
          <summary>{t("management.answerRules")}</summary>
          <p>{t("management.answerRulesHint")}</p>
          <ChatPromptSettings workspace={workspace} />
          <ChatQueryRefusalResponse workspace={workspace} />
        </details>
        <details className="design-settings-disclosure">
          <summary>{t("management.modelMemory")}</summary>
          <p>{t("management.advancedHint")}</p>
          <WorkspaceLLMSelection settings={settings} workspace={workspace} />
          <ChatHistorySettings workspace={workspace} />
          <ChatTemperatureSettings workspace={workspace} />
        </details>
      </AutosaveForm>
    </div>
  );
}
