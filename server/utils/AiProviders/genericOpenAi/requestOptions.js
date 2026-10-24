function genericMaxTokensKey(basePath, override) {
  if (override) return override;
  try {
    const url = new URL(basePath);
    if (
      url.protocol === "https:" &&
      /^(api|token-plan-[a-z0-9-]+)\.xiaomimimo\.com$/.test(url.hostname)
    )
      return "max_completion_tokens";
  } catch {}
  return "max_tokens";
}
module.exports = { genericMaxTokensKey };
