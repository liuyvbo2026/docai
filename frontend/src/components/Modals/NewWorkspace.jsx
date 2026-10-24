import React, { useRef, useState } from "react";
import Workspace from "@/models/workspace";
import paths from "@/utils/paths";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { REFETCH_WORKSPACES_EVENT } from "@/components/Sidebar/ActiveWorkspaces";
import Modal, {
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalPrimaryButton,
  ModalInput,
} from "@/components/lib/Modal";

const noop = () => false;
export default function NewWorkspaceModal({ hideModal = noop }) {
  const navigate = useNavigate();
  const formEl = useRef(null);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const { t } = useTranslation();
  const handleCreate = async (e) => {
    e.preventDefault();
    if (creating) return;
    setError(null);
    setCreating(true);
    const data = {};
    const form = new FormData(formEl.current);
    for (var [key, value] of form.entries()) data[key] = value;
    data.name = String(data.name || "").trim();
    if (!data.name) {
      setError(t("journey.nameRequired"));
      setCreating(false);
      return;
    }
    const { workspace, message } = await Workspace.new(data);
    setCreating(false);
    if (!!workspace) {
      // Refresh the sidebar list and navigate via the router so
      // ActiveGenerationGuard can intercept if a response is generating.
      // If the user cancels the navigation, the workspace still exists and
      // shows in the sidebar - so close this modal either way.
      window.dispatchEvent(new CustomEvent(REFETCH_WORKSPACES_EVENT));
      hideModal();
      navigate(paths.workspace.chat(workspace.slug));
      return;
    }
    setError(message || t("journey.createFailed"));
  };

  return (
    <Modal
      isOpen={true}
      trapFocus
      onClose={creating ? undefined : hideModal}
      size="md"
      ariaLabel={t("simple.newLibrary")}
    >
      <form
        ref={formEl}
        onSubmit={handleCreate}
        className="flex flex-col gap-y-5"
      >
        <ModalHeader
          title={t("simple.newLibrary")}
          onClose={creating ? undefined : hideModal}
        />
        <ModalBody>
          <p className="text-sm text-theme-text-secondary mb-4">
            {t("simple.libraryHint")}
          </p>
          <ModalInput
            label={t("simple.libraryName")}
            name="name"
            type="text"
            id="name"
            placeholder={t("new-workspace.placeholder")}
            maxLength={80}
            required={true}
            autoComplete="off"
            autoFocus={true}
          />
          {error && (
            <p role="alert" className="text-red-400 text-sm">
              {error}
            </p>
          )}
        </ModalBody>
        <ModalFooter className="justify-end">
          <button
            type="button"
            className="design-button-secondary"
            onClick={hideModal}
            disabled={creating}
          >
            {t("design.cancel")}
          </button>
          <ModalPrimaryButton type="submit" disabled={creating}>
            {t(creating ? "design.creating" : "simple.createLibrary")}
          </ModalPrimaryButton>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export function useNewWorkspaceModal() {
  const [showing, setShowing] = useState(false);
  const showModal = () => {
    setShowing(true);
  };
  const hideModal = () => {
    setShowing(false);
  };

  return { showing, showModal, hideModal };
}
