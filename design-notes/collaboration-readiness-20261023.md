# GitHub 克隆与双人协作验证

日期：2026-10-23。目标：让同事从 GitHub 克隆白色 2.0 原型仓库后，本地查看、修改需求与 C/B 原型。不涉及公网部署或真实业务代码。

## 修复

- 精确补入 534 个构建输入文件，共 48.90 MiB。518 个与已有 Git 文件字节相同；其余为历史研究 Markdown，不替代当前产品需求。保留其原始内容及现有图片去重、附件哈希校验。
- `public/research-kit/**` 按原始字节检出，与既有 `research-deliveries/**` 一致，避免 Windows `core.autocrlf=true` 导致附件身份校验失败。
- 新增 `check:assets`，检查已登记的 1517 项素材输入及 367 组附件字节一致性；`--tracked` 额外检查是否进入 Git 索引。
- 新增 `dev:node`、`start:node`；开发预览可独立于 Codex/Sites/Cloudflare 账号运行。
- `COLLABORATION.md` 为两人协作入口，README 已链接。

## 已执行验证

环境：Windows，Node.js 24.14.1、npm 11.11.0、Git `core.autocrlf=true`。

先从 GitHub 的 `main`（`d3cbc2f`）创建独立克隆，不复制旧 `node_modules`、构建产物或本地缓存。首次 `npm ci --no-audit --no-fund` 成功安装 816 个包。修复前素材检查复现 534 个文件缺失；加入审查后的素材与修复文件后，验证结果如下。

| 检查 | 结果 |
|---|---|
| 素材输入 | 1517 项齐全；源工作区暂存后未跟踪项为 0，附件差异为 0 |
| TypeScript | `npx tsc --noEmit` 通过 |
| 页面需求登记 | C 端 37、B 端 50、跨产品 19，共 106 项，错误为 0 |
| `npm run build:node` | 通过，生成 `dist/standalone` |
| 构建素材校验 | 451 张图片、792 组图片字节一致性、49 组无损转换；1591 处图片引用，未发现断链 |
| 本地构建服务 | `start:node` 启动于 3181；首页、阅读台、PC 首页、移动首页、B 端及一条历史图片／附件链接均返回 200 |
| 浏览器 | 构建服务中 C 端移动原型与具体需求可展示，切换 B 端后列表和需求可展示 |
| 本地开发服务 | `dev:node -- --port 3180` 启动，浏览器确认阅读台渲染并显示需求入口 |
| 独立复核 | 检查实际暂存差异、脚本和协作说明；367 组附件的 Git blob 全部相等，两目录属性均为 `-text`，未发现阻断项 |

第二次构建修复了首次干净克隆暴露的 Windows 换行问题，没有放宽哈希校验。

## GitHub 最终克隆验证

用户授权后，修复已提交并推送到 GitHub `main`：`1d79a66f534b832194bcb629b263c1060df146e1`。

随后通过 GitHub HTTPS 地址在另一个全新目录克隆 `main`，确认 HEAD 为该提交、工作区无改动、`core.autocrlf=true`。没有从原工作区复制素材、`node_modules`、构建产物或图片缓存。

- `npm run check:assets -- --tracked`：1517 项输入齐全且全部跟踪，附件字节差异为 0。
- `npm ci --no-audit --no-fund`：成功安装 816 个包。
- `npx tsc --noEmit` 与 106 项页面需求登记：均通过。
- `npm run build:node`：通过；图片缓存命中为 0，157 项从源素材重新处理，451 张图片、792 组字节一致性、49 组无损转换校验通过，断链为 0。
- `npm run start:node`、`npm run dev:node -- --port 3180`：均成功启动；构建服务的七个代表性页面／资源地址和开发阅读台均返回 200。
- 浏览器再次确认新克隆构建服务的 C 端原型与具体需求同屏展示、B 端需求面板与作品列表可用。

本轮在 Windows / Node.js 24.14.1 实测，其他操作系统未另行复验。后续仅回写本验证记录，不改上述已验证源码。测试服务完成后停止。

GitHub 分支状态查询显示 `main` 的 `protected=false`；协作者邀请和分支保护未执行，协作流程见 `COLLABORATION.md`。

## 范围与既有问题

本轮验证开发环境、构建输入与代表性 C/B 页面，不替代所有业务状态的回归；不涉及真实接口、支付或线上写入。原有两张未跟踪临时截图未纳入修改。

历史研究区另有两处 ZIP 引用在本地也没有文件：`lib/research-brief.json` 中的 northstar 下载包，以及 `public/research-kit/research-publication.json` 历史记录中的 readiness 包。这不阻塞本轮 C/B 原型及需求预览，也未被本轮修复或声称可下载。
