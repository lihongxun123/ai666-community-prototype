# 研究室阿里云部署

2026-10-07 已发布至 https://research.yuandaokeji.com/ 。研究室、C 端 PC/移动端与 B 端原型共用此入口；这是研究与原型展示服务，不代表真实业务系统上线。原 Sites 发布保持第 61 版。

## 待部署版本（2026-10-09）

源码 `d0bc4b6` 已推送至 GitHub main。包含 AI应用内容与后台维护、专题分组、MakeNow演示链路及搜索两组各4张推荐。独立Node构建、类型、106项需求登记、2300处图片引用与定向独立复核通过；构建包搜索卡片数量、无溢出、无破图及详情跳转已验证。

- 待发布版本：`20261009-01`，尚未上传或切换正式服务。
- 包：根仓库 `tmp/research-20261009-01-node.tar.gz`。
- SHA-256：`8f42965fbba532aa7acbed1d0f178204b5ca93f4303543167baf4ffbbec75c1c`。
- 当前阻碍：本机未建立该服务器可信SSH连接；阿里云当前会话杭州资源为0，无法进入既有实例。恢复访问后先核对运行版本、磁盘和容器，再按下方更新步骤执行。不得把下方历史发布目录当成已实时核验的现状。

## 上次已记录发布

- 发布目录：`/opt/research-room/releases/20261007-02`。
- Compose、非敏感发布目录变量：`/opt/research-room/compose.yaml`、`/opt/research-room/.env`。
- 容器：`research-room`，只监听主机 `127.0.0.1:3100`，由现有 OpenResty 代理；内存上限 1 GiB，自动重启与日志轮转已配置。
- 独立站点配置：`/opt/1panel/www/conf.d/research.yuandaokeji.com.conf`。
- 安装包：`/home/admin/research-20261007-02-node.tar.gz`，188989512 字节。
- SHA-256：`c81dd6543f3cac5a3a0b92b960d6c07f99e4a07cc038af75fa8fee616fc3271d`，服务器校验通过。
- 本地对应产物：仓库 `tmp/research-release-20261007/dist/standalone`。源码提交 `5fe8ac1b0aa6a08aed2b35ff1122fdc70de17e0a`，GitHub 标签 `research-20261007-02`。包含当前 C/B 原型及两期需求阅读台；第二期设计进行中。
- 回退目录：`/opt/research-room/releases/20261007-01`；上一配置保存在 `.env.previous-20261007-02`。

## 更新与回退

在独立构建副本安装锁定依赖，运行 `npm run build:node`，打包 `dist/standalone` 内容。不要与正在运行的开发服务共用 dist。脚本保留原 Sites 构建；Node 模式修正 vinext 1.0.0-beta.5 将 `_next` 静态资源误列为运行依赖的问题，并移除 standalone 中重复的 public 副本。升级 vinext 后应重新验证此处理。

上传并核对压缩包哈希后，解压至新的 `/opt/research-room/releases/<版本>`，确保容器用户可读。修改 `.env` 中 `RESEARCH_RELEASE` 指向新版本，然后执行：

```sh
sudo docker compose --project-directory /opt/research-room -f /opt/research-room/compose.yaml up -d
sudo docker inspect --format '{{.State.Health.Status}}' research-room
```

保留上一版本目录，更新失败时把 `RESEARCH_RELEASE` 改回并重新执行上述命令。首次部署没有上一应用版本；停用时仅停止此 Compose 服务，并将此域名配置移出 conf.d 后检查、平滑重载 OpenResty。不要停止整个 OpenResty 或其他业务容器。

## HTTPS 与续期

HTTP 自动 301 跳转 HTTPS。首张证书有效期至 2027-01-03。证书目录为 `/opt/1panel/www/sites/research.yuandaokeji.com/letsencrypt`；私钥不进入源码或交接包。

`research-cert-renew.timer` 已启用，每天 03:00 起随机延迟一小时内检查；证书变化时脚本检查并平滑重载 OpenResty。续期使用独立 Certbot 配置和 ACME 目录。`renew --dry-run` 成功，systemd service 手动运行结果 success，timer 状态 active。

```sh
sudo systemctl status research-cert-renew.timer
sudo journalctl -u research-cert-renew.service -n 30
```

## 验证范围

本轮类型检查、106项页面需求登记及独立Node构建通过；2293处图片引用与449张图片检查无断链。发布前独立复核发现并修正跨端结果状态与分期历史入口问题。原C端62个正常入口、B端50页及必要状态检查详见 design-notes 下各最终检查报告，不代表全部真实接口或生产数据验收。

服务器安装包SHA-256与本地一致。容器healthy；HTTPS返回200、HTTP返回301。线上检查B端增长分析、C端PC/移动首页、两期分组与第二期设计进行中说明，页面正常加载。原有8个容器保持运行，磁盘约22 GiB可用。

包根目录RELEASE.json记录发布目录与源码提交；版本以包哈希、容器挂载目录及发布提交共同核对。既有lint与浏览器日志限制沿用专项报告，不声称全局零错误。

上线截图：仓库 `tmp/research-live-20261007-02.png`。真实AI666业务系统未发布。
本次增量：阅读台集中公共说明、简化分期名称与状态、移除顶部范围卡片、隐藏单正常状态入口；移动作品卡不显示副标题，PC保持原样。类型、106项需求登记、独立构建、图片引用与定向独立复核通过，正式页面抽查通过。
