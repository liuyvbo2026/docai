#!/bin/zsh
cd "$(dirname "$0")" || exit 1
export PATH="$HOME/.local/node/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  echo "没有找到 Node.js。请先安装 Node.js 后重新打开。"
  read -r "?按回车退出。"
  exit 1
fi
node scripts/local-workspace.mjs start
result=$?
if [ "$result" -ne 0 ]; then
  echo "启动失败，请查看上方提示及 DEVELOP.zh-CN.md。"
  read -r "?按回车退出。"
fi
exit "$result"
