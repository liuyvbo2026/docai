const RETURN_KEY = "anythingllm-return-to-chat";

export function isChatPath(path) {
  return (
    typeof path === "string" &&
    (path === "/" || /^\/workspace\/[^/?#]+(?:\/t\/[^/?#]+)?$/.test(path))
  );
}

export function rememberChatPath(path) {
  if (!isChatPath(path)) return;
  try {
    sessionStorage.setItem(RETURN_KEY, path);
  } catch {}
}

export function returnToChatPath() {
  try {
    const path = sessionStorage.getItem(RETURN_KEY);
    return isChatPath(path) ? path : "/";
  } catch {
    return "/";
  }
}
