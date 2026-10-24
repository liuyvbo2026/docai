import { useSettingsChanges } from "@/components/Design/SettingsChanges";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Workspace from "@/models/workspace";
export default function SuggestedChatMessages({ slug }) {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState([]),
    [dirty, setDirty] = useState(false),
    [saving, setSaving] = useState(false),
    [status, setStatus] = useState("");
  useSettingsChanges(dirty, saving);
  useEffect(() => {
    let active = true;
    Workspace.getSuggestedMessages(slug).then((items) => {
      if (active)
        setQuestions(
          items.map((item) =>
            [item.heading, item.message].filter(Boolean).join(" ")
          )
        );
    });
    return () => {
      active = false;
    };
  }, [slug]);
  function update(items) {
    setQuestions(items);
    setDirty(true);
    setStatus("");
  }
  async function save(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const { success } = await Workspace.setSuggestedMessages(
      slug,
      questions
        .filter((q) => q.trim())
        .map((message) => ({ heading: "", message: message.trim() }))
    );
    setSaving(false);
    setStatus(t(success ? "management.saved" : "management.saveFailed"));
    if (success) setDirty(false);
  }
  return (
    <form className="design-question-editor" onSubmit={save}>
      <h2>{t("management.suggestions")}</h2>
      <p>{t("management.suggestionsHint")}</p>
      {questions.map((q, i) => (
        <div className="design-question-row" key={i}>
          <label>
            <span>{t("management.questionLabel", { number: i + 1 })}</span>
            <textarea
              value={q}
              disabled={saving}
              rows={2}
              placeholder={t("management.questionPlaceholder")}
              onChange={(e) =>
                update(questions.map((v, j) => (i === j ? e.target.value : v)))
              }
            />
          </label>
          <button
            type="button"
            disabled={saving}
            aria-label={t("management.removeQuestion", { number: i + 1 })}
            onClick={() => update(questions.filter((_, j) => i !== j))}
          >
            ×
          </button>
        </div>
      ))}
      <div className="design-form-actions">
        <button
          type="button"
          disabled={saving || questions.length >= 4}
          onClick={() => update([...questions, ""])}
        >
          {t("management.addQuestion")}
        </button>
        <button
          type="submit"
          className="design-button-primary"
          disabled={!dirty || saving}
        >
          {t(saving ? "management.saving" : "management.saveQuestions")}
        </button>
      </div>
      {status && <p role="status">{status}</p>}
    </form>
  );
}
