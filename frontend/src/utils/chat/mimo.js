export const MIMO_DEFAULTS = {
  GenericOpenAiBasePath: "https://api.xiaomimimo.com/v1",
  GenericOpenAiModelPref: "mimo-v2.6-flash",
  // Conservative application budgets for initial testing, not model limits.
  GenericOpenAiTokenLimit: 32768,
  GenericOpenAiMaxTokens: 8192,
};
export function isMiMoEndpoint(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      /^(api|token-plan-[a-z0-9-]+)\.xiaomimimo\.com$/.test(url.hostname)
    );
  } catch {
    return false;
  }
}
export function mimoPreset(settings = {}) {
  return isMiMoEndpoint(settings?.GenericOpenAiBasePath)
    ? { ...MIMO_DEFAULTS, ...settings }
    : { ...settings, ...MIMO_DEFAULTS, GenericOpenAiKey: false };
}
