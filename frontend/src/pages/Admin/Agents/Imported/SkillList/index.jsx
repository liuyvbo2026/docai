import { useTranslation } from "react-i18next";
import { CaretRight } from "@phosphor-icons/react";
import { formatSkillName } from "../formatSkillName";

export default function ImportedSkillList({
  skills = [],
  selectedSkill = null,
  handleClick = null,
}) {
  const { t } = useTranslation();
  if (skills.length === 0)
    return (
      <div className="text-theme-text-secondary text-center text-xs flex flex-col gap-y-2">
        <p>{t("journey.emptySkills")}</p>
        <p>
          <a
            href="https://docs.anythingllm.com/agent/custom/developer-guide"
            target="_blank"
            className="text-theme-text-secondary underline hover:text-cta-button"
            rel="noreferrer"
          >
            {t("journey.skillGuide")}
          </a>
        </p>
      </div>
    );

  return (
    <div
      className={`bg-theme-bg-secondary text-white rounded-xl w-full min-w-0`}
    >
      {skills.map((config, index) => (
        <button
          type="button"
          key={config.hubId}
          className={`w-full text-left py-3 px-4 flex items-center justify-between ${
            index === 0 ? "rounded-t-xl" : ""
          } ${
            index === Object.keys(skills).length - 1
              ? "rounded-b-xl"
              : "border-b border-white/10"
          } cursor-pointer transition-all duration-300 hover:bg-theme-bg-primary ${
            selectedSkill === config.hubId ? "bg-theme-bg-primary" : ""
          }`}
          onClick={() => handleClick?.({ ...config, imported: true })}
        >
          <div className="text-sm font-light">
            {formatSkillName(config.name)}
          </div>
          <div className="flex items-center gap-x-2">
            <div className="text-sm text-theme-text-secondary font-medium">
              {t(config.active ? "journey.enabled" : "journey.disabled")}
            </div>
            <CaretRight
              size={14}
              weight="bold"
              className="text-theme-text-secondary"
            />
          </div>
        </button>
      ))}
    </div>
  );
}
