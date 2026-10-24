import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import System from "@/models/system";

export default function DeepSeekOptions({ settings }) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(settings?.DeepSeekApiKey || "");
  const [apiKey, setApiKey] = useState(settings?.DeepSeekApiKey || "");
  useEffect(() => {
    const timer = setTimeout(() => setApiKey(inputValue), 600);
    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <div className="flex flex-col gap-6 mt-2 max-w-[640px]">
      <div className="flex flex-col">
        <label
          htmlFor="deepseek-api-key"
          className="text-theme-text-primary text-sm font-semibold mb-3"
        >
          {t("simple.key")}
        </label>
        <input
          id="deepseek-api-key"
          type="password"
          name="DeepSeekApiKey"
          className="border-none bg-theme-settings-input-bg text-theme-text-primary placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button outline-none block w-full p-3"
          placeholder={t("simple.keyPlaceholder")}
          defaultValue={settings?.DeepSeekApiKey ? "*".repeat(20) : ""}
          required
          autoComplete="off"
          spellCheck={false}
          aria-describedby="deepseek-key-help"
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => setApiKey(inputValue)}
        />
        <p
          id="deepseek-key-help"
          className="text-theme-text-secondary text-xs leading-5 mt-2"
        >
          {t("simple.keyHint")}{" "}
          <a
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            {t("simple.getKey")}
          </a>
        </p>
      </div>
      {!settings?.credentialsOnly && (
        <DeepSeekModelSelection
          settings={settings}
          apiKey={apiKey}
          pending={inputValue !== apiKey}
        />
      )}
    </div>
  );
}

function DeepSeekModelSelection({ apiKey, settings, pending }) {
  const { t } = useTranslation();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selection, setSelection] = useState(settings?.DeepSeekModelPref || "");

  useEffect(() => {
    let active = true;
    setModels([]);
    setFailed(false);
    setLoading(!!apiKey);
    if (apiKey) {
      System.customModels(
        "deepseek",
        typeof apiKey === "boolean" ? null : apiKey,
        null,
        15000
      )
        .then(({ models: available = [], error }) => {
          if (!active) return;
          setModels(available);
          setFailed(!!error || !available.length);
          setSelection((previous) =>
            available.some((m) => m.id === previous)
              ? previous
              : available.find((m) => m.id === "deepseek-chat")?.id ||
                available[0]?.id ||
                ""
          );
        })
        .catch(() => {
          if (active) setFailed(true);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [apiKey, attempt]);

  const ready =
    !!apiKey && !loading && !pending && !failed && models.length > 0;
  return (
    <div className="flex flex-col">
      <label
        htmlFor="deepseek-model"
        className="text-theme-text-primary text-sm font-semibold mb-3"
      >
        {t("simple.modelLabel")}
      </label>
      <select
        id="deepseek-model"
        name="DeepSeekModelPref"
        required
        value={ready ? selection : ""}
        onChange={(e) => setSelection(e.target.value)}
        aria-describedby="deepseek-model-status"
        className="border-none bg-theme-settings-input-bg text-theme-text-primary text-sm rounded-lg block w-full p-3"
      >
        {!ready && (
          <option value="" disabled>
            {!apiKey && !pending
              ? t("simple.needKey")
              : loading || pending
                ? t("simple.modelsLoading")
                : t("simple.modelsError")}
          </option>
        )}
        {ready &&
          models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.id === "deepseek-chat"
                ? t("simple.recommendedModel")
                : model.name}
            </option>
          ))}
      </select>
      <div
        id="deepseek-model-status"
        role="status"
        className="text-theme-text-secondary text-xs leading-5 mt-2"
      >
        {ready && <span>{t("simple.modelHelp")}</span>}
        {failed && !loading && (
          <>
            <span>{t("simple.modelsError")}</span>{" "}
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="underline underline-offset-2"
            >
              {t("simple.retry")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
