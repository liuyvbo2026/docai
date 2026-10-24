import { Brand } from "@/components/Design";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, List } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import useUser from "@/hooks/useUser";
import paths, { isPathMatch } from "@/utils/paths";
import { returnToChatPath } from "@/utils/chat/navigation";
import Footer from "../Footer";
import { CanViewChatHistoryProvider } from "../CanViewChatHistory";
import useAppVersion from "@/hooks/useAppVersion";

export default function SettingsSidebar() {
  const { t } = useTranslation(),
    { user } = useUser(),
    { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const escape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open]);
  return (
    <>
      <div className="design-settings-mobile">
        <button
          type="button"
          aria-label={t("design.menu")}
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <List size={22} />
        </button>
        <Brand />
      </div>
      {open && (
        <button
          className="design-drawer-backdrop"
          aria-label={t("design.close")}
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`design-settings-sidebar ${open ? "is-open" : ""}`}
        aria-label={t("design.settings")}
      >
        <div className="design-sidebar-brand">
          <Brand />
          <button
            type="button"
            className="design-mobile-close"
            aria-label={t("design.close")}
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="design-settings-nav">
          <Link className="design-back-link" to={returnToChatPath()}>
            <ArrowLeft size={16} />
            {t("simple.back")}
          </Link>
          <CanViewChatHistoryProvider>
            {({ viewable }) => (
              <SettingsNavigation user={user} viewable={viewable} />
            )}
          </CanViewChatHistoryProvider>
        </div>
        <div className="design-settings-meta">
          <Link to={paths.settings.privacy()}>{t("settings.privacy")}</Link>
          <AppVersion />
        </div>
        <Footer />
      </aside>
    </>
  );
}

function SettingsNavigation({ user, viewable }) {
  const { t } = useTranslation(),
    { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const admin = !user || user.role === "admin",
    manager = admin || user?.role === "manager";
  const item = (label, href, visible = true, keywords = "") => ({
    label: t(label),
    href,
    visible,
    keywords,
  });
  const groups = [
    [
      "commonGroup",
      [
        item(
          "simple.model",
          paths.settings.llmPreference(),
          admin,
          "API key MiMo DeepSeek 模型 密钥"
        ),
        item(
          "simple.appearance",
          paths.settings.interface(),
          manager,
          "theme language 语言 主题"
        ),
        item(
          "settings.security",
          paths.settings.security(),
          !user,
          "password 密码 安全"
        ),
      ],
    ],
    [
      "dataGroup",
      [
        item(
          "management.dataModel",
          paths.settings.embedder.modelPreference(),
          admin,
          "embedding 嵌入"
        ),
        item(
          "management.dataStorage",
          paths.settings.vectorDatabase(),
          admin,
          "vector 向量 数据库"
        ),
        item(
          "management.chunking",
          paths.settings.embedder.chunkingPreference(),
          admin,
          "chunk split 切分 文本 资料"
        ),
        item(
          "management.router",
          paths.settings.modelRouters(),
          admin,
          "router 路由"
        ),
        item(
          "management.answerRules",
          paths.settings.defaultSystemPrompt(),
          admin,
          "prompt 系统提示词"
        ),
      ],
    ],
    [
      "toolsGroup",
      [
        item(
          "settings.agent-skills",
          paths.settings.agentSkills(),
          admin,
          "agent MCP 工具 代理"
        ),
        item(
          "settings.scheduled-jobs",
          paths.settings.scheduledJobs(),
          !user,
          "定时 自动化"
        ),
        item(
          "settings.image-generation",
          paths.settings.imageGenerationPreference(),
          admin,
          "图片 绘图 image"
        ),
        item(
          "management.voice",
          paths.settings.audioPreference(),
          admin,
          "声音 TTS 语音 朗读"
        ),
        item(
          "management.transcribe",
          paths.settings.transcriptionPreference(),
          admin,
          "声音 语音 transcription"
        ),
      ],
    ],
    [
      "teamGroup",
      [
        item("settings.users", paths.settings.users(), !!user && manager),
        item(
          "settings.workspaces",
          paths.settings.workspaces(),
          !!user && manager
        ),
        item("settings.invites", paths.settings.invites(), !!user && manager),
        item(
          "settings.workspace-chats",
          paths.settings.chats(),
          viewable && admin
        ),
      ],
    ],
    [
      "systemGroup",
      [
        item("settings.branding", paths.settings.branding(), manager),
        item("settings.chat", paths.settings.chat(), manager),
        item(
          "management.api",
          paths.settings.apiKeys(),
          admin,
          "API 开发 接口"
        ),
        item(
          "management.logs",
          paths.settings.logs(),
          admin,
          "日志 错误 event"
        ),
        item(
          "management.promptVars",
          paths.settings.systemPromptVariables(),
          admin,
          "prompt 系统提示词变量"
        ),
        item(
          "settings.embeds",
          paths.settings.embedChatWidgets(),
          viewable && admin,
          "网站 嵌入"
        ),
        item(
          "settings.browser-extension",
          paths.settings.browserExtension(),
          manager
        ),
        item("settings.mobile-app", paths.settings.mobile(), manager),
        item(
          "settings.available-channels.telegram",
          paths.settings.telegram(),
          !user
        ),
        item(
          "settings.community-hub.trending",
          paths.communityHub.trending(),
          admin
        ),
        item(
          "settings.community-hub.your-account",
          paths.communityHub.authentication(),
          admin
        ),
        item(
          "settings.community-hub.import-item",
          paths.communityHub.importItem(),
          admin
        ),
        item("management.experimental", paths.settings.experimental(), admin),
      ],
    ],
  ];
  const inAdvanced = groups
    .slice(1)
    .some(([, items]) =>
      items.some((entry) => isPathMatch(entry.href, pathname))
    );
  const [advanced, setAdvanced] = useState(inAdvanced);
  useEffect(() => {
    if (inAdvanced) setAdvanced(true);
  }, [pathname]);
  const term = query.trim().toLocaleLowerCase();
  const visibleGroups = groups
    .map(([key, items]) => [
      key,
      items.filter(
        (entry) =>
          entry.visible &&
          (!term ||
            `${entry.label} ${entry.keywords}`
              .toLocaleLowerCase()
              .includes(term))
      ),
    ])
    .filter(([, items]) => items.length);
  return (
    <>
      <input
        className="design-settings-search"
        type="search"
        aria-label={t("management.searchSettings")}
        placeholder={t("management.searchSettings")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {!term && (
        <button
          className="design-advanced-toggle"
          type="button"
          aria-expanded={advanced}
          onClick={() => setAdvanced(!advanced)}
        >
          {t("management.advanced")}{" "}
          <span aria-hidden>{advanced ? "−" : "+"}</span>
        </button>
      )}
      {!visibleGroups.length && (
        <p className="design-empty-settings">{t("management.noSettings")}</p>
      )}
      {visibleGroups.map(([group, items]) => {
        if (group !== "commonGroup" && !advanced && !term) return null;
        return (
          <section key={group} className="design-setting-group">
            <h2>{t(`management.${group}`)}</h2>
            {items.map((entry) => (
              <Link
                key={entry.href}
                to={entry.href}
                aria-current={
                  isPathMatch(entry.href, pathname) ? "page" : undefined
                }
                className="design-setting-link"
              >
                {entry.label}
              </Link>
            ))}
          </section>
        );
      })}
      {advanced && !term && (
        <p className="design-empty-settings">{t("management.technicalHint")}</p>
      )}
    </>
  );
}
function AppVersion() {
  const { version, isLoading } = useAppVersion();
  if (isLoading || !version) return null;
  return <span>v{version}</span>;
}
