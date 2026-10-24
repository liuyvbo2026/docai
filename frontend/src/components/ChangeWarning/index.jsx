import { useTranslation } from "react-i18next";
import { Warning } from "@phosphor-icons/react";
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalSecondaryButton,
  ModalDangerButton,
} from "@/components/lib/Modal";

export default function ChangeWarningModal({
  warningText = "",
  onClose,
  onConfirm,
  busy = false,
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-y-5">
      <ModalHeader
        title={
          <span className="flex items-center gap-x-2 text-red-500">
            <Warning className="w-6 h-6 shrink-0" weight="fill" />
            {t("management.confirmChange")}
          </span>
        }
        onClose={busy ? undefined : onClose}
      />
      <ModalBody>
        <p className="text-zinc-300 light:text-slate-700">
          {warningText.split("\\n").map((line, index) => (
            <span key={index}>
              {line}
              <br />
            </span>
          ))}
          <br />
          <br />
          {t("management.confirmChangeHint")}
        </p>
      </ModalBody>
      <ModalFooter className="justify-end">
        <ModalSecondaryButton
          autoFocus
          disabled={busy}
          onClick={onClose}
          type="button"
        >
          {t("management.cancel")}
        </ModalSecondaryButton>
        <ModalDangerButton disabled={busy} onClick={onConfirm} type="button">
          {t(busy ? "management.saving" : "management.confirmSave")}
        </ModalDangerButton>
      </ModalFooter>
    </div>
  );
}
