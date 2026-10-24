import { useTranslation } from "react-i18next";
import useUser from "@/hooks/useUser";
import { useLocation } from "react-router-dom";
import { GearSix, ArrowUpRight } from "@phosphor-icons/react";
import System from "@/models/system";
import paths from "@/utils/paths";
import {
  BookOpen,
  DiscordLogo,
  GithubLogo,
  Briefcase,
  Envelope,
  Globe,
  HouseLine,
  Info,
  LinkSimple,
} from "@phosphor-icons/react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const MAX_ICONS = 3;
export const ICON_COMPONENTS = {
  BookOpen: BookOpen,
  DiscordLogo: DiscordLogo,
  GithubLogo: GithubLogo,
  Envelope: Envelope,
  LinkSimple: LinkSimple,
  HouseLine: HouseLine,
  Globe: Globe,
  Briefcase: Briefcase,
  Info: Info,
};

export default function Footer() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { pathname } = useLocation();
  const [footerData, setFooterData] = useState(null);
  useEffect(() => {
    System.fetchCustomFooterIcons().then(({ footerData }) =>
      setFooterData(footerData)
    );
  }, []);
  const inSettings = pathname.startsWith("/settings");
  const settingsPath =
    !user || user.role === "admin"
      ? paths.settings.llmPreference()
      : paths.settings.interface();
  const links =
    Array.isArray(footerData) && footerData.length
      ? footerData
      : [
          { url: paths.docs(), label: t("design.docs"), icon: "BookOpen" },
          {
            url: paths.github(),
            label: t("design.source"),
            icon: "GithubLogo",
          },
          {
            url: paths.discord(),
            label: t("design.community"),
            icon: "DiscordLogo",
          },
        ];
  return (
    <footer className="design-footer">
      {!inSettings && (!user || user.role !== "default") && (
        <Link
          className="design-footer-link"
          to={inSettings ? paths.home() : settingsPath}
        >
          {inSettings ? <HouseLine size={18} /> : <GearSix size={18} />}
          <span>{t(inSettings ? "design.back" : "design.settings")}</span>
        </Link>
      )}
      <details className="design-help">
        <summary>
          <Info size={18} />
          <span>{t("design.help")}</span>
        </summary>
        <div className="design-help-menu">
          {links.map((item, index) => (
            <a key={index} href={item.url} target="_blank" rel="noreferrer">
              {React.createElement(ICON_COMPONENTS[item.icon] || Info, {
                size: 16,
              })}
              <span>{item.label || item.name || item.url}</span>
              <ArrowUpRight size={13} />
            </a>
          ))}
        </div>
      </details>
    </footer>
  );
}
