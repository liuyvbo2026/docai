import { useTranslation } from "react-i18next";
import moment from "moment";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { safeJsonParse } from "@/utils/request";

export default function LogRow({ log }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [hasMetadata, setHasMetadata] = useState(false);

  useEffect(() => {
    function parseAndSetMetadata() {
      const data = safeJsonParse(log.metadata, {});
      setHasMetadata(Object.keys(data)?.length > 0);
      setMetadata(data);
    }
    parseAndSetMetadata();
  }, [log.metadata]);

  const handleRowClick = () => {
    if (log.metadata !== "{}") {
      setExpanded(!expanded);
    }
  };

  return (
    <>
      <tr
        onClick={handleRowClick}
        className={`bg-transparent text-white text-opacity-80 text-xs font-medium border-b border-white/10 h-10 ${
          hasMetadata ? "cursor-pointer hover:bg-white/5" : ""
        }`}
      >
        <EventBadge event={log.event} />
        <td className="px-6 border-transparent transform transition-transform duration-200">
          {!log.user?.username || log.user.username === "unknown user"
            ? t("journey.localUser")
            : log.user.username}
        </td>
        <td className="px-6 border-transparent transform transition-transform duration-200">
          {moment(log.occurredAt).format("YYYY-MM-DD HH:mm")}
        </td>
        <td className="px-4">
          {hasMetadata && (
            <button
              type="button"
              aria-expanded={expanded}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="inline-flex items-center gap-1"
            >
              {expanded ? <CaretUp size={16} /> : <CaretDown size={16} />}{" "}
              {t(expanded ? "journey.hideDetails" : "journey.logDetails")}
            </button>
          )}
        </td>
      </tr>
      <EventMetadata metadata={metadata} expanded={expanded} />
    </>
  );
}

const EventMetadata = ({ metadata, expanded = false }) => {
  const { t } = useTranslation();
  if (!metadata || !expanded) return null;
  return (
    <tr className="bg-theme-bg-primary">
      <td
        colSpan="2"
        className="px-6 py-4 font-medium text-theme-text-primary rounded-l-2xl"
      >
        {t("journey.logMetadata")}
      </td>
      <td colSpan="2" className="px-6 py-4 rounded-r-2xl">
        <div className="w-full rounded-lg bg-theme-bg-secondary p-2 text-white shadow-sm border-white/10 border bg-opacity-10">
          <pre className="overflow-scroll">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      </td>
    </tr>
  );
};

const EventBadge = ({ event }) => {
  let colorTheme = {
    bg: "bg-sky-600/20",
    text: "text-sky-400 light:text-sky-800",
  };
  if (event.includes("update"))
    colorTheme = {
      bg: "bg-yellow-600/20",
      text: "text-yellow-400 light:text-yellow-800",
    };
  if (event.includes("failed_") || event.includes("deleted"))
    colorTheme = {
      bg: "bg-red-600/20",
      text: "text-red-400 light:text-red-800",
    };
  if (event === "login_event")
    colorTheme = {
      bg: "bg-green-600/20",
      text: "text-green-400 light:text-green-800",
    };

  return (
    <td className="px-6 py-2 font-medium whitespace-nowrap text-white flex items-center">
      <span
        className={`rounded-full ${colorTheme.bg} px-2 py-0.5 text-xs font-medium ${colorTheme.text} shadow-sm`}
      >
        {event}
      </span>
    </td>
  );
};
