# AI 应用形式：竞品支持对照

核查日期：2026-09-25｜供当前文字、图片、视频范围决策；不纳入音频、3D、代码交付能力

对照 RunningHub、LiblibAI（单列关联产品 LibTV 的能力）、即梦、Krea、Adobe Firefly，以及应用搭建参考 Dify。前五家偏创作产品，Dify 不按同类内容社区评价。不以功能数量判断优劣，也不将不同子产品、企业版和搭建能力拼成一个普通用户免费可用的产品。

证据来自公开产品入口、官方功能文档与教程；未登录运行或验证结果。**“有”表示官方明确提供；“搭”表示需要搭建后交付；“局”表示仅局部能力/入口明确；“待”表示本次证据不足，不代表不支持。** Beta、企业权限及外部集成另标。

## 12 种形式的支持情况

| 形式 | RunningHub | LiblibAI / LibTV | 即梦 | Krea | Firefly | Dify（搭建参考） |
| --- | --- | --- | --- | --- | --- | --- |
| 1 单次工具/表单 | 有：AI 应用 | 有：图/视频生成、AI 应用入口 | 有：图/视频生成 | 有：生成/编辑、Mini Apps | 有：生成/编辑 | 搭：Workflow 表单 |
| 2 多轮对话 | 待 | 待 | 局：对话入口，连续任务待验 | 有：Agent，Beta/权限限制 | 有：AI Assistant Beta | 搭：Chatflow |
| 3 资料/知识库 | 待 | 待 | 待 | 局：Agent 上下文资料库；非完整知识库问答承诺 | 待；不并入 Acrobat | 搭：知识检索＋对话 |
| 4 分步引导 | 局：RHSTORY 阶段式制作，界面引导待验 | 待 | 待 | 待；多步骤 Agent 不自动算引导界面 | 有：Boards Quick Guides | 搭：人工输入/确认；具体引导体验需设计 |
| 5 文档/演示编辑工作台 | 待 | 待 | 待 | 待；可生成文件不等于文档编辑器 | 待；不并入其他 Adobe 产品 | 待；生成文本不等于文档编辑器 |
| 6 自由素材画布 | 有：无限画布 | 有：LibTV 画布 | 有：智能画布 | 有：实时画布/Moodboards | 有：Boards | 待；节点编排画布不计入此类 |
| 7 时间线剪辑 | 待 | 局：LibTV 智能剪辑入口，时间线待核 | 待 | 待；Agent 调用剪辑工具不等于时间线 UI | 有：Video Editor | 待 |
| 8 节点工作流 | 搭：ComfyUI | 局：ComfyUI/工作流入口，具体编辑待验 | 待 | 搭：Nodes | 搭：Creative Production 企业权限 | 搭：Workflow/Chatflow |
| 9 目标执行 Agent | 局：官方 Agent 定位，实际任务路径待核 | 局：LibTV 站内 Agent 待验；已说明外部 Agent 接入 | 局：Agent 模式入口，执行路径待验 | 有：创作 Agent Beta | 有：AI Assistant Beta | 搭：工具调用与 Agent 流程 |
| 10 不同输入批量处理 | 待：有用户工作流样本，未验证执行 | 待 | 待 | 搭：Nodes 对一批输入应用样式 | 有：Creative Production 企业权限 | 搭：批处理/迭代 |
| 11 定时/事件自动触发 | 待；有 API 不算自带触发器 | 待 | 待 | 有：Agent Routines，Beta/权限限制 | 外部集成：Workflow API，不计原生调度 | 搭：时间/事件/Webhook 触发 |
| 12 实时图像/视频交互 | 待 | 待 | 待 | 有：Realtime，随画布或输入变化反馈 | 待 | 待；流式文字回答不计入 |

第 12 类已排除语音；第 5 类排除代码工作台。资料问答只作文字能力参考，文件导入/导出范围仍需本站单独决策。第 10 类要求不同输入逐项处理，单提示词生成多张图、单次上传多张参考图不直接计入。

## 关键证据与限制

### RunningHub

- [官方首页](https://www.runninghub.cn/)及[AI 应用官方教程](https://www.runninghub.cn/blog/ai-prompts-use-cases/runninghub-ai-apps-guide)：AI 应用、工作流、无限画布等入口。主页的 Agent 定位不足以证明具体自主任务执行效果。
- [RHSTORY 官方教程](https://rhtv.runninghub.cn/blog/ai-prompts-use-cases/runninghub-rh-story-ai-short-drama-tutorial)：剧本、美术设定、分镜、短片逐阶段推进。能确认阶段式制作路径，产品内引导控件仍待体验，不据此推定所有应用都支持通用分步引导。
- [无限画布官方教程](https://rhtv.runninghub.cn/blog/ai-prompts-use-cases/ai-outfit-change-video-with-runninghub-infinite-canvas)：素材与视频节点组织。
- [公开用户批处理工作流](https://www.runninghub.cn/post/1852077464204845058)：不同图片逐张处理的供给线索，非官方完整功能验收；本轮未运行。

### LiblibAI 与 LibTV

- [LiblibAI](https://www.liblib.art/)部分页面抓取受限；同域公开页面能定位图片/视频、AI 应用、ComfyUI/工作流入口，完整使用路径待登录核查。
- [LibTV](https://www.liblib.tv/)呈现新建画布、剧本生成、智能剪辑和 Agent 入口；智能剪辑名称不证明具体时间线操作。
- [LibTV 插件说明](https://www.liblib.tv/plugin)明确外部 Agent 接入后的生成与素材组织。不能直接算作站内 Agent 已验证；[关联平台协议](https://www.liblib.art/activities/468ad794ccc7408d81757fd91be003ec)用于确认 LibTV 归属，能力仍分别标注。

### 即梦

- [官方产品页](https://jimeng.jianying.com/)介绍图/视频生成与智能画布；[创作入口](https://jimeng.jianying.com/ai-tool/home/)有对话和 Agent 模式线索。入口抓取存在不稳定，未核验连续对话和工具执行，故对应两项仅标局部。

### Krea

- [Nodes](https://www.krea.ai/features/nodes)、[Prompt-to-Workflow](https://www.krea.ai/blog/prompt-to-workflow)：节点编排、应用承接与针对一批输入的样式处理。
- [Agent 官方说明](https://www.krea.ai/blog/what-is-krea-agent)：多轮创作、资料上下文、目标执行及定期 Routines；Agent 为 Beta，受套餐或访问码限制。其上下文资料库不能直接等同完整知识库问答；Agent 与 Nodes 工作流是两套能力，不能假定 Agent 已能执行 Nodes 图。
- [实时视频](https://www.krea.ai/blog/announcing-realtime-video)：随绘画、文字或视频输入变化产生持续视觉反馈；与普通排队生成视频不同。

### Adobe Firefly

- [功能说明](https://helpx.adobe.com/firefly/web/get-started/learn-the-basics/adobe-firefly-overview.html)、[Boards Quick Guides](https://helpx.adobe.com/firefly/web/create-mood-boards/firefly-boards/use-quick-guides.html)、[Video Editor](https://helpx.adobe.com/firefly/web/firefly-video-editor/set-up-your-project/create-a-project.html)：单次生成编辑、自由画布、分步引导与时间线。
- [AI Assistant FAQ](https://helpx.adobe.com/ie/firefly/web/firefly-ai-assistant/ai-assistant-faq.html)：对话和多工具创作 Agent，Beta 且账号/地区有限制；官方明确尚不支持移动网页或移动 App，不能直接用作本站手机体验依据。
- [Creative Production 企业 FAQ](https://helpx.adobe.com/firefly/web/work-with-enterprise-features/creative-production/adobe-firefly-creative-production-for-enterprise-faq.html)：企业授权下的模块化工作流与批量处理；[Workflow API](https://developer.adobe.com/firefly-services/docs/workflow-builder-api/)说明外部系统触发，不视为普通版原生定时入口。

### Dify 与第 5 类补充参照

- [Dify Workflow Studio](https://www.dify.ai/workflows)：可搭建表单、对话、知识检索、人工确认、Agent、批量及触发流程。这是开发和运营的搭建能力，终端用户体验取决于实际交付的应用。
- 上述六家未取得第 5 类完整文档/演示编辑器的充分证据。可用[Gamma 官方创建说明](https://help.gamma.app/en/articles/7838093-how-do-i-create-a-new-presentation-document-or-webpage-in-gamma)补充理解“生成后可继续编辑文档/演示”的形式，但不把它加入创作社区的同类排名，也不据此把 PPT/网页生成加入本站当前范围。

## 对多元拾光的决策意义

现有证据呈现两条产品路线：一条围绕图像/视频创作，将简单应用、可编辑画布与专业工作流分层；另一条围绕文字任务，将对话、资料检索、工具执行和自动化组合。平台之间不是同一张功能表上的高低配。

这份竞品研究中的“选择站内运行或外部承接”属于当时的待决策问题；现行决定是社区展示、介绍 AI 应用，由 MakeNow 统一承接输入、费用、生成、任务和结果。对话和 Agent 可以覆盖其他形式，不宜仅因竞品有 Agent 就新增一个独立发布类型。未来电商 Agent 未上线，不作为当前承接方。当前只确认文字、图片、视频范围，12 种形式的本站支持清单仍待决策。
