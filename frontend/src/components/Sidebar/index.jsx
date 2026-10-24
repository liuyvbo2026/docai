import { rememberChatPath } from "@/utils/chat/navigation";
import { Brand } from "@/components/Design";
import React, { useEffect, useRef, useState } from "react";
import { List, Plus } from "@phosphor-icons/react";
import NewWorkspaceModal, {
  useNewWorkspaceModal,
} from "../Modals/NewWorkspace";
import ActiveWorkspaces from "./ActiveWorkspaces";
import useUser from "@/hooks/useUser";
import Footer from "../Footer";
import { Link, useLocation } from "react-router-dom";
import paths from "@/utils/paths";
import { useTranslation } from "react-i18next";
import { useSidebarToggle, ToggleSidebarButton } from "./SidebarToggle";
import SearchBox from "./SearchBox";
import { Tooltip } from "react-tooltip";
import { createPortal } from "react-dom";

export default function Sidebar() {
  const { pathname } = useLocation();
  useEffect(() => rememberChatPath(pathname), [pathname]);
  const { user } = useUser();
  const { t } = useTranslation();
  const [compact, setCompact] = useState(
    () => window.matchMedia("(max-width: 767px)").matches
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const sidebarRef = useRef(null);
  const { showSidebar, setShowSidebar, canToggleSidebar } = useSidebarToggle();
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal,
  } = useNewWorkspaceModal();
  if (compact) return <SidebarMobileHeader />;
  return (
    <>
      <aside
        className={`design-sidebar ${showSidebar ? "" : "is-collapsed"}`}
        aria-label={t("design.library")}
      >
        {canToggleSidebar && (
          <ToggleSidebarButton
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
          />
        )}
        <div className="design-sidebar-inner" hidden={!showSidebar}>
          <div className="design-sidebar-brand">
            <Brand />
          </div>
          <nav className="design-sidebar-content" ref={sidebarRef}>
            <Link to={paths.home()} className="design-new-chat">
              <Plus size={17} />
              {t("design.newChat")}
            </Link>
            <SearchBox user={user} showNewWsModal={showNewWsModal} />
            <div className="design-eyebrow design-library-label">
              {t("design.library")}
            </div>
            <ActiveWorkspaces />
          </nav>
          <Footer />
        </div>
      </aside>
      {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal} />}
      <WorkspaceAndThreadTooltips />
    </>
  );
}

export function SidebarMobileHeader() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { showing, showModal, hideModal } = useNewWorkspaceModal();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return (
    <>
      <div className="design-mobile-header">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("design.menu")}
          aria-expanded={open}
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
        className={`design-mobile-sidebar ${open ? "is-open" : ""}`}
        aria-label={t("design.library")}
      >
        <div className="design-sidebar-brand">
          <Brand />
          <button
            type="button"
            className="design-mobile-close"
            onClick={() => setOpen(false)}
            aria-label={t("design.close")}
          >
            ×
          </button>
        </div>
        <nav className="design-sidebar-content">
          <Link
            to={paths.home()}
            className="design-new-chat"
            onClick={() => setOpen(false)}
          >
            <Plus size={17} />
            {t("design.newChat")}
          </Link>
          <SearchBox
            user={user}
            showNewWsModal={() => {
              setOpen(false);
              showModal();
            }}
          />
          <div className="design-eyebrow design-library-label">
            {t("design.library")}
          </div>
          <ActiveWorkspaces />
        </nav>
        <Footer />
      </aside>
      {showing && <NewWorkspaceModal hideModal={hideModal} />}
      <WorkspaceAndThreadTooltips />
    </>
  );
}

function WorkspaceAndThreadTooltips() {
  return createPortal(
    <React.Fragment>
      <Tooltip
        id="workspace-name"
        place="right"
        delayShow={800}
        className="tooltip !text-xs z-99"
      />
      <Tooltip
        id="workspace-thread-name"
        place="right"
        delayShow={800}
        className="tooltip !text-xs z-99"
      />
      <Tooltip
        id="upload-workspace"
        place="top"
        delayShow={300}
        className="tooltip !text-xs z-99"
      />
      <Tooltip
        id="gear-workspace"
        place="top"
        delayShow={300}
        className="tooltip !text-xs z-99"
      />
    </React.Fragment>,
    document.body
  );
}
