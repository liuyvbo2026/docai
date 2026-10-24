import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Workspace from "@/models/workspace";
import ManageWorkspace, {
  useManageWorkspaceModal,
} from "../../Modals/ManageWorkspace";
import paths from "@/utils/paths";
import { Link, useParams, useMatch } from "react-router-dom";
import { GearSix, FolderSimple, DotsSixVertical } from "@phosphor-icons/react";
import useUser from "@/hooks/useUser";
import ThreadContainer from "./ThreadContainer";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import showToast from "@/utils/toast";
import { LAST_VISITED_WORKSPACE } from "@/utils/constants";
import { safeJsonParse } from "@/utils/request";

export const REFETCH_WORKSPACES_EVENT = "refetchWorkspaces";

export default function ActiveWorkspaces() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWs, setSelectedWs] = useState(null);
  const { showing, showModal, hideModal } = useManageWorkspaceModal();
  const { user } = useUser();
  const isInWorkspaceSettings = !!useMatch("/workspace/:slug/settings/:tab");
  const isHomePage = !!useMatch("/");

  useEffect(() => {
    async function getWorkspaces() {
      const workspaces = await Workspace.all();
      setLoading(false);
      setWorkspaces(Workspace.orderWorkspaces(workspaces));
    }
    getWorkspaces();

    // Refetch when a workspace is created elsewhere in the app (eg: the
    // NewWorkspace modal) since those flows navigate via the router and no
    // longer trigger a full page reload.
    window.addEventListener(REFETCH_WORKSPACES_EVENT, getWorkspaces);
    return () =>
      window.removeEventListener(REFETCH_WORKSPACES_EVENT, getWorkspaces);
  }, []);

  if (loading) {
    return (
      <Skeleton.default
        height={40}
        width="100%"
        count={5}
        baseColor="var(--theme-sidebar-item-default)"
        highlightColor="var(--theme-sidebar-item-hover)"
        enableAnimation={true}
        className="my-1"
      />
    );
  }

  /**
   * Reorders workspaces in the UI via localstorage on client side.
   * @param {number} startIndex - the index of the workspace to move
   * @param {number} endIndex - the index to move the workspace to
   */
  function reorderWorkspaces(startIndex, endIndex) {
    const reorderedWorkspaces = Array.from(workspaces);
    const [removed] = reorderedWorkspaces.splice(startIndex, 1);
    reorderedWorkspaces.splice(endIndex, 0, removed);
    setWorkspaces(reorderedWorkspaces);
    const success = Workspace.storeWorkspaceOrder(
      reorderedWorkspaces.map((w) => w.id)
    );
    if (!success) {
      showToast("Failed to reorder workspaces", "error");
      Workspace.all().then((workspaces) => setWorkspaces(workspaces));
    }
  }

  const onDragEnd = (result) => {
    if (!result.destination) return;
    reorderWorkspaces(result.source.index, result.destination.index);
  };

  // When on the home page, resolve which workspace should be virtually active
  const virtualActiveSlug = (() => {
    if (!isHomePage || workspaces.length === 0) return null;
    const lastVisited = safeJsonParse(
      localStorage.getItem(LAST_VISITED_WORKSPACE)
    );
    if (
      lastVisited?.slug &&
      workspaces.some((ws) => ws.slug === lastVisited.slug)
    )
      return lastVisited.slug;
    return workspaces[0]?.slug ?? null;
  })();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="workspaces">
        {(provided) => (
          <div
            role="list"
            aria-label="Workspaces"
            className="flex flex-col gap-y-2"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {workspaces.map((workspace, index) => {
              const isVirtuallyActive = workspace.slug === virtualActiveSlug;
              const isActive = workspace.slug === slug || isVirtuallyActive;
              return (
                <Draggable
                  key={workspace.id}
                  draggableId={workspace.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`design-library-row flex flex-col w-full group ${
                        snapshot.isDragging ? "opacity-50" : ""
                      }`}
                      role="listitem"
                    >
                      <div
                        className={`design-library-heading ${isActive ? "is-active" : ""}`}
                      >
                        <button
                          {...provided.dragHandleProps}
                          type="button"
                          className="design-library-drag"
                          aria-label={t("interaction.reorderLibrary", {
                            name: workspace.name,
                          })}
                          title={t("interaction.reorderLibrary", {
                            name: workspace.name,
                          })}
                        >
                          <DotsSixVertical size={16} />
                        </button>
                        <Link
                          to={paths.workspace.chat(workspace.slug)}
                          aria-current={isActive ? "page" : undefined}
                          className="design-library-name"
                          title={workspace.name}
                        >
                          {workspace.name}
                        </Link>
                        {user?.role !== "default" && (
                          <div className="design-library-actions">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedWs(workspace);
                                showModal();
                              }}
                              aria-label={t("design.manageFiles")}
                              title={t("design.manageFiles")}
                            >
                              <FolderSimple size={18} />
                            </button>
                            <Link
                              to={paths.workspace.settings.generalAppearance(
                                workspace.slug
                              )}
                              aria-label={t("design.librarySettings")}
                              title={t("design.librarySettings")}
                              aria-current={
                                isInWorkspaceSettings && workspace.slug === slug
                                  ? "page"
                                  : undefined
                              }
                            >
                              <GearSix size={18} />
                            </Link>
                          </div>
                        )}
                      </div>
                      {isActive && (
                        <ThreadContainer
                          workspace={workspace}
                          isActive={isActive}
                          isVirtualThread={isVirtuallyActive}
                        />
                      )}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
            {showing && (
              <ManageWorkspace
                hideModal={hideModal}
                providedSlug={selectedWs ? selectedWs.slug : null}
              />
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
