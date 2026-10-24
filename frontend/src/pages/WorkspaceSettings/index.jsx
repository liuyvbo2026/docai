import SettingsChanges from "@/components/Design/SettingsChanges";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Workspace from "@/models/workspace";
import PasswordModal, { usePasswordModal } from "@/components/Modals/Password";
import { returnToChatPath } from "@/utils/chat/navigation";
import { FullScreenLoader } from "@/components/Preloader";
import {
  ArrowUUpLeft,
  ChatText,
  Database,
  Robot,
  User,
  Wrench,
} from "@phosphor-icons/react";
import paths from "@/utils/paths";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import GeneralAppearance from "./GeneralAppearance";
import ChatSettings from "./ChatSettings";
import VectorDatabase from "./VectorDatabase";
import Members from "./Members";
import WorkspaceAgentConfiguration from "./AgentConfig";
import useUser from "@/hooks/useUser";
import { useTranslation } from "react-i18next";
import System from "@/models/system";

const TABS = {
  "general-appearance": GeneralAppearance,
  "chat-settings": ChatSettings,
  "vector-database": VectorDatabase,
  members: Members,
  "agent-config": WorkspaceAgentConfiguration,
};

export default function WorkspaceSettings() {
  const { loading, requiresAuth, mode } = usePasswordModal();

  if (loading) return <FullScreenLoader />;
  if (requiresAuth !== false) {
    return <>{requiresAuth !== null && <PasswordModal mode={mode} />}</>;
  }

  return (
    <SettingsChanges>
      <ShowWorkspaceChat />
    </SettingsChanges>
  );
}

function ShowWorkspaceChat() {
  const { t } = useTranslation();
  const { slug, tab } = useParams();
  const { user } = useUser();
  const [workspace, setWorkspace] = useState(null);
  const [deletionProtected, setDeletionProtected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function getWorkspace() {
      if (!slug) return;
      const _workspace = await Workspace.bySlug(slug);
      if (!active) return;
      if (!_workspace) {
        setWorkspace(null);
        setLoading(false);
        return;
      }

      const _settings = await System.keys();
      const suggestedMessages = await Workspace.getSuggestedMessages(slug);
      if (!active) return;
      setWorkspace({
        ..._workspace,
        vectorDB: _settings?.VectorDB,
        suggestedMessages,
      });
      setDeletionProtected(_settings?.WorkspaceDeletionProtection === true);
      setLoading(false);
    }
    getWorkspace();
    window.addEventListener("refetchWorkspaces", getWorkspace);
    return () => {
      active = false;
      window.removeEventListener("refetchWorkspaces", getWorkspace);
    };
  }, [slug, tab]);

  if (loading) return <FullScreenLoader />;

  const TabContent = TABS[tab] || GeneralAppearance;
  const lastChat = returnToChatPath();
  const returnPath = lastChat.startsWith(`/workspace/${slug}/t/`)
    ? lastChat
    : paths.workspace.chat(slug);
  return (
    <div className="design-app design-workspace-settings w-screen h-screen overflow-hidden flex">
      <Sidebar />
      <main className="design-workspace-main">
        <header className="design-workspace-header">
          <Link className="design-back-link" to={returnPath}>
            <ArrowUUpLeft size={16} />
            {t("simple.back")}
          </Link>
          <span className="design-eyebrow">{t("design.librarySettings")}</span>
          <h1>{workspace?.name || t("management.notFound")}</h1>
          <p>{t("management.workspaceHint")}</p>
        </header>
        {workspace && (
          <>
            <nav
              className="design-workspace-tabs"
              aria-label={t("design.librarySettings")}
            >
              <TabItem
                title={t("management.general")}
                icon={<Wrench size={18} />}
                to={paths.workspace.settings.generalAppearance(slug)}
              />
              <TabItem
                title={t("management.answer")}
                icon={<ChatText size={18} />}
                to={paths.workspace.settings.chatSettings(slug)}
              />
              <TabItem
                title={t("management.retrieval")}
                icon={<Database size={18} />}
                to={paths.workspace.settings.vectorDatabase(slug)}
              />
              <TabItem
                title={t("management.agent")}
                icon={<Robot size={18} />}
                to={paths.workspace.settings.agentConfig(slug)}
              />
              <TabItem
                title={t("management.members")}
                icon={<User size={18} />}
                to={paths.workspace.settings.members(slug)}
                visible={["admin", "manager"].includes(user?.role)}
              />
            </nav>
            <div className="design-workspace-content" key={`${slug}/${tab}`}>
              <TabContent
                slug={slug}
                workspace={workspace}
                deletionProtected={deletionProtected}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function TabItem({ title, icon, to, visible = true }) {
  if (!visible) return null;
  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? "is-active" : "")}
    >
      {icon}
      {title}
    </NavLink>
  );
}
