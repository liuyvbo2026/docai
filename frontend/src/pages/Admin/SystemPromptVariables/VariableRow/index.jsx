import { useState } from "react";
import ConfirmAction from "@/components/lib/ConfirmAction";
import { useTranslation } from "react-i18next";
import System from "@/models/system";
import showToast from "@/utils/toast";
import { useModal } from "@/hooks/useModal";
import Modal from "@/components/lib/Modal";
import EditVariableModal from "./EditVariableModal";
import truncate from "truncate";

/**
 * A row component for displaying a system prompt variable
 * @param {{id: number|null, key: string, value: string, description: string, type: string}} variable - The system prompt variable to display
 * @param {Function} onRefresh - A function to call when the variable is refreshed
 * @returns {JSX.Element} A JSX element for displaying the variable
 */
export default function VariableRow({ variable, onRefresh }) {
  const [savingVariable, setSavingVariable] = useState(false);
  const { t } = useTranslation();
  const { isOpen, openModal, closeModal } = useModal();

  const handleDelete = async () => {
    if (!variable.id) return;

    try {
      const { success, error } = await System.promptVariables.delete(
        variable.id
      );
      if (!success) throw new Error(error);
      showToast(t("management.operationDone"), "success", { clear: true });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error deleting variable:", error);
      showToast(t("management.operationFailed"), "error", { clear: true });
      return false;
    }
  };

  const getTypeColorTheme = (type) => {
    switch (type) {
      case "system":
        return {
          bg: "bg-blue-600/20",
          text: "text-blue-400 light:text-blue-800",
        };
      case "user":
        return {
          bg: "bg-green-600/20",
          text: "text-green-400 light:text-green-800",
        };
      case "workspace":
        return {
          bg: "bg-cyan-600/20",
          text: "text-cyan-400 light:text-cyan-800",
        };
      default:
        return {
          bg: "bg-yellow-600/20",
          text: "text-yellow-400 light:text-yellow-800",
        };
    }
  };

  const colorTheme = getTypeColorTheme(variable.type);

  return (
    <>
      <tr className="bg-transparent text-white text-opacity-80 text-xs font-medium border-b border-white/10 h-10">
        <th scope="row" className="px-4 py-2 whitespace-nowrap">
          {variable.key}
        </th>
        <td className="px-4 py-2">
          {typeof variable.value === "function"
            ? variable.value()
            : variable.type !== "static"
              ? t("journey.autoVariable")
              : truncate(variable.value || "", 50)}
        </td>
        <td className="px-4 py-2">
          {variable.type === "static"
            ? truncate(variable.description || "—", 50)
            : t(`journey.builtin_${variable.key.replaceAll(".", "_")}`, {
                defaultValue: variable.description || "—",
              })}
        </td>
        <td className="px-4 py-2">
          <span
            className={`rounded-full ${colorTheme.bg} px-2 py-0.5 text-xs leading-5 font-semibold ${colorTheme.text} shadow-sm`}
          >
            {t(`journey.variableType_${variable?.type ?? "static"}`)}
          </span>
        </td>
        <td className="px-4 py-2 flex items-center justify-end gap-x-4">
          {variable.type === "static" && (
            <>
              <button
                onClick={openModal}
                className="text-xs font-medium text-white/80 light:text-black/80 rounded-lg hover:text-white hover:light:text-gray-500 px-2 py-1 hover:bg-white hover:bg-opacity-10"
              >
                {t("journey.editVariable")}
              </button>
              <ConfirmAction
                label={t("journey.deleteVariable")}
                description={t("journey.deleteVariableHint", {
                  name: variable.key,
                })}
                onConfirm={handleDelete}
              />
            </>
          )}
        </td>
      </tr>
      <Modal
        trapFocus
        ariaLabel={t("journey.editVariable")}
        isOpen={isOpen}
        onClose={savingVariable ? undefined : closeModal}
      >
        <EditVariableModal
          variable={variable}
          closeModal={closeModal}
          onRefresh={onRefresh}
          onBusyChange={setSavingVariable}
        />
      </Modal>
    </>
  );
}
