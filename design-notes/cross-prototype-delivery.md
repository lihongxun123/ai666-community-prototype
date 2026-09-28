# 跨产品原型交付

日期：2026-09-26。交付范围为研究站内的产品原型，入口 `/community-options/cross-prototype?page=project`。源文件位于 `app/community-options/cross-prototype/`；`page.tsx` 可独立运行，`data.ts` 导出 `crossPages` 元数据，`cross.css` 负责布局。需求依据为 `requirements-cross-product.md`、`requirements-b-content.md` 第 8 节及 `product-requirements-review.md`。

## 走查路径

1. 作者从 `share` 选择仅成果／查看／复用及衍生再次分享选项，确认素材许可后保存。`version` 分开维护私人版本与公开版本，可主动更新或撤回。
2. 访客在 `project` 查看公开版本。仅允许复用时可进 `copy`，确认条件后生成独立个人副本；`library` 找回，`editor` 查看来源与个人项目，`derivative` 按取得副本时的上游许可决定能否分享自己的工程。
3. 从 `results` 选择一件已有成果，首次经 `link` 核对两端身份，在 `return` 确认，`return-status` 找回同次操作，再进入 C 端 `post-edit` 主动编辑和提交。进入时传 `cp-source=MakeNow`、选中成果 `cp-result`、作品类型及原活动标记。回流不是自动公开。
4. `workflow` 展示 ComfyUI 资源的版本、依赖、许可和设备条件；`workflow-import` 承接取用清单下载与电脑端导入前核对，缺文件、缺依赖、无许可和不兼容各有独立状态。
5. 获授权作者从 `maintain` 查看本人教程／资源，经 `maintain-tutorial`、`maintain-resource` 保存草稿、预览及提交，`maintain-status` 承接返修与正式公开前状态。无资格入口隐藏；手机以查看状态和电脑端继续为主。AI 应用仍由平台承接供稿或更新申请。

页面元数据共 18 项、84 个声明状态。`/community-options/cross-prototype/states` 平铺全部页面状态；也可用 `?page=<id>&state=<state>` 直接查看异常。`review` 是独立的原型边界页，不混入消费路径。项目入口可带 `source=resource`、`source=app&item=video` 或 `source=mine`；返回社区时按来源去向承接。`source=app&item=video` 使用“产品短片制作”独立应用交接画面，不套用旧照修复工程及其成果。资源入口同时读取本地 B 原型公开状态、运行状态和公开复用权限，受限时不提供复制。活动从 C 端 `cp-activity` 继承，结束状态仍保留私人结果并由 C 端显式处理取消活动关联。

## 边界与待落实

本地会话保存虚构作者林间、旧照修复参考工程、公开版本 1.2、权限设置和个人副本。作者维护使用本地 B 原型共享对象 `tutorial-author`、`resource-author`：提交更新只改待审编辑版，原公开版保持不变；退回、审核通过和正式发布由同一对象的 B 状态驱动维护进度。这两个示例对象分别显示为“旧照修复：作者实践笔记”“旧照修复参考工程（作者维护）”，独立于 B 原有 `tutorial-1`、`resource-1` 验证样例；它们是演示对象，不是新业务类型。页面行为不连接真实 MakeNow、ComfyUI、社区账户或审核服务，不执行生成、扣费、发布和跨站身份校验。下载的是取用条件清单，不是已经核验可运行的 ComfyUI 工程。真实文件、节点、模型、素材许可和导入兼容性仍需逐项核验。

产品规则已确认，但实际接口、权限即时收紧和旧链接校验、多级许可链存证、身份关联、回流动作去重、活动资格、作者资格及后台正式发布仍需研发核验。原型的本地状态不证明这些能力已接通。社区 `post-edit` 仍是独立原型，真实重复提交防护须由服务端实现；本原型只保持同次本地回流标识，并在可识别已提交记录时导向原状态。

定向检查：`npx oxlint app/community-options/cross-prototype/page.tsx app/community-options/cross-prototype/data.ts app/community-options/cross-prototype/states/page.tsx`；`npx tsc --noEmit --pretty false`。本地浏览器走查覆盖公开项目、复制、更新／撤回、旧副本、回流及手机宽度；截图记录在 `output/playwright/`。


