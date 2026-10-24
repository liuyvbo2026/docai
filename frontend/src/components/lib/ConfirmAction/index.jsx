import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal, {
  ModalHeader,
  ModalInput,
  ModalFooter,
  ModalSecondaryButton,
  ModalDangerButton,
} from "@/components/lib/Modal";
export default function ConfirmAction({
  label,
  description,
  onConfirm,
  confirmName,
  disabled = false,
  className = "design-danger-button",
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [name, setName] = useState("");
  const close = () => {
    if (!busy) setOpen(false);
  };
  async function submit(event) {
    event.preventDefault();
    if (busy || (confirmName && name !== confirmName)) return;
    setBusy(true);
    setError("");
    try {
      if ((await onConfirm()) === false) throw new Error();
      setOpen(false);
    } catch {
      setError(t("management.operationFailed"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        type="button"
        className={className}
        disabled={disabled}
        onClick={() => {
          setName("");
          setError("");
          setOpen(true);
        }}
      >
        {label}
      </button>
      <Modal
        trapFocus
        isOpen={open}
        onClose={close}
        size="sm"
        ariaLabel={label}
      >
        <form onSubmit={submit} className="flex flex-col gap-5">
          <ModalHeader title={label} onClose={busy ? undefined : close} />
          <p className="text-sm text-theme-text-secondary">{description}</p>
          {confirmName && (
            <ModalInput
              id="confirm-resource-name"
              label={t("management.confirmName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              disabled={busy}
            />
          )}
          {error && (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          )}
          <ModalFooter>
            <ModalSecondaryButton
              autoFocus
              type="button"
              disabled={busy}
              onClick={close}
            >
              {t("management.cancel")}
            </ModalSecondaryButton>
            <ModalDangerButton
              type="submit"
              disabled={busy || (!!confirmName && name !== confirmName)}
            >
              {busy ? t("management.working") : label}
            </ModalDangerButton>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
