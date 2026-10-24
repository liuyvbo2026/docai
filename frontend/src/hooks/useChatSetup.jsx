import MiMoOptions from "@/components/LLMSelection/MiMoOptions";
import { isMiMoEndpoint } from "@/utils/chat/mimo";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import System from "@/models/system";
import Workspace from "@/models/workspace";
import useUser from "@/hooks/useUser";
import paths from "@/utils/paths";
import showToast from "@/utils/toast";
import { chatSetupState } from "@/utils/chat/setup";
import DeepSeekOptions from "@/components/LLMSelection/DeepSeekOptions";
import Modal, {
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalPrimaryButton,
  ModalSecondaryButton,
} from "@/components/lib/Modal";

export default function useChatSetup(workspace) {
  const { t } = useTranslation();
  const { user } = useUser();
  const canConfigure = !user || user.role === "admin";
  const [config, setConfig] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const checking = useRef(false);
  const dialogForm = useRef(null);
  const missing = config?.missing;
  const isMiMo =
    config?.provider === "generic-openai" &&
    isMiMoEndpoint(config?.settings?.GenericOpenAiBasePath);

  async function readConfig() {
    const [settings, currentWorkspace] = await Promise.all([
      System.keys(),
      workspace?.slug ? Workspace.bySlug(workspace.slug) : null,
    ]);
    const value = {
      settings,
      ...chatSetupState(settings, currentWorkspace || workspace),
    };
    setConfig(value);
    return value;
  }

  useEffect(() => {
    readConfig();
    const refresh = () => readConfig();
    const openSetup = () => {
      if (canConfigure) {
        setError("");
        setOpen(true);
      }
    };
    window.addEventListener("open_chat_setup", openSetup);
    window.addEventListener("focus", refresh);
    window.addEventListener("save_llm_selector", refresh);
    return () => {
      window.removeEventListener("open_chat_setup", openSetup);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("save_llm_selector", refresh);
    };
  }, [workspace?.slug, canConfigure]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    (
      dialogForm.current?.querySelector("input") ||
      dialogForm.current?.querySelector("button, a")
    )?.focus();
    return () => previous?.focus();
  }, [open]);

  async function ensureReady() {
    if (checking.current) return false;
    checking.current = true;
    try {
      const current = await readConfig();
      if (!current.settings) {
        showToast(t("simple.setupUnavailable"), "error");
        return false;
      }
      if (!current.missing) return true;
      if (canConfigure) {
        setError("");
        setOpen(true);
      } else showToast(t("simple.setupAdmin"), "info");
      return false;
    } finally {
      checking.current = false;
    }
  }

  async function save(e) {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const { error: saveError } = await System.updateSystem(data);
      if (saveError) throw new Error(saveError);
      await readConfig();
      window.dispatchEvent(new Event("save_llm_selector"));
      setOpen(false);
      showToast(t("simple.setupSaved"), "success");
    } catch {
      setError(t("simple.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  function trapFocus(e) {
    if (e.key !== "Tab") return;
    const items = [
      ...e.currentTarget.querySelectorAll(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]"
      ),
    ];
    const first = items[0];
    const last = items[items.length - 1];
    if (
      (e.shiftKey && document.activeElement === first) ||
      (!e.shiftKey && document.activeElement === last)
    ) {
      e.preventDefault();
      (e.shiftKey ? last : first)?.focus();
    }
  }

  const close = () => {
    if (!saving) setOpen(false);
  };
  const setupUI = (
    <>
      {missing && (
        <div className="design-setup-notice" role="status">
          <div>
            <strong>{t("simple.setupTitle")}</strong>
            <p>{t(canConfigure ? "simple.setupHint" : "simple.setupAdmin")}</p>
          </div>
          {canConfigure && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setOpen(true);
              }}
            >
              {t("simple.setupAction")}
            </button>
          )}
        </div>
      )}
      <Modal isOpen={open} onClose={close} ariaLabel={t("simple.setupAction")}>
        <form
          ref={dialogForm}
          onSubmit={save}
          onKeyDown={trapFocus}
          className="flex flex-col gap-5"
        >
          <ModalHeader
            title={t("simple.setupAction")}
            subtitle={t("simple.setupPreserved")}
            onClose={saving ? undefined : close}
          />
          <ModalBody>
            {config?.provider === "deepseek" ? (
              <>
                <p className="text-sm text-theme-text-secondary">
                  {t("simple.setupDeepSeek")}
                </p>
                <DeepSeekOptions settings={config.settings} />
              </>
            ) : isMiMo ? (
              <MiMoOptions settings={config.settings} />
            ) : (
              <Link
                className="text-sm underline"
                to={paths.settings.llmPreference()}
                target="_blank"
                rel="noreferrer"
              >
                {t("simple.setupOther")}
              </Link>
            )}
            {error && (
              <p role="alert" className="text-sm text-red-500">
                {error}
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <ModalSecondaryButton
              type="button"
              onClick={close}
              disabled={saving}
            >
              {t("simple.setupLater")}
            </ModalSecondaryButton>
            {(config?.provider === "deepseek" || isMiMo) && (
              <ModalPrimaryButton type="submit" disabled={saving}>
                {t(saving ? "simple.saving" : "simple.setupSave")}
              </ModalPrimaryButton>
            )}
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
  return { ensureReady, setupUI };
}
