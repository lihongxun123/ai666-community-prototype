# C 端双端页面对照

2026-10-05。根据当前注册表、设备导航和页面需求生成。共 37 个页面标识，PC 30 个、移动端 32 个独立评审入口。数量不含通用反馈、弹层样本及同页标签，也不代表逐页已定稿。

| 页面 | 标识 | PC 承载 | 移动端承载 | 页面需求 |
|---|---|---|---|---|
| 首页 | home | 独立评审入口；home | 独立评审入口；home | 正文存在（语义未全验） |
| 专题 | topics | 独立评审入口；topics | 独立评审入口；topics | 正文存在（语义未全验） |
| 专题详情 | topic | 独立评审入口；topic | 独立评审入口；topic | 正文存在（语义未全验） |
| AI应用 | apps | 独立评审入口；apps | 独立评审入口；apps | 正文存在（语义未全验） |
| 应用详情 | app | 独立评审入口；app | 独立评审入口；app | 正文存在（语义未全验） |
| 发现圈子 | discover-circles | 独立评审入口；discover-circles | 合并/隐藏；circles | 正文存在（语义未全验） |
| AIGC | aigc | 独立评审入口；aigc | 合并/隐藏；community?tab=works | 正文存在（语义未全验） |
| 交流 | discussion | 合并/隐藏；circles | 合并/隐藏；community?tab=talk | 正文存在（语义未全验） |
| 社区 | community | 合并/隐藏；aigc | 独立评审入口；community | 正文存在（语义未全验） |
| 帖子详情 | post | 独立评审入口；post | 独立评审入口；post | 正文存在（语义未全验） |
| 圈子 | circles | 独立评审入口；circles | 独立评审入口；circles | 正文存在（语义未全验） |
| 圈子详情 | circle | 合并/隐藏；circles | 独立评审入口；circle | 正文存在（语义未全验） |
| 教程 | tutorials | 独立评审入口；tutorials | 合并/隐藏；community?tab=tutorials | 正文存在（语义未全验） |
| 教程详情 | tutorial | 独立评审入口；tutorial | 独立评审入口；tutorial | 正文存在（语义未全验） |
| 作品详情 | work | 独立评审入口；work | 独立评审入口；work | 正文存在（语义未全验） |
| 搜索 | search | 独立评审入口；search | 独立评审入口；search | 正文存在（语义未全验） |
| 作者主页 | author | 独立评审入口；author | 独立评审入口；author | 正文存在（语义未全验） |
| 创作与发布入口 | creation-entry | 合并/隐藏；create | 独立评审入口；creation-entry | 正文存在（语义未全验） |
| AIGC 生成 | create | 独立评审入口；create | 独立评审入口；create | 正文存在（语义未全验） |
| AIGC 查看结果 | create-result | 独立评审入口；create-result | 合并/隐藏；create-result | 正文存在（语义未全验） |
| 发布作品 | post-edit | 独立评审入口；post-edit | 独立评审入口；post-edit | 正文存在（语义未全验） |
| 发布帖子 | post-publish | 独立评审入口；post-publish | 独立评审入口；post-publish | 正文存在（语义未全验） |
| 我的 | mine | 独立评审入口；mine | 独立评审入口；mine | 正文存在（语义未全验） |
| 关注作者 | my-relations | 合并/隐藏；mine?panel=following | 独立评审入口；my-relations | 正文存在（语义未全验） |
| 我的粉丝 | my-fans | 合并/隐藏；mine?panel=fans | 独立评审入口；my-fans | 正文存在（语义未全验） |
| 我的圈子 | my-circles | 合并/隐藏；mine?panel=circles | 独立评审入口；my-circles | 正文存在（语义未全验） |
| 编辑资料 | profile-edit | 独立评审入口；profile-edit | 独立评审入口；profile-edit | 正文存在（语义未全验） |
| 登录 | login | 独立评审入口；login | 独立评审入口；login | 正文存在（语义未全验） |
| 消息中心 | notifications | 独立评审入口；notifications | 独立评审入口；notifications | 正文存在（语义未全验） |
| 活动中心 | activities | 独立评审入口；activities | 独立评审入口；activities | 正文存在（语义未全验） |
| 活动详情 | activity | 独立评审入口；activity | 独立评审入口；activity | 正文存在（语义未全验） |
| 积分中心 | points | 独立评审入口；points | 独立评审入口；points | 正文存在（语义未全验） |
| 每日签到 | checkin | 独立评审入口；checkin | 独立评审入口；checkin | 正文存在（语义未全验） |
| 邀请有礼 | invite | 独立评审入口；invite | 独立评审入口；invite | 正文存在（语义未全验） |
| AI 商城 | shop | 独立评审入口；shop | 独立评审入口；shop | 正文存在（语义未全验） |
| 兑换弹层 | shop-exchange | 独立评审入口；shop-exchange | 独立评审入口；shop-exchange | 正文存在（语义未全验） |
| 兑换记录 | shop-records | 独立评审入口；shop-records | 独立评审入口；shop-records | 正文存在（语义未全验） |

来源：C 原型五组页面注册、navigation-model.ts、page-requirements-c.json。复核命令：node design-notes/c-requirements-20261005/check-device-coverage.mjs。参数化入口及行为需要另行浏览器验证。
