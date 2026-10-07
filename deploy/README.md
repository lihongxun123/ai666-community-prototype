# 研究室阿里云部署

2026-10-06 已发布至 https://research.yuandaokeji.com/ 。研究室、C 端 PC/移动端与 B 端原型共用此入口；这是研究与原型展示服务，不代表真实业务系统上线。原 Sites 发布保持第 61 版。

## 当前发布

- 发布目录：`/opt/research-room/releases/20261006-01`。
- Compose、非敏感发布目录变量：`/opt/research-room/compose.yaml`、`/opt/research-room/.env`。
- 容器：`research-room`，只监听主机 `127.0.0.1:3100`，由现有 OpenResty 代理；内存上限 1 GiB，自动重启与日志轮转已配置。
- 独立站点配置：`/opt/1panel/www/conf.d/research.yuandaokeji.com.conf`。
- 安装包：`/home/admin/research-20261006-node.tar.gz`，187441772 字节。
- SHA-256：`d5067178ea96f09a7f31e95ef0790aa755ac6060c6131c819fb633d270ba4a37`，服务器校验通过。
- 本地对应产物：仓库 `tmp/research-node-build-20261006/dist/standalone`，由当时工作区快照构建，包含图片压缩及 B 端第一批作品管理原型；不是新的 Git 提交或 Sites 版本。

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

类型检查、Node 构建、2279 处图片引用检查通过；独立复核检查运行依赖、262 个服务端 JS 文件的相对导入及静态资源完整性，通过。安装包跨 Windows/Linux 无原生二进制依赖。

线上浏览器已检查研究室首页、进入原型、C 端 PC/手机首页、B 端作品管理及返回研究室，页面和图片正常加载。服务器直连 HTTPS 严格证书校验返回 200，HTTP 返回 301；研究室容器 healthy，原有 8 个运行中容器保持运行。部署后磁盘 df 显示约 22 GiB 可用，研究室瞬时内存 160.6 MiB。

浏览器日志存在仅显示 `Object` 的 console.error 条目，尚不能据此定位来源；未将此检查表述为控制台零错误或全量业务验收。本轮验证是部署与入口检查，逐页产品确认及真实接口验收沿用原交接边界。

上线截图：仓库 `tmp/research-live-20261006.jpg`。
