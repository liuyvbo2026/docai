import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import System from "@/models/system";
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalPrimaryButton,
  ModalSecondaryButton,
  ModalInput,
} from "@/components/lib/Modal";
export default function VariableForm({
  variable = null,
  closeModal,
  onRefresh,
  onBusyChange,
}) {
  const { t } = useTranslation();
  const [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    onBusyChange?.(saving);
    return () => onBusyChange?.(false);
  }, [saving, onBusyChange]);
  async function submit(e) {
    e.preventDefault();
    if (saving) return;
    const values = Object.fromEntries(
      [...new FormData(e.target)].map(([k, v]) => [k, v.trim()])
    );
    if (!values.key || !values.value) {
      setError(t("journey.variableRequired"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      const result = variable
        ? await System.promptVariables.update(variable.id, values)
        : await System.promptVariables.create(values);
      if (!result?.success) throw new Error();
      onRefresh?.();
      closeModal();
    } catch {
      setError(t("management.saveFailed"));
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-y-5">
      <ModalHeader
        title={t(variable ? "journey.editVariable" : "journey.addVariable")}
        onClose={saving ? undefined : closeModal}
      />
      <ModalBody>
        <fieldset disabled={saving} className="flex flex-col gap-4">
          <ModalInput
            id="variable-key"
            label={t("journey.variableKey")}
            name="key"
            defaultValue={variable?.key || ""}
            minLength={3}
            maxLength={255}
            required
            pattern="^[a-zA-Z0-9_]+$"
            placeholder="company_name"
            hint={t("journey.variableKeyHint")}
            autoFocus
          />
          <ModalInput
            id="variable-value"
            label={t("journey.variableValue")}
            name="value"
            defaultValue={variable?.value || ""}
            required
            placeholder={t("journey.variableValueExample")}
          />
          <ModalInput
            id="variable-description"
            label={t("journey.variableDescription")}
            name="description"
            defaultValue={variable?.description || ""}
          />
        </fieldset>
        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <ModalSecondaryButton
          type="button"
          disabled={saving}
          onClick={closeModal}
        >
          {t("management.cancel")}
        </ModalSecondaryButton>
        <ModalPrimaryButton type="submit" disabled={saving}>
          {t(saving ? "management.saving" : "management.confirmSave")}
        </ModalPrimaryButton>
      </ModalFooter>
    </form>
  );
}
