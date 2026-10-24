import { useTranslation } from "react-i18next";
import { memo, useState } from "react";
import {
  formatDateTimeAsMoment,
  getFileExtension,
  middleTruncate,
} from "@/utils/directories";
import { ArrowUUpLeft, Eye, File, PushPin } from "@phosphor-icons/react";
import Workspace from "@/models/workspace";
import showToast from "@/utils/toast";
import System from "@/models/system";

export default function WorkspaceFileRow({
  item,
  folderName,
  workspace,
  setLoading,
  setLoadingMessage,
  fetchKeys,
  hasChanges,
  movedItems,
  selected,
  toggleSelection,
  disableSelection,
  setSelectedItems,
}) {
  const { t } = useTranslation();
  const onRemoveClick = async (e) => {
    e.stopPropagation();
    setLoading(true);

    try {
      setLoadingMessage(t("management.working"));
      const result = await Workspace.modifyEmbeddings(workspace.slug, {
        adds: [],
        deletes: [`${folderName}/${item.name}`],
      });
      if (!result.workspace || result.message) throw new Error();
      await fetchKeys(true);
    } catch {
      showToast(t("management.operationFailed"), "error");
    }
    setSelectedItems({});
    setLoadingMessage("");
    setLoading(false);
  };

  function toggleRowSelection(e) {
    if (disableSelection) return;
    e.stopPropagation();
    toggleSelection();
  }

  function handleRowSelection(e) {
    e.stopPropagation();
    toggleSelection();
  }

  const isMovedItem = movedItems?.some((movedItem) => movedItem.id === item.id);
  return (
    <div
      className={`text-theme-text-primary text-xs grid grid-cols-12 py-2 pl-3.5 pr-8 h-[34px] items-center file-row ${
        !disableSelection
          ? "hover:bg-theme-file-picker-hover cursor-pointer"
          : ""
      } ${isMovedItem ? "selected light:text-white" : ""} ${
        selected ? "selected light:text-white" : ""
      }`}
      onClick={toggleRowSelection}
    >
      <div
        className="col-span-10 w-fit flex gap-x-[2px] items-center relative"
        data-tooltip-id="ws-directory-item"
        data-tooltip-content={JSON.stringify({
          title: item.title,
          date: formatDateTimeAsMoment(item?.published),
          extension: getFileExtension(item.url),
        })}
      >
        <div className="shrink-0 w-3 h-3">
          {!disableSelection ? (
            <div
              className={`shrink-0 w-3 h-3 rounded border-[1px] border-solid border-white ${
                selected ? "text-white" : "text-theme-text-primary light:invert"
              } flex justify-center items-center cursor-pointer`}
              role="checkbox"
              aria-checked={selected}
              aria-label={item.title}
              onKeyDown={(event) => {
                if (event.key === " " || event.key === "Enter") {
                  event.preventDefault();
                  event.stopPropagation();
                  event.currentTarget.click();
                }
              }}
              tabIndex={0}
              onClick={handleRowSelection}
            >
              {selected && <div className="w-2 h-2 bg-white rounded-[2px]" />}
            </div>
          ) : null}
        </div>
        <File
          className="shrink-0 text-base font-bold w-4 h-4 mr-[3px] ml-1"
          weight="fill"
        />
        <p className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[400px]">
          {middleTruncate(item.title, 50)}
        </p>
      </div>
      <div className="col-span-2 flex justify-end items-center">
        {hasChanges ? (
          <div className="w-4 h-4 ml-2 flex-shrink-0" />
        ) : (
          <div className="flex gap-x-2 items-center">
            <WatchForChanges
              workspace={workspace}
              docPath={`${folderName}/${item.name}`}
              item={item}
            />
            <PinItemToWorkspace
              workspace={workspace}
              docPath={`${folderName}/${item.name}`}
              item={item}
            />
            <RemoveItemFromWorkspace item={item} onClick={onRemoveClick} />
          </div>
        )}
      </div>
    </div>
  );
}

const PinItemToWorkspace = memo(({ workspace, docPath, item }) => {
  const { t } = useTranslation();
  const [pinned, setPinned] = useState(
    item?.pinnedWorkspaces?.includes(workspace.id) || false
  );
  const pinEvent = new CustomEvent("pinned_document");

  const updatePinStatus = async (e) => {
    try {
      e.stopPropagation();
      if (!pinned) window.dispatchEvent(pinEvent);
      const success = await Workspace.setPinForDocument(
        workspace.slug,
        docPath,
        !pinned
      );

      if (!success) {
        showToast(`Failed to ${!pinned ? "pin" : "unpin"} document.`, "error", {
          clear: true,
        });
        return;
      }

      showToast(
        `Document ${!pinned ? "pinned to" : "unpinned from"} workspace`,
        "success",
        { clear: true }
      );
      setPinned(!pinned);
    } catch (error) {
      showToast(`Failed to pin document. ${error.message}`, "error", {
        clear: true,
      });
      return;
    }
  };

  if (!item) return <div className="w-[16px] p-[2px] ml-2" />;

  return (
    <button
      type="button"
      aria-label={t(pinned ? "management.unpin" : "management.pin")}
      onClick={updatePinStatus}
      className="group flex items-center ml-2 cursor-pointer"
      data-tooltip-id="pin-document"
      data-tooltip-content={t(pinned ? "management.unpin" : "management.pin")}
    >
      {pinned ? (
        <div className="bg-theme-settings-input-active group-hover:bg-red-500/20 rounded-3xl whitespace-nowrap">
          <p className="text-xs px-2 py-0.5 group-hover:text-red-500">
            <span className="group-hover:hidden">{t("management.pinned")}</span>
            <span className="hidden group-hover:inline">
              {t("management.unpin")}
            </span>
          </p>
        </div>
      ) : (
        <PushPin
          size={16}
          weight="regular"
          className="outline-none text-base font-bold flex-shrink-0"
        />
      )}
    </button>
  );
});

const WatchForChanges = memo(({ workspace, docPath, item }) => {
  const { t } = useTranslation();
  const [watched, setWatched] = useState(item?.watched || false);
  const watchEvent = new CustomEvent("watch_document_for_changes");

  const updateWatchStatus = async (e) => {
    try {
      e.stopPropagation();
      if (!watched) window.dispatchEvent(watchEvent);
      const success =
        await System.experimentalFeatures.liveSync.setWatchStatusForDocument(
          workspace.slug,
          docPath,
          !watched
        );

      if (!success) {
        showToast(
          `Failed to ${!watched ? "watch" : "unwatch"} document.`,
          "error",
          {
            clear: true,
          }
        );
        return;
      }

      showToast(
        `Document ${
          !watched
            ? "will be watched for changes"
            : "will no longer be watched for changes"
        }.`,
        "success",
        { clear: true }
      );
      setWatched(!watched);
    } catch (error) {
      showToast(`Failed to watch document. ${error.message}`, "error", {
        clear: true,
      });
      return;
    }
  };

  if (!item || !item.canWatch) return <div className="w-[16px] p-[2px] ml-2" />;

  return (
    <button
      type="button"
      aria-label={t(watched ? "management.unwatch" : "management.watch")}
      className="group flex gap-x-2 items-center hover:bg-theme-file-picker-hover p-[2px] rounded ml-2 cursor-pointer"
      onClick={updateWatchStatus}
      data-tooltip-id="watch-changes"
      data-active={watched}
      data-tooltip-content={t(
        watched ? "management.unwatch" : "management.watch"
      )}
    >
      <Eye
        size={16}
        weight="regular"
        className="outline-none text-base font-bold flex-shrink-0 group-hover:hidden group-data-[active=true]:hidden"
      />
      <Eye
        size={16}
        weight="fill"
        className="outline-none text-base font-bold flex-shrink-0 hidden group-hover:block group-data-[active=true]:block"
      />
    </button>
  );
});

const RemoveItemFromWorkspace = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      aria-label={t("management.removeFile")}
      title={t("management.removeFile")}
      onClick={onClick}
      className="flex items-center gap-1 text-xs"
    >
      <ArrowUUpLeft size={16} />
      {t("management.removeShort")}
    </button>
  );
};
