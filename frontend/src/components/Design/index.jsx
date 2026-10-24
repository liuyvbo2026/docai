import { Link } from "react-router-dom";
import { ChatCircle } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import paths from "@/utils/paths";

export function Brand() {
  return (
    <Link to={paths.home()} className="design-brand" aria-label="DocAI">
      <ChatCircle size={23} weight="regular" />
      <span>DocAI</span>
    </Link>
  );
}

export function WelcomeHeading() {
  const { t } = useTranslation();
  return (
    <header className="design-welcome-heading">
      <span className="design-eyebrow">{t("design.eyebrow")}</span>
      <h1>{t("design.title")}</h1>
      <p>{t("design.description")}</p>
    </header>
  );
}

export function WelcomeFooter() {
  const { t } = useTranslation();
  return (
    <div className="design-welcome-footer">
      <span>{t("design.dropHint")}</span>
    </div>
  );
}
