import { useSettingsChanges } from "@/components/Design/SettingsChanges";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Check } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
const AutosaveFormContext = createContext();
export default function AutosaveForm({ onSave, children, ...props }) {
  const { t } = useTranslation();
  const formEl = useRef(null),
    versions = useRef({});
  const [dirtyFields, setDirtyFields] = useState([]),
    [savedFields, setSavedFields] = useState([]);
  const [pending, setPending] = useState(false),
    [saving, setSaving] = useState(false),
    [status, setStatus] = useState("idle");
  useSettingsChanges(dirtyFields.length > 0, saving);
  const markDirty = (name) => {
    if (!name) return;
    versions.current[name] = (versions.current[name] || 0) + 1;
    setDirtyFields((fields) =>
      fields.includes(name) ? fields : [...fields, name]
    );
    setStatus("dirty");
  };
  const save = () => setPending(true);
  useEffect(() => {
    if (!pending || saving) return;
    setPending(false);
    if (!dirtyFields.length) return;
    if (!formEl.current.reportValidity()) {
      setStatus("invalid");
      return;
    }
    const sent = Object.fromEntries(
      dirtyFields.map((name) => [name, versions.current[name]])
    );
    setSaving(true);
    setStatus("saving");
    Promise.resolve()
      .then(() => onSave(formEl.current))
      .then((success) => {
        if (!success) {
          setStatus("error");
          return;
        }
        const saved = Object.keys(sent).filter(
          (name) => versions.current[name] === sent[name]
        );
        setDirtyFields((current) =>
          current.filter((name) => !saved.includes(name))
        );
        setSavedFields(saved);
        setStatus(
          Object.keys(versions.current).some(
            (name) => !(name in sent) || versions.current[name] !== sent[name]
          )
            ? "dirty"
            : "saved"
        );
        for (const name of saved) delete versions.current[name];
      })
      .catch(() => setStatus("error"))
      .finally(() => setSaving(false));
  }, [pending, saving]);
  useEffect(() => {
    if (!savedFields.length) return;
    const timer = setTimeout(() => setSavedFields([]), 2000);
    return () => clearTimeout(timer);
  }, [savedFields]);
  return (
    <AutosaveFormContext.Provider
      value={{ markDirty, save, savedFields, hasChanges: !!dirtyFields.length }}
    >
      <form
        ref={formEl}
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        onChange={(e) => {
          markDirty(e.target.name);
          if (e.target.tagName === "SELECT") save();
        }}
        onBlur={(e) => {
          if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) save();
        }}
        {...props}
      >
        <div
          className="design-save-status"
          role="status"
          aria-live="polite"
          data-status={status}
        >
          <span>
            {t(
              `management.${saving ? "saving" : status === "error" ? "saveFailed" : status === "invalid" ? "invalid" : dirtyFields.length ? "unsaved" : status === "saved" ? "saved" : "autoHint"}`
            )}
          </span>
          {!!dirtyFields.length && !saving && (
            <button type="submit">
              {t(
                status === "error" ? "management.retry" : "management.saveNow"
              )}
            </button>
          )}
        </div>
        {children}
      </form>
    </AutosaveFormContext.Provider>
  );
}
export function useAutosaveForm() {
  return useContext(AutosaveFormContext);
}
export function SavedIndicator({ name }) {
  const { t } = useTranslation();
  const { savedFields } = useAutosaveForm();
  if (!savedFields.includes(name)) return null;
  return (
    <span className="ml-2 inline-flex items-center gap-x-1 text-xs font-normal text-green-600">
      <Check size={12} />
      {t("common.saved")}
    </span>
  );
}
