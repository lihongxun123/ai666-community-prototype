# 白色 2.0 社区：双人协作说明

两人共用 [ai666-community-prototype](https://github.com/lihongxun123/ai666-community-prototype) 仓库，各自在自己的电脑修改。每项任务建一个分支，另一人检查 PR 后再合并到 `main`。需求与对应原型一起交付。

## 第一次加入

仓库所有者在 GitHub 的 **Settings → Collaborators → Add people** 邀请同事；同事接受邀请后，用自己的 GitHub 账号访问和推送，不共用账号或凭据。个人仓库的 Collaborator 本身具有读写权限，不需要转移仓库所有权。

安装 Git 和 Node.js。本轮验证使用 Node.js 24.14.1、npm 11.11.0；项目声明最低 Node.js 22.13.0。先在自己选定的工作目录运行：

```sh
git clone https://github.com/lihongxun123/ai666-community-prototype.git
cd ai666-community-prototype
npm ci
npm run check:assets -- --tracked
npm run dev:node
```

打开 <http://127.0.0.1:3000/community-options/prototype-review>。在这里选择 C/B 端页面、设备和页面需求。其他直接入口：

- PC 首页：`/community-options/home-prototype`
- 移动首页：`/community-options/mobile-home`
- B 端：`/community-options/b-prototype`

`dev:node` 使用本地 Node 模式，不需要 Codex、Sites 登录、Cloudflare 账号或业务 API Key。端口占用时使用 `npm run dev:node -- --port 3180`；停止预览按 Ctrl+C。安装依赖仍需能访问 npm。

原型中的编辑、审核、发布等是本机演示状态。两人共享的是 Git 中的文件，不会同步各自浏览器中的临时数据；讨论问题时提供页面、操作步骤和截图。

## 每次修改

### 1. 约定范围，创建分支

在 Issue 或沟通中写清本次页面、业务规则和负责人。例如一人改 C 端发布流程，另一人改 B 端活动配置。公共导航、共享样式、同一页面的需求与原型由一人先完成，另一人同步后接续。

先确认 `git status` 没有需要保留的未提交工作，再执行：

```sh
git switch main
git pull --ff-only origin main
git switch -c feat/c-publish-flow
```

有未提交工作时，先在自己的任务分支保存；不要为切分支执行 `reset --hard` 或覆盖文件。

**远端名区别：**以上命令适用于同事新克隆的仓库，`origin` 指 GitHub。鸿勋现有工作区中，GitHub 叫 `github`，`origin` 是旧 Sites 源仓库，运行拉取和推送命令时要把示例中的 `origin` 换成 `github`。先用 `git remote -v` 确认，不能把本地目录名或默认远端当依据。

### 2. 修改正确的源文件

| 内容 | 维护位置 |
|---|---|
| C/B 端逐页需求 | `design-notes/page-requirements-c.json`、`page-requirements-b.json` |
| C 端公共规则、决定、跨端依赖 | `design-notes/c-requirements-20261005/` |
| 产品评审控制台 | `app/community-options/prototype-review/` |
| C 端页面 | `app/community-options/c-prototype/`，首页另在 `home-prototype/`、`mobile-home/` |
| B 端页面 | `app/community-options/b-prototype/` |
| 图片、图标等素材 | `public/` |

C 端完整需求文档是生成产物。修改页面需求、公共规则或决定后运行：

```sh
node design-notes/c-requirements-20261005/sync-delivery.mjs
node scripts/validate-page-requirements.mjs
```

不要一个人改页面 JSON，另一个人直接改生成的完整需求文档；不要例行使用 `--merge`。两个任务必须修改同一 JSON 时，约定各自负责的页面标识，合并时逐页核对。

不要编辑 `dist/`、`node_modules/` 或把本机日志、环境变量、密钥提交进仓库。历史研究素材为保持现有构建及链接而保留，不能作为最新产品决定。新增素材后运行 `npm run check:assets -- --tracked`；该检查覆盖已登记的素材依赖，新页面自己的图片也需浏览器检查。

### 3. 检查、提交、发 PR

按改动验证页面需求、受影响页面及关联 C/B 状态。共享组件或构建改动还应运行：

```sh
npm run check:assets -- --tracked
npx tsc --noEmit
npm run build:node
npm run start:node
```

`start:node` 验证构建产物，默认使用 3000 端口；先停止开发预览，再启动它。构建期间不要同时使用该工作目录的其他构建任务。现有 `build` / `start` 服务于 Sites/Cloudflare；公司 Node 版本使用 `build:node` / `start:node`。`site:workflow`、`sync:analytics` 和历史恢复脚本不属于同事的日常启动步骤。

检查 Git 差异后，只添加本次目标文件。新增依赖素材先暂存，再运行带 `--tracked` 的检查。下面路径和说明按本次任务替换：

```sh
git diff
git add app/community-options/c-prototype/目标文件.tsx design-notes/page-requirements-c.json
git diff --cached --stat
git commit -m "完善 C 端发布流程与页面需求"
git push -u origin feat/c-publish-flow
```

在 GitHub 建立 **任务分支 → main** 的 PR，写清变更目的、页面和需求位置、验证结果，并附关键截图。另一人核对后合并；合并不自动代表允许公网发布。当前仓库没有随本次改动新增自动部署流程。

### 4. 处理并行修改与冲突

任务进行中主线有更新时，先提交自己的修改，再同步：

```sh
git fetch origin
git merge origin/main
```

出现冲突时，与对方确认两边的业务意图，逐段保留正确结果；不要整文件选择“全部保留我的／对方的”。需求 JSON 冲突先解决源文件，再重新生成交付文档，检查原型行为与文字一致。完成验证后提交并正常推送，不使用强制推送。

Git 没报冲突也需要业务复核。例如 C 端改成“提交后待审核”，B 端仍展示“立即公开”，会跨文件产生矛盾。PR 审核必须覆盖受影响的跨端规则。

## 仓库所有者设置一次即可

在 GitHub 支持的情况下保护 `main`：必须通过 PR、至少一位审核者通过、禁用强制推送和删除。私有仓库的分支保护是否可用取决于账号套餐；本说明不代表已配置。暂时没有平台保护时，双方仍遵守 PR 流程，由所有者负责合并。

公网发布固定由一人负责，只发布已合并、已验证的版本；另一人不同时切换服务器版本。部署另按 `deploy/README.md` 执行，这份说明不要求同事取得服务器权限。

GitHub 官方参考：[邀请协作者](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository)、[个人仓库权限](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository)、[分支保护](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)。
