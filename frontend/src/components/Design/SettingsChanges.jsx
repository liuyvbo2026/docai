import {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  useCallback,
} from "react";
import { useBlocker } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Modal, {
  ModalHeader,
  ModalFooter,
  ModalSecondaryButton,
  ModalDangerButton,
} from "@/components/lib/Modal";
const Context = createContext(null);
export function useSettingsChanges(dirty, busy = false) {
  const notify = useContext(Context),
    id = useId();
  useEffect(() => {
    notify?.(id, { dirty, busy });
  }, [notify, id, dirty, busy]);
  useEffect(() => () => notify?.(id, null), [notify, id]);
}
export default function SettingsChanges({
  children,
  dirty: suppliedDirty = false,
  busy: suppliedBusy = false,
}) {
  const { t } = useTranslation(),
    [forms, setForms] = useState({});
  const notify = useCallback(
    (id, value) =>
      setForms((prev) => {
        const next = { ...prev };
        if (value) next[id] = value;
        else delete next[id];
        return next;
      }),
    []
  );
  const dirty =
      suppliedDirty ||
      suppliedBusy ||
      Object.values(forms).some((f) => f.dirty || f.busy),
    busy = suppliedBusy || Object.values(forms).some((f) => f.busy);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname
  );
  useEffect(() => {
    if (blocker.state === "blocked" && !dirty) blocker.proceed();
  }, [blocker, dirty]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  return (
    <Context.Provider value={notify}>
      {children}
      <Modal
        trapFocus
        isOpen={blocker.state === "blocked" && dirty}
        onClose={() => blocker.reset?.()}
        ariaLabel={t("management.unsavedTitle")}
        size="sm"
      >
        <ModalHeader
          title={t(busy ? "management.saving" : "management.unsavedTitle")}
          onClose={() => blocker.reset?.()}
        />
        <p className="text-sm text-theme-text-secondary">
          {t("management.unsavedHint")}
        </p>
        <ModalFooter>
          <ModalSecondaryButton autoFocus onClick={() => blocker.reset?.()}>
            {t("management.continueEditing")}
          </ModalSecondaryButton>
          <ModalDangerButton
            disabled={busy}
            onClick={() => blocker.proceed?.()}
          >
            {t("management.discard")}
          </ModalDangerButton>
        </ModalFooter>
      </Modal>
    </Context.Provider>
  );
}
