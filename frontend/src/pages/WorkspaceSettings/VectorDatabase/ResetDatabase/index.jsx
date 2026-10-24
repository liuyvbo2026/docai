import { useTranslation } from "react-i18next";
import Workspace from "@/models/workspace";
import ConfirmAction from "@/components/lib/ConfirmAction";
import showToast from "@/utils/toast";
export default function ResetDatabase({ workspace }) {
  const { t } = useTranslation();
  return (
    <details className="design-settings-disclosure design-danger-zone">
      <summary>{t("management.danger")}</summary>
      <p>{t("management.dangerHint")}</p>
      <ConfirmAction
        label={t("management.reset")}
        description={t("management.resetHint")}
        onConfirm={async () => {
          const ok = await Workspace.wipeVectorDb(workspace.slug);
          if (ok) showToast(t("management.operationDone"), "success");
          return ok;
        }}
      />
    </details>
  );
}
