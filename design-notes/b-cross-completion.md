# B 端与 MakeNow 路径补全记录

2026-09-27。本地研究原型使用虚构记录和会话存储，操作结果不代表真实后台、权限或跨站接口已接通。

已修的确定断点：下架中的作品／帖子审核通过后保持下架，需单独恢复；B 列表可按标题、摘要、作者和对象 ID 查找；MakeNow 作者首次维护从独立私有对象开始，不复制已公开样例的公开身份；同一成果回流保留同次动作，重新发布需显式发起；快速重复点击复制项目不会生成两个副本；公开版本更新失败可重试。推荐配置变动现在会通知 C 端；B 展示位默认与当前 C 首页的手机／电脑入口一致，发布后的有效目标、端侧和顺序通过 `c-prototype/slots.ts` 读取。Banner 素材标题保留，目标指向现有“生图挑战”ID；未知活动及专题目标不发布。B 圈子样例与 C 圈子使用同名稳定 ID，关闭后 C 停止发现和圈内发帖，原帖仍留在社区。

| B 页面 | 主要操作与去向 |
| --- | --- |
| `works/posts/tutorials/apps/resources` | 按条件找对象 → 对应 `*-edit`、`preview`、`references`；新建后进入同 ID 编辑。 |
| `work-edit/post-edit/tutorial-edit/app-edit/resource-edit` | 保存私有草稿 → 预览；提交 → `review`；能力更新另经 `verify`，维护权到 `transfer`，记录到 `history`。 |
| `preview` | 切换公开版／编辑版 → 编辑或 `release`。 |
| `reviews/review` | 待审列表 → 同 ID 审核；退回回编辑，通过后作品／帖子按可见状态生效，教程／应用／资源到 `release`。 |
| `release/verify` | 检查资料、引用与能力 → 发布、暂停、下架、恢复或删除；公开结果由 C 端按对象 ID 消费。 |
| `references/transfer/history` | 查看引用影响、确认交接、回查同一对象记录。 |
| `op-topics/op-topic-edit` | 专题列表 → 编辑五类公开对象引用与顺序 → 发布或下线；C 专题列表与详情读取同 ID 公开编排。 |
| `op-circles/op-circle-edit` | 圈子列表 → 同 ID 维护配置或关闭；C 圈子根据关闭状态停止发现／新发。 |
| `op-taxonomy` | 添加、排序、停用分类标签；历史内容不改。 |
| `op-features` | 分别编排作品和帖子 → 预览 → 发布；C 首页／社区通过已发布推荐读取。 |
| `op-slots` | 编辑 Banner／金刚位 → 预览 → 发布；C 首页读取有效设备和目标。 |
| `op-events/op-event-edit/op-submissions` | 六个现有活动按 code 展示／结束；新活动只存草稿；C 同 ID 投稿进入 B，资格、评审与奖励分开回写 C。 |
| `op-points/op-shop` | 社区积分记录仅承接既有社区业务及轻创作任务的预占、消耗和释放；AI 应用费用与任务由 MakeNow 承接，不进入社区积分任务。商品配置按同 ID 发布到 C 商城，兑换记录在 B 查询。 |
| `op-permissions` 与内容治理 | 职责变更单独保存；B 端独立审核治理可依规下架违规内容，使目标详情不可访问。本期移除 `op-reports` 用户举报处理路径。 |

| MakeNow 页面 | 主要操作与去向 |
| --- | --- |
| `project/share/version` | 看指定公开项目 → 调整分享范围 → 更新或撤回公开版本；返回原社区内容。 |
| `copy/library/editor/derivative` | 在许可范围复制公开版本 → 找到个人副本 → 编辑 → 按取得时授权决定衍生工程分享。 |
| `results/link/return/return-status` | 选择成果 → 核对双端账号 → 同次回流确认／结果待确认查询 → 社区私人作品编辑。 |
| `workflow/workflow-import` | 阅读 ComfyUI 资源真实条件 → 文件与依赖检查 → 到个人项目；不宣称自动运行。 |
| `maintain/maintain-tutorial/maintain-resource/maintain-status` | 作者查看授权对象 → 保存或提交私有修改 → 查看审核／返修／待发布进度，正式发布留在 B 端。 |
| `review` | 查看跨产品流程说明与示例路径。 |

待确认：真实专题分组与封面素材尚无输入，当前以单组和原封面承接。新活动缺完整 C 端规则及可识别 ID，当前仅存草稿，不成为可发布目标。分类与标签停用未约定对历史筛选的影响规则，当前只保存 B 配置。运营配置、审核与 MakeNow 分享在这里均为本机会话演示，不具备生产接口核验。首页保留现有本地 Banner 素材，B 展示位仅记录其 `cover` 名称与目标，不承担素材上传。

点击验收建议：B `work-edit?id=work-1` 下架→修改→审核通过，确认仍下架并单独恢复；`op-slots` 改目标／停用／发布后看手机与 PC 首页；`op-features` 移除帖子后看社区推荐；`op-events` 结束生图挑战后检查 Banner 与 C 活动入口；C 活动投稿 → B `op-submissions` 资格、评审、奖励 → C 投稿记录；B 独立审核治理下架违规帖子后检查 C 目标详情不可访问；B `op-shop` 停用商品或库存清零 → C 商城；`op-circles` 关闭 `ci-image` 后看 C 圈子旧链接与社区帖子；MakeNow `share→version→project→copy→library→editor→results→link→return→return-status→社区编辑`，分别试许可收紧、重复点击、失效与重试状态。
