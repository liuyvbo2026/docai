import React from "react";
import { useTranslation } from "react-i18next";
import { CaretRight } from "@phosphor-icons/react";

export default function AgentFlowsList({
  flows = [],
  selectedFlow,
  handleClick,
  activeFlowIds = [],
}) {
  const { t } = useTranslation();
  if (flows.length === 0) {
    return (
      <div className="text-theme-text-secondary text-center text-xs flex flex-col gap-y-2">
        <p>{t("journey.emptyFlows")}</p>
        <a
          href="https://docs.anythingllm.com/agent-flows/getting-started"
          target="_blank"
          className="text-theme-text-secondary underline hover:text-cta-button"
          rel="noreferrer"
        >
          {t("journey.flowGuide")}
        </a>
      </div>
    );
  }

  return (
    <div className="bg-theme-bg-secondary text-white rounded-xl w-full min-w-0">
      {flows.map((flow, index) => (
        <button
          type="button"
          key={flow.uuid}
          className={`w-full text-left py-3 px-4 flex items-center justify-between ${
            index === 0 ? "rounded-t-xl" : ""
          } ${
            index === flows.length - 1
              ? "rounded-b-xl"
              : "border-b border-white/10"
          } cursor-pointer transition-all duration-300 hover:bg-theme-bg-primary ${
            selectedFlow?.uuid === flow.uuid
              ? "bg-white/10 light:bg-theme-bg-sidebar"
              : ""
          }`}
          onClick={() => handleClick?.(flow)}
        >
          <div className="text-sm font-light">{flow.name}</div>
          <div className="flex items-center gap-x-2">
            <div className="text-sm text-theme-text-secondary font-medium">
              {t(
                activeFlowIds.includes(flow.uuid)
                  ? "journey.enabled"
                  : "journey.disabled"
              )}
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
