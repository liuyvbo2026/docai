import { isMiMoEndpoint } from "./mimo.js";
// Only flag settings we can positively identify as missing. Local services,
// routers and unknown providers must not be treated as requiring a cloud key.
const REQUIRED_KEYS = {
  deepseek: "DeepSeekApiKey",
  openai: "OpenAiKey",
  anthropic: "AnthropicApiKey",
  gemini: "GeminiLLMApiKey",
  openrouter: "OpenRouterApiKey",
};

export function chatSetupState(settings, workspace = {}) {
  if (!settings) return { missing: false, provider: null };
  const provider = workspace?.chatProvider || settings.LLMProvider;
  const key =
    provider === "generic-openai" &&
    isMiMoEndpoint(settings.GenericOpenAiBasePath)
      ? "GenericOpenAiKey"
      : REQUIRED_KEYS[provider];
  return {
    provider,
    missing: !provider || (!!key && settings[key] === false),
  };
}
