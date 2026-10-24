import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SettingsSidebar from "@/components/SettingsSidebar";
import SettingsChanges from "@/components/Design/SettingsChanges";
import System from "@/models/system";
import paths from "@/utils/paths";
export default function DefaultSystemPrompt() {
  const { t } = useTranslation();
  const [value, setValue] = useState(""),
    [saved, setSaved] = useState(""),
    [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const dirty = value !== saved;
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    System.fetchDefaultSystemPrompt()
      .then((result) => {
        if (!active) return;
        if (
          typeof result?.defaultSystemPrompt !== "string" ||
          !result?.saneDefaultSystemPrompt
        )
          throw new Error();
        setLoaded(true);
        setValue(result.defaultSystemPrompt);
        setSaved(result.defaultSystemPrompt);
        setOriginal(result.saneDefaultSystemPrompt || "");
      })
      .catch(() => {
        if (active) setError(t("journey.loadFailed"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadAttempt]);
  async function save(e) {
    e.preventDefault();
    if (saving || !dirty) return;
    setSaving(true);
    setError("");
    setDone(false);
    const next = value.trim();
    try {
      const result = await System.updateDefaultSystemPrompt(next);
      if (!result?.success) throw new Error();
      const normalized = next || original;
      setValue(normalized);
      setSaved(normalized);
      setDone(true);
    } catch {
      setError(t("management.saveFailed"));
    } finally {
      setSaving(false);
    }
  }
  return (
    <SettingsChanges dirty={dirty} busy={saving}>
      <div className="design-app design-settings-layout w-screen h-screen overflow-hidden flex">
        <SettingsSidebar />
        <div className="w-full h-full overflow-y-scroll">
          <div className="design-default-rules">
            <h1>{t("journey.defaultRules")}</h1>
            <p>{t("journey.defaultRulesScope")}</p>
            {loading ? (
              <p role="status">{t("management.working")}</p>
            ) : loaded ? (
              <form onSubmit={save}>
                <label htmlFor="default-system-prompt">
                  {t("management.answerRules")}
                </label>
                <p>{t("journey.rulesExample")}</p>
                <textarea
                  id="default-system-prompt"
                  value={value}
                  disabled={saving}
                  rows={9}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setDone(false);
                  }}
                  placeholder={t("journey.rulesPlaceholder")}
                />
                <details className="design-settings-disclosure">
                  <summary>{t("management.promptVars")}</summary>
                  <p>{t("journey.variablesExample")}</p>
                  <Link to={paths.settings.systemPromptVariables()}>
                    {t("journey.manageVariables")}
                  </Link>
                </details>
                <div className="design-rules-actions">
                  <button
                    type="submit"
                    className="design-button-primary"
                    disabled={!dirty || saving}
                  >
                    {t(saving ? "management.saving" : "management.confirmSave")}
                  </button>
                  <button
                    type="button"
                    className="design-button-secondary"
                    disabled={saving || value === original}
                    onClick={() => {
                      setValue(original);
                      setDone(false);
                    }}
                  >
                    {t("management.restoreDefault")}
                  </button>
                  <span role="status">
                    {t(
                      saving
                        ? "management.saving"
                        : dirty
                          ? "management.unsaved"
                          : done
                            ? "management.saved"
                            : "journey.manualSaveHint"
                    )}
                  </span>
                </div>
              </form>
            ) : null}
            {error && (
              <div role="alert" className="design-inline-error">
                {error}
                {!dirty && (
                  <button
                    type="button"
                    onClick={() => setLoadAttempt((n) => n + 1)}
                  >
                    {t("journey.reload")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SettingsChanges>
  );
}
