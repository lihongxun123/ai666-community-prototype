# GitHub 构建与人工审批部署

## 两人日常流程

任务分支 → PR → 另一人审核 + Build and checks 通过 → 合并 main → 重新构建 → lihongxun123 批准后才部署。

`main` 禁止直接推送、强制推送和删除，管理员也适用；必须解决 PR 对话、同步最新主线，最后推送由另一人批准，新提交会撤销旧批准。所有者自己的 PR 也需要同事审核，同事须先接受邀请。

Actions 的 `Research checks and release` 检查素材、类型、需求，构建 Node standalone，启动服务检查 7 个入口，并在无网络容器中运行部署与回滚模拟。PR 不取得服务器凭据。手动 Run workflow 只构建，不触发部署。合并 main 后生成保留 7 天的制品，部署等待 `research-production` 环境审批。

## 你或运维一次性配置

在仓库 Settings → Environments → **research-production** → Environment secrets 填写以下五项，不放进代码、聊天或普通变量：

| Secret | 内容 |
| --- | --- |
| RESEARCH_SSH_HOST | 原服务器 SSH 域名或 IPv4，不含协议和端口 |
| RESEARCH_SSH_PORT | SSH 端口，包含使用默认端口时的 22 |
| RESEARCH_SSH_USER | 专用部署账号 |
| RESEARCH_SSH_PRIVATE_KEY | 专用 SSH 私钥全文，供非交互登录使用 |
| RESEARCH_SSH_KNOWN_HOSTS | 运维通过可信渠道核实主机指纹后的 known_hosts 行；非 22 端口使用 [host]:port |

环境只允许 main 分支，审批人仅 lihongxun123，禁止管理员绕过；允许审批自己的运行，便于你批准自己合并的版本。代码审核与部署批准是两道独立关卡。

运维核对现有服务器满足以下条件后，再安排首次真实部署：

- 沿用 `/opt/research-room/compose.yaml`、`.env`，服务名 `research`、容器名 `research-room`，本机端口 `127.0.0.1:3100`。`.env` 恰有一条 `RESEARCH_RELEASE`，指向 releases 内现有真实版本目录。
- `/opt/research-room/incoming`、`releases` 已创建，均非符号链接。账号可写入这些目录、根目录和 `.env`，可以备份并切换版本。
- 已有 Bash、Python 3、curl、flock、sha256sum、Docker Compose 和当前 compose 固定的运行时镜像。脚本不安装软件、不拉取新镜像、不修改 compose 或 OpenResty。
- 账号具备操作 Docker 的权限；Docker 权限属于服务器高权限，由运维决定账号和访问控制。GitHub runner 可以经 SSH 访问服务器，服务器可访问 GitHub 公共 API 和研究站 HTTPS。
- 固定 known_hosts 需与实际 SSH 主机一致，不以关闭主机验证解决连接问题。

2026-10-23 已配置五项环境凭据、专用部署账号与上传目录；本机 SSH/SFTP、目录权限和 Docker 只读访问验证通过，线上版本仍为 20261010-01。GitHub 云端连接检查须以独立工作流的实际运行结果为准；实际发布和回滚尚未验证。离线回滚测试使用模拟 Docker、网络和锁，不能替代首次部署验收。

## 每次部署由你确认

打开 Actions 对应 main 的运行，核对提交、Build and checks 和制品，再点击 Review deployments，选 research-production 后批准。只有此时部署任务才可取得环境凭据。无需发布时拒绝或取消运行。首次配置验证会取消等待中的部署，不发布。

脚本校验 SHA256、版本元数据和归档路径；使用新版本目录，只更新 `.env` 的 `RESEARCH_RELEASE` 并重建 research 服务，保留其他字段与旧版本。GitHub runner 和服务器锁内都会核对 main，过期提交拒绝部署。部署期间不自动取消正在执行的发布。

容器健康、挂载目录、本机原型入口和公网原型入口均正常才算完成；切换后的失败触发恢复原 `.env` 和旧版本健康检查。出现 `ROLLBACK FAILED` 须运维处理，不能假定已恢复。主机断电、强制终止等情况也需运维核查。

若失败发生在解压前，可重跑失败任务；只要已创建版本目录（包括已回滚），请选择 **Re-run all jobs**，重新构建得到新的版本号，避免覆盖旧版本。制品超过 7 天也须重新全量运行。只重跑部署会沿用原构建的版本号和制品。

历史手动部署与回退步骤见 [README.md](README.md)。本流水线仅服务研究站及其 C/B 原型，不部署真实社区业务系统。

## 只检查连接，不部署

手动运行 **Research connection check (no deployment)**，选择 main，再批准该连接检查对 research-production 环境的访问。此工作流不接受发布参数、不下载发布制品，只检查 SSH、SFTP、目录权限位、现有容器健康、服务入口及服务器访问 GitHub API。检查前后比对配置文件摘要、容器标识、挂载和启动时间；不写服务器文件、不重启服务。权限位检查不代表已实际完成写入或回滚。

首次新增工作流须经过 PR 审核并合入 main，之后才可手动运行。合并产生的 Research checks and release 是另一条发布流程；仅做连接检查时取消它等待批准的部署任务，不批准实际发布。
