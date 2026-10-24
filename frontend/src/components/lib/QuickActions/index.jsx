import { useTranslation } from "react-i18next";
import {
  UploadSimple,
  TextAlignLeft,
  ArrowUpRight,
} from "@phosphor-icons/react";
export default function QuickActions({
  onUploadDocument,
  onExample,
  hasFiles = false,
}) {
  const { t } = useTranslation();
  return (
    <div className="design-start-actions">
      <button
        type="button"
        onClick={onUploadDocument}
        className="design-start-card"
      >
        <UploadSimple size={22} />
        <span>
          <strong>{t("journey.attachQuestion")}</strong>
          <small>{t("journey.attachQuestionHint")}</small>
        </span>
        <ArrowUpRight size={16} />
      </button>
      <button type="button" onClick={onExample} className="design-start-card">
        <TextAlignLeft size={22} />
        <span>
          <strong>{t("design.exampleTitle")}</strong>
          <small>
            {t(hasFiles ? "design.exampleHint" : "simple.generalExampleLabel")}
          </small>
        </span>
        <ArrowUpRight size={16} />
      </button>
    </div>
  );
}
