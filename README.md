# DocAI

让资料，变成答案。

DocAI 是基于 [AnythingLLM](https://github.com/Mintplex-Labs/anything-llm) 二次开发的 AI 文档工作台，提供中文界面、资料库问答和模型连接设置。

## 功能

- 上传文档，在当前对话中提问，或整理到长期资料库。
- 使用检索增强生成（RAG）查找相关内容，结合文档来源回答问题。
- 连接小米 MiMo、DeepSeek、OpenAI 兼容服务或上游支持的其他模型。
- 通过设置页管理模型、界面与安全选项；高级功能按需展开。
- 保留上游的 Agent、工作流、MCP 等扩展能力。

本版本着重打磨中文桌面端的首次使用和资料问答流程。高级能力继承自上游，尚未逐项完成验收。

## 本地运行

需要 Node.js 18.12.1 或以上，以及首次安装依赖时的网络连接。使用 Yarn Classic 1.22.22 和仓库内已有的锁文件。

```sh
git clone https://github.com/liuyvbo2026/docai.git
cd docai

npm install --prefix .local/tools yarn@1.22.22
node .local/tools/node_modules/yarn/bin/yarn.js --cwd frontend install --frozen-lockfile
PUPPETEER_CACHE_DIR="$PWD/.local/puppeteer" node .local/tools/node_modules/yarn/bin/yarn.js --cwd server install --frozen-lockfile
PUPPETEER_CACHE_DIR="$PWD/.local/puppeteer" node .local/tools/node_modules/yarn/bin/yarn.js --cwd collector install --frozen-lockfile

npm run local:init
npm run local:dev
```

打开 <http://127.0.0.1:3100>，在设置中选择模型并填写自己的 API Key。首次使用内置嵌入模型时，可能需要下载模型文件。

启动脚本管理前端（3100）、主服务（3101）和文件解析服务（3188），仅监听本机回环地址。按 `Ctrl+C` 停止服务；可用以下命令检查状态：

```sh
npm run local:check
```

已有依赖和配置的 macOS 用户也可以双击 `启动.command`。再次初始化会保留已有配置和数据。

## 开发与验证

```sh
node --test scripts/tests/*.test.mjs scripts/tests/*.test.cjs
npm --prefix frontend run build
```

- `frontend/`：React 界面与产品交互。
- `server/`：聊天、资料库、模型与 Agent 接口。
- `collector/`：文件读取和内容提取。
- `scripts/local-workspace.mjs`：本地初始化、启动和健康检查。
- [开发说明](DEVELOP.zh-CN.md)：详细流程与历史验收记录。

仓库只包含源码、资源和配置示例。本地 API Key、环境配置、上传资料、聊天数据库、依赖和构建产物不随代码上传。运行数据保存在本机 `server/storage/`；选择云端模型时，相应请求会发送给所选服务商。

## 上游与许可

基于 AnythingLLM 1.18.0，起始提交为 [`8239cd85a22d847337215988c69a8d1c0fba3c94`](https://github.com/Mintplex-Labs/anything-llm/commit/8239cd85a22d847337215988c69a8d1c0fba3c94)。本仓库以当前 DocAI 源码快照作为独立的初始提交。

遵循 [MIT License](LICENSE)，保留 Mintplex Labs 的版权与许可声明。上游发布、镜像和赞助相关的 GitHub Actions 未启用；后续可以为 DocAI 单独配置 CI。
