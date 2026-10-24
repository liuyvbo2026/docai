import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Workspace from "@/models/workspace";
import ConfirmAction from "@/components/lib/ConfirmAction";
import { REFETCH_WORKSPACES_EVENT } from "@/components/Sidebar/ActiveWorkspaces";
export default function DeleteWorkspace({ workspace, visible = true }) {
  const { t } = useTranslation(),
    navigate = useNavigate();
  if (!visible) return null;
  return (
    <details className="design-settings-disclosure design-danger-zone">
      <summary>{t("management.danger")}</summary>
      <p>{t("management.dangerHint")}</p>
      <ConfirmAction
        label={t("management.deleteLibrary")}
        description={t("management.deleteLibraryHint", {
          name: workspace.name,
        })}
        confirmName={workspace.name}
        onConfirm={async () => {
          if (!(await Workspace.delete(workspace.slug))) return false;
          window.dispatchEvent(new Event(REFETCH_WORKSPACES_EVENT));
          navigate("/");
          return true;
        }}
      />
    </details>
  );
}
