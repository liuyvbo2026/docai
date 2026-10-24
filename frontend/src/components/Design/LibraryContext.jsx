import { useTranslation } from "react-i18next";
import ManageWorkspace, {
  useManageWorkspaceModal,
} from "@/components/Modals/ManageWorkspace";
import useUser from "@/hooks/useUser";
export default function LibraryContext({ workspace }) {
  const { t } = useTranslation();
  const { user } = useUser();
  const { showing, showModal, hideModal } = useManageWorkspaceModal();
  if (!workspace)
    return (
      <p className="design-composer-context">{t("journey.autoLibrary")}</p>
    );
  return (
    <>
      <div className="design-library-context">
        <span>{t("interaction.usingLibrary", { name: workspace.name })}</span>
        {user?.role !== "default" && (
          <button type="button" onClick={showModal}>
            {t("journey.longTermFiles")}
          </button>
        )}
      </div>
      {showing && (
        <ManageWorkspace providedSlug={workspace.slug} hideModal={hideModal} />
      )}
    </>
  );
}
