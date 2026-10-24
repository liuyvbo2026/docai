import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const host = "127.0.0.1";
const ports = { frontend: 3100, server: 3101, collector: 3188 };
const mode = process.argv[2] || "start";
const resolve = (...parts) => path.join(root, ...parts);
const secret = () => randomBytes(32).toString("hex");

function createOnce(name, contents) {
  const filename = resolve(name);
  if (existsSync(filename)) return;
  writeFileSync(filename, contents, { flag: "wx", mode: 0o600 });
  console.log(`已创建 ${name}（已有配置不会被覆盖）`);
}

function dependencies() {
  for (const file of [
    "server/node_modules/prisma/build/index.js",
    "server/node_modules/express/package.json",
    "collector/node_modules/express/package.json",
    "frontend/node_modules/vite/bin/vite.js",
  ]) {
    if (!existsSync(resolve(file))) {
      throw new Error(`缺少依赖 ${file}。请按 DEVELOP.zh-CN.md 安装依赖。`);
    }
  }
}

function run(file, args, cwd) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(process.execPath, [file, ...args], {
      cwd,
      stdio: "inherit",
      env: { ...process.env, DISABLE_TELEMETRY: "true" },
    });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolveRun() : reject(new Error(`命令失败，退出码 ${code}`)));
  });
}

async function init() {
  dependencies();
  mkdirSync(resolve("server/storage"), { recursive: true });
  createOnce("server/storage/anythingllm.db", "");
  createOnce("server/.env", [
    `SERVER_PORT=${ports.server}`,
    `SERVER_HOST=${host}`,
    `COLLECTOR_PORT=${ports.collector}`,
    `JWT_SECRET=${secret()}`,
    `SIG_KEY=${secret()}`,
    `SIG_SALT=${secret()}`,
    'VECTOR_DB="lancedb"',
    'LLM_PROVIDER="deepseek"',
    'DEEPSEEK_MODEL_PREF="deepseek-chat"',
    'EMBEDDING_ENGINE="native"',
    'DISABLE_TELEMETRY="true"',
    'STORAGE_DIR="' + resolve("server/storage").replaceAll("\\", "/") + '"',
    "",
  ].join("\n"));
  createOnce("collector/.env", `COLLECTOR_PORT=${ports.collector}\nCOLLECTOR_HOST=${host}\n`);
  createOnce("frontend/.env.local", `VITE_API_BASE=http://${host}:${ports.server}/api\n`);
  const prisma = resolve("server/node_modules/prisma/build/index.js");
  await run(prisma, ["generate"], resolve("server"));
  await run(prisma, ["migrate", "deploy"], resolve("server"));
  await run(resolve("server/prisma/seed.js"), [], resolve("server"));
  console.log("初始化完成。运行 npm run local:dev；在界面中配置自己的模型。密钥不会写入 Git。");
}

async function freePort(port) {
  await new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.once("error", (error) => reject(new Error(error.code === "EADDRINUSE"
      ? `端口 ${port} 已占用，未启动任何新服务。请先关闭本项目旧进程或释放该端口。`
      : `无法监听本地端口 ${port}：${error.code}。请检查终端的网络权限。`)));
    probe.listen(port, host, () => probe.close(resolvePort));
  });
}

async function healthy(url) {
  try { return (await fetch(url, { signal: AbortSignal.timeout(2000) })).ok; }
  catch { return false; }
}

const checks = [
  ["网页", `http://${host}:${ports.frontend}`],
  ["主服务", `http://${host}:${ports.server}/api/ping`],
  ["文件解析", `http://${host}:${ports.collector}/accepts`],
];

async function check() {
  const results = await Promise.all(checks.map(async ([name, url]) => {
    const ok = await healthy(url);
    console.log(`${ok ? "正常" : "未就绪"} ${name}: ${url}`);
    return ok;
  }));
  if (!results.every(Boolean)) process.exitCode = 1;
}

async function start() {
  dependencies();
  if (!existsSync(resolve("server/.env")) || !existsSync(resolve("server/storage/anythingllm.db"))) {
    throw new Error("请先运行 npm run local:init。");
  }
  for (const port of Object.values(ports)) await freePort(port);
  const children = [];
  let stopping = false;
  let forceTimer;
  const stop = (code = 0) => {
    if (stopping) return;
    stopping = true;
    process.exitCode = code;
    for (const child of children) if (child.exitCode === null) child.kill("SIGTERM");
    forceTimer = setTimeout(() => {
      for (const child of children) if (child.exitCode === null) child.kill("SIGKILL");
    }, 5000);
    forceTimer.unref();
  };
  process.once("SIGINT", () => stop(0));
  process.once("SIGTERM", () => stop(0));
  for (const [name, args] of [
    ["server", ["index.js"]],
    ["collector", ["index.js"]],
    ["frontend", ["node_modules/vite/bin/vite.js", "--host", host, "--port", String(ports.frontend), "--strictPort"]],
  ]) {
    const child = spawn(process.execPath, args, {
      cwd: resolve(name),
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        NODE_ENV: name === "frontend" ? "development" : "production",
        STORAGE_DIR: resolve("server/storage"),
        PUPPETEER_CACHE_DIR: resolve(".local/puppeteer"),
        SERVER_HOST: host,
        SERVER_PORT: String(ports.server),
        COLLECTOR_HOST: host,
        COLLECTOR_PORT: String(ports.collector),
        DISABLE_TELEMETRY: "true",
        ...(name === "frontend" ? { VITE_API_BASE: `http://${host}:${ports.server}/api` } : {}),
      },
    });
    children.push(child);
    for (const stream of [child.stdout, child.stderr]) {
      stream.on("data", (data) => process.stdout.write(`[${name}] ${data}`));
    }
    child.once("error", (err) => { console.error(`${name}: ${err.message}`); stop(1); });
    child.once("exit", (code) => {
      if (!stopping) { console.error(`${name} 已退出（${code}），停止其余服务。`); stop(1); }
      if (children.every((c) => c.exitCode !== null || c.signalCode !== null)) clearTimeout(forceTimer);
    });
  }
  const deadline = Date.now() + 90000;
  while (!stopping && Date.now() < deadline) {
    const ready = await Promise.all(checks.map(([, url]) => healthy(url)));
    if (ready.every(Boolean)) {
      console.log(`\n知识工作台已启动：http://${host}:${ports.frontend}\n按 Ctrl+C 停止全部服务。\n`);
      return;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 1000));
  }
  if (!stopping) { console.error("服务未在 90 秒内全部就绪，请查看以上日志。"); stop(1); }
}

try {
  if (mode === "init") await init();
  else if (mode === "start") await start();
  else if (mode === "check") await check();
  else throw new Error("用法：node scripts/local-workspace.mjs init|start|check");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
