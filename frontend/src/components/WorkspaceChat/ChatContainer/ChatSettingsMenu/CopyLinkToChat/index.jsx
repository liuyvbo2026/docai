import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import showToast from "@/utils/toast";
export default function CopyLinkToChatRow() {
  const { slug, threadSlug } = useParams();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false),
    [failed, setFailed] = useState(false);
  if (!slug) return null;
  const url = `${window.location.origin}/workspace/${slug}${threadSlug ? `/t/${threadSlug}` : ""}`;
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setFailed(false);
      showToast(t("journey.linkCopiedHint"), "success");
    } catch {
      setFailed(true);
    }
  }
  return (
    <div>
      <button type="button" className="design-chat-menu-row" onClick={copyLink}>
        {t(copied ? "journey.linkCopied" : "journey.copyLink")}
      </button>
      <p className="design-menu-hint">{t("journey.localLinkHint")}</p>
      {failed && (
        <div role="alert">
          <p className="design-menu-hint">{t("journey.copyManually")}</p>
          <input
            className="design-link-copy"
            aria-label={t("journey.copyLink")}
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
          />
        </div>
      )}
    </div>
  );
}
