import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ModalInput } from "@/components/lib/Modal";
import { MIMO_DEFAULTS } from "@/utils/chat/mimo";

export default function MiMoOptions({ settings = {} }) {
  const { t } = useTranslation();
  const [base, setBase] = useState(
    settings.GenericOpenAiBasePath || MIMO_DEFAULTS.GenericOpenAiBasePath
  );
  const [key, setKey] = useState(
    settings.GenericOpenAiKey ? "*".repeat(20) : ""
  );
  return (
    <div className="flex flex-col gap-5 max-w-[640px]">
      <ModalInput
        label={t("simple.key")}
        type="password"
        name="GenericOpenAiKey"
        value={key}
        onChange={(e) => setKey(e.target.value.trim())}
        required
        autoComplete="off"
        placeholder={t("mimo.keyPlaceholder")}
      />
      <p className="text-xs text-theme-text-secondary leading-5">
        {t("mimo.keyHint")}{" "}
        <a
          href="https://platform.xiaomimimo.com/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          {t("simple.getKey")}
        </a>
      </p>
      <ModalInput
        label={t("simple.modelLabel")}
        name="GenericOpenAiModelPref"
        defaultValue={
          settings.GenericOpenAiModelPref ||
          MIMO_DEFAULTS.GenericOpenAiModelPref
        }
        required
        list="mimo-models"
        autoComplete="off"
        hint={t("mimo.modelHint")}
      />
      <datalist id="mimo-models">
        <option value="mimo-v2.6-flash" />
        <option value="mimo-v2.6-pro" />
      </datalist>
      <details className="text-sm text-theme-text-secondary">
        <summary className="cursor-pointer">{t("mimo.advanced")}</summary>
        <div className="flex flex-col gap-4 mt-4">
          <ModalInput
            label={t("mimo.base")}
            name="GenericOpenAiBasePath"
            type="url"
            value={base}
            onChange={(e) => {
              setBase(e.target.value);
              setKey("");
            }}
            required
            pattern="https://(api|token-plan-[a-z0-9]+(?:-[a-z0-9]+)*)\.xiaomimimo\.com/v1/?"
            hint={t("mimo.baseHint")}
          />
          <ModalInput
            label={t("mimo.context")}
            name="GenericOpenAiTokenLimit"
            type="number"
            min={1}
            defaultValue={
              settings.GenericOpenAiTokenLimit ||
              MIMO_DEFAULTS.GenericOpenAiTokenLimit
            }
            required
          />
          <ModalInput
            label={t("mimo.output")}
            name="GenericOpenAiMaxTokens"
            type="number"
            min={1}
            max={131072}
            defaultValue={
              settings.GenericOpenAiMaxTokens ||
              MIMO_DEFAULTS.GenericOpenAiMaxTokens
            }
            required
            hint={t("mimo.budgetHint")}
          />
        </div>
      </details>
    </div>
  );
}
