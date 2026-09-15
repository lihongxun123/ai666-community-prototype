# AI社区竞品调研报告

资料截至2026-09-11；汇报版2026-09-11。

- 同一张效果图可能对应作品参考、套用表单或源流程，详情字段和使用按钮应随实际交付变化。
- 15个样本中15家有平台执行能力资料；工具支持常见，但不能据此认定社区收入来源或用户回访原因。
- 合作计划、开放投稿和运营账号不能保证持续产量。制作、编辑、答疑与修订需要分别安排责任和成本。

## 1. 平台分类与参照关系

研究覆盖15个平台及关联产品组，按内容与使用方式分为五类。每类至少选择一个代表，共7家；流程类同时比较资源库与执行平台，学习与讨论类同时比较课程协作与论坛回应。

### 全部平台分类

| 参照用途 | 平台 | 比较的问题 |
| --- | --- | --- |
| 学习与讨论 | WaytoAGI 通往 AGI 之路、Datawhale、LINUX DO | 知识、教材与讨论的组织方式；作者、编辑、领学、答疑和管理分工；反馈修订、成员参与及福利的作用 |
| 开发资源与应用 | Hugging Face、魔搭 ModelScope、Dify 社区 | 资源说明与试用入口；配置、依赖、导入和部署条件；版本协作、问题处理与运行成本 |

### 7个代表平台

| 分类 | 代表平台 | 选择理由 | 任务与内容 | 使用路径 |
| --- | --- | --- | --- | --- |
| 流程与资源复用 | LiblibAI | 同时呈现效果模板、模型和工作流，适合比较内容如何接到在线使用。 | 商品精修与背景替换案例要求用户准备商品图、背景图并处理遮罩，再按所选模型运行。案例说明一种具体制作任务；现有材料不足以确定这类任务占全站使用的比例。 首页图片模型栏目以效果封面、任务标题和模型标签组织卡片；模板详情补充参考图数量、推荐模型、示例与许可。较复杂的工作流另展示输入要求、模块说明和版本差异。 | 从效果卡片进入详情，判断所需素材、模型和许可，再使用模板或工作流。商品精修样例有从SDXL到FLUX的版本链接；是否能将自己的素材稳定复现，仍需实际运行检验。 |
| 流程与资源复用 | RunningHub | 同一方法可作为应用或节点工作流使用，且公开作者激励与执行计费规则。 | 虚拟试衣与商品替换样例让用户提供人物或场景图、商品图及修改说明。另一类任务是将已有ComfyUI流程搬到云端，处理缺失模型或节点后继续运行，技术要求有所不同。 首页按电商等任务组织内容，卡片先展示效果、标题与作者。工作流详情提供原图对照、更新时间和说明，并列应用与工作流入口；封装应用的详情另显示计费提示和运行入口。 | 用户先按任务找效果，从详情选择直接填写应用输入，或打开工作流检查节点。前者减少需要理解的设置，后者保留修改方法的入口；下载流程仍可能需要补齐模型与节点依赖。 |
| 创作工具与作品 | Runway | 公开案例和课程之外，还有项目与工作区内复用，可区分展示和制作。 | Miro活动视频案例涉及为不同场地制作镜头、适配投影尺寸及多个市场。任务包含生成、筛选和后续制作，不能将一次生成等同于成片，也不能把官方精选客户视为典型用户。 公开案例讲任务背景和制作过程；课程卡片先列学习目标、模块数与难度，详情展开技能和学习入口。工作区内的App和Projects则承载输入配置、会话、流程与素材。 | 案例和课程帮助读者理解用途，进入工具后再组织生成与修改。工作区成员可按权限使用封装的App，或在项目中继续处理会话和资产；公开浏览与内部项目使用是不同路径。 |
| 学习与讨论 | Datawhale | 以课程、练习和协作维护承载内容，提供生成工具社区之外的比较对象。 | 公开问题包括运行RAG课程时的鉴权、模型版本、Windows环境及中文检索故障。学习者要把示例跑通并理解修改方法；这些具体障碍不能用于推断其职业或学习完成比例。 课程以讲义、Notebook、录播和文本整理承载过程，练习另有作业入口与完成记录。提问指南要求环境、完整错误和尝试结果；现有材料不支持把所有课程概括为统一首页卡片。 | 从课程仓库进入章节材料，配置环境后编码练习，按要求提交作业或学习记录；遇到障碍时补充环境和报错再提问。阶段共学结束后仍可自学，答疑资源是否延续要另看安排。 |
| 学习与讨论 | LINUX DO | 讨论、答疑和持续维护帖子是主要承载方式，商业入口与普通参与分开。 | 具体讨论涉及API首字延迟、应用接入失败、提示词修改与效果回传。接入问题中可见答案标记及提问者确认；这些记录支持问题确实被提出，不等于已独立复现解决办法。 首页按最新、未读和热门等入口组织话题行，显示标题、分类、回复和最近活动。详情用首帖、楼层引用与时间轴展开；可长期维护的Wiki帖还保留更新与编辑历史。 | 读者从分类或话题列表定位问题，阅读背景和楼层中的补充，再沿引用查公告或方法。已解决标记、收藏和通知选项支持继续跟进；是否实际收到通知、是否反复回来尚未核验。 |
| 开发资源与应用 | Hugging Face | 模型、数据、专题集合与在线应用在同一平台相连，适合比较开发资源如何被发现、使用和持续维护。 | 使用者寻找模型与数据，或直接打开他人部署的演示；作者则要把应用交给访客并维护环境。公开试衣和额度讨论说明两类任务存在，组织采购画像主要来自官方产品说明。 模型卡交代用途、限制和许可，Collection按主题关联资源，Space直接承载应用。H3 Arena卡片展示用途和运行状态，详情有应用、Files与Community入口，各自承载不同材料。 | 用户可从任务目录或专题进入资源，查看说明后试用应用或按条件复制。公开应用与源码开放是两种权限；复制后仍需准备私有凭证、模型权限、算力和依赖，不能只带走展示画面。 |

| 平台 | 供给 | 工具关系 | 收费对象 |
| --- | --- | --- | --- |
| LiblibAI | 作者发布方法、更新版本并邀请返图反馈，平台提供展示和运行入口。特定会员工作流计划另约定授权、推广和收益分配；没有证据表明全部作者均受该计划约束或持续供稿。 | 平台提供模型与工作流的云端使用入口，并另设API服务。方法由作者编排，底层模型与依赖各有条件；使用平台工具不自动取得所有相关素材和模型的商业使用权。 | 付款对象包括个人生成会员、工作流许可和API服务，付款方可分别是使用者、资源购买者或接入方。现有协议与邀请奖励确认收费安排，未披露各项实际收入和付费人数。 |
| RunningHub | 作者上传应用和工作流、解释输入并更新方法，平台组织任务专区与推荐。公开激励规则将有效运行、收藏和原创性纳入奖励；刷量判定、实际结算及持续供给规模尚未取得。 | 平台提供ComfyUI云端执行及API接入，作者负责流程编排与依赖说明。公开求助记录显示有人仍需自行排查模型和输入节点；云端托管没有消除全部配置与结果整理工作。 | 个人为运行资源或会员权益付费，接入方为API执行付费。工作流计算时长与标准模型按图片、秒或次数计费分别定价；2026-09-09读取的价格规则不能用于计算实际收入。 |
| Runway | 官方选择客户案例并组织创作伙伴与推荐合作，创作者自行探索与发布。App维护者回到源流程更新方法，项目成员管理素材；创作伙伴计划没有固定供稿时间或创作量承诺。 | 自营制作工具、项目管理和API是产品的一部分，工作流可封装为简化操作界面。Projects在成员范围内共享，外部默认私有；公开案例并不附带完整、可复制的客户项目文件。 | 个人按订阅及额度使用制作能力，企业方案另行商议，开发者按API用量付费。2026-09-09读取的价格页区分这些对象；套餐含量和生成时长都不能直接作为交付价值或收入。 |
| Datawhale | 公开协作文档分别安排课程入口、作业、直播、教材反馈与学习进度。贡献者整理材料并讨论修订，志愿助教引导排查；岗位说明不能证明当前人数、响应速度和长期维护工时。 | 内容主要通过开源仓库、Notebook和外部模型或计算环境使用。未确认存在与这些课程统一绑定的自营收费生成服务；合作方可提供实践资源，学习者仍需处理环境与依赖。 | 2026年6月的ROCm共学记录确认合作方提供GPU等资源，未取得学员付费、现金赞助或社区收入资料。两期活动均已结束，历史资源支持不能直接折算成当期营业收入。 |
| LINUX DO | 提问者补充条件和结果，回复者给办法，Wiki编辑者维护可积累的说明。社区管理另处理推广规则、邀请与异常刷量；维护依赖多种成员贡献，现有资料没有各角色的持续供给量。 | 站点还提供Connect身份接入和Credit积分服务，模型与API服务可由外部经营者提供。商家推广帖和用户接入讨论不能作为社区自营生成服务或自营中转业务的证据。 | 推广者可为高级推广权限订阅，普通阅读和答疑属于另一种参与关系。2026-09-09登录页显示600美元月价；没有实际购买记录，商家的销售额也不能算作社区收入。 |
| Hugging Face | 资源作者维护说明、文件和依赖，使用者通过讨论或修改请求反馈。答疑者曾提供Gradio适配演示；2026-09-11复核该应用显示暂停，原求助者仍无成功确认。 | Spaces承载应用运行，Inference Endpoints与Inference Providers提供推理服务，Hub承载模型、数据和版本。应用可由作者开发，平台提供托管与协作；可交互内容仍需要运行和维护资源。 | 收费包括个人订阅、按量计算与存储、组织席位和企业合同，付款方可能是使用者、作者或团队。计费文档区分订阅与计算费用；价格和功能不能换算成收入或付费人数。 |

**LiblibAI**：模板与工作流样例能说明内容结构及使用条件，尚不足以证明跨商品的稳定产出。会员工作流授权协议于2025年9月生效，仅适用于该计划；条款本身不代表作者已有收入。

[电商产品精修+背景替换（SDXL版）V1.0](https://www.liblib.art/modelinfo/6f92484476484efeb7bd5a0db113cbc0)；[电商产品精修+背景替换（FLUX）V2.0](https://www.liblib.art/modelinfo/7b89bfd25f7f418b82381e893a85c789?from=feed&versionUuid=791ecaae74b44c00a1b4423128084c10)；[LiblibAI创作图片商业使用规范](https://www.liblib.art/activities/e0aa50f25b874722ac60be71adb8c9cb/Commercial_Guidelines)；[会员工作流授权许可协议](https://www.liblib.art/activities/dd75ccf1b2674157ba11be35cb6a4a89/Original_ComfyUI_License_Agreement)；[经验教学与免费体验入口](https://insight.liblib.art/teaching)；[会员邀请奖励规则](https://insight.liblib.art/membershipInvitationBonus)；[API开放平台服务条款](https://www.liblib.art/activities/API-Service-Agreement)

**RunningHub**：应用表单和工作流双入口已有页面证据，完整生成效果并未逐项验证。公开求助包含已运行者与仅在选平台的人；不能合并计算用户数，也不能据奖励规则推断留存效果。

[RunningHub任务专区首页](https://www.runninghub.cn/)；[Google图像工作流示例](https://www.runninghub.cn/post/2028347928716251138)；[Klein虚拟试衣与商品局部替换](https://www.runninghub.cn/post/2074049801244917760)；[创作者奖励规则](https://www.runninghub.cn/creator-reward)；[help me use runninghub for workflow so confused — Discussion #176](https://huggingface.co/RuneXX/LTX-2.3-Workflows/discussions/176)；[Is runninghub best for running comfui on cloud](https://www.reddit.com/r/comfyui/comments/1qh57f2/is_runninghub_best_for_running_comfui_on_cloud/)；[RunningHub AI Apps 官方使用指南](https://www.runninghub.cn/blog/ai-prompts-use-cases/runninghub-ai-apps-guide)；[企业级共享API计费页面](https://www.runninghub.cn/enterprise-api/sharedApi)；[标准模型API目录](https://www.runninghub.cn/call-api/search-api/standard-model)

**Runway**：客户访谈提供了具体用途，仍缺完整项目、成本和独立结果核验。App文档确认工作区内封装与权限，未确认全站公开模板交易；现有资料也没有项目留存或客户净收益数据。

[How Miro Produced Its Keynote Video for Four Global Markets with Runway](https://runway.com/news/customers/miro)；[Publishing Workflows as Apps](https://help.runwayml.com/hc/en-us/articles/47865876793747-Publishing-Workflows-as-Apps)；[Introduction to Projects](https://help.runwayml.com/hc/en-us/articles/52913050653203-Introduction-to-Projects)；[Creative Partners Program](https://runway.com/creative-partners-program)；[Apply to the Runway Affiliate Program](https://runway.com/affiliate-program)；[Runway Pricing](https://runway.com/pricing)；[API Pricing & Costs](https://docs.dev.runwayml.com/guides/pricing/)



**Datawhale**：作业要求与公开求助能说明课程如何被使用，尚缺报名到完成、再次参加的去重人数。部分课程协作页未标更新日期；旧课程入口可访问，不代表目前仍配有相同助教和资源。

[课本编写与反馈收集](https://datawhalechina.github.io/learn-python-the-smart-way-v2/Contribute/contribute_detail/textbook_and_feedback/)；[组队学习规则](https://datawhalechina.github.io/learn-python-the-smart-way-v2/Schedule/team_learning/)；[作业发布与验证](https://datawhalechina.github.io/learn-python-the-smart-way-v2/Contribute/contribute_detail/homework/)；[How to Ask Questions](https://datawhalechina.github.io/learn-python-the-smart-way-v2/Question/question/)；[团队协作工作流](https://datawhalechina.github.io/learn-python-the-smart-way-v2/Contribute/workflows/)；[hello-rocm 组队学习入口（官方原文）](https://raw.githubusercontent.com/datawhalechina/hello-rocm/master/docs/zh/learning/index.md)；[all-in-rag课程仓库](https://github.com/datawhalechina/all-in-rag)；[第一节执行示例报错 #125](https://github.com/datawhalechina/all-in-rag/issues/125)；[KIMI API失效 #121](https://github.com/datawhalechina/all-in-rag/issues/121)；[Windows激活环境问题 #105](https://github.com/datawhalechina/all-in-rag/issues/105)；[BM25检索中文分块问题 #102](https://github.com/datawhalechina/all-in-rag/issues/102)；[Datawhale 官方介绍与大事记](https://www.datawhale.cn/static/about/index.html)；[Datawhale GitHub 组织](https://github.com/datawhalechina)；[Datawhale 组织治理](https://github.com/datawhalechina/whale-governance)

**LINUX DO**：已登录采集首页与若干话题，能确认信息组织及互动实例，但样本按主题选择。已解决标记不代表全站解决率；推广准入与处置规则也不足以保证站外服务质量或估算订阅收入。

[LINUX DO 登录首页](https://linux.do/)；[工具首字延迟求助](https://linux.do/t/topic/2880961)；[关于应用接入的问题请教佬友](https://linux.do/t/topic/1537782)；[壁纸提示词与结果回传](https://linux.do/t/topic/2879086)；[盘点 L 站的徽章：长期更新](https://linux.do/t/topic/342888)；[秘密花园园丁邀请函](https://linux.do/t/topic/847468)；[别刷了，别刷了，服务器顶不住了](https://linux.do/t/topic/1409175)；[LINUX DO Connect 文档](https://wiki.linux.do/Community/LinuxDoConnect)；[LINUX DO Credit 使用指南](https://credit.linux.do/docs/how-to-use)；[新推广方式：开源推广](https://linux.do/t/topic/1776670)；[LINUX DO 社区细则](https://linux.do/guidelines)；[LINUX DO 订阅入口](https://linux.do/s)；[封禁两例公益站违规](https://linux.do/t/topic/2587473)

**Hugging Face**：H3 Arena截图仅记录播放前界面，未运行、投票或检查文件。2025—2026年问题帖含受阻、替代版本和个别恢复自述，不能估算故障率或留存；企业采购与持续成功使用的资料仍不足。

[Model Cards](https://huggingface.co/docs/hub/model-cards)；[Spaces Overview](https://huggingface.co/docs/hub/spaces-overview)；[Collections](https://huggingface.co/docs/hub/collections)；[Pull Requests and Discussions](https://huggingface.co/docs/hub/repositories-pull-requests-discussions)；[NeoMME Collection](https://huggingface.co/collections/Hcompany/neomme)；[Spaces：Image Classification目录](https://huggingface.co/spaces?filter=image-classification)；[Pro Account – ZeroGPU Not Working Despite Subscription](https://discuss.huggingface.co/t/pro-account-zerogpu-not-working-despite-subscription/168446)；[PRO订阅后ZeroGPU配额问题](https://discuss.huggingface.co/t/pro-plan-issue-zerogpu-quota-not-updated-after-subscription/168001)；[充值后仍超过PRO GPU额度](https://discuss.huggingface.co/t/getting-you-have-exceeded-your-pro-gpu-quota-error-even-with-credits-loaded/174850)；[公开Demo访问与本地替代](https://discuss.huggingface.co/t/pro-account-getting-gpu-quota-exceeded-when-calling-for-hf-provided-url/154104)；[同主题：提供适配Gradio 5的演示](https://discuss.huggingface.co/t/pro-account-zerogpu-not-working-despite-subscription/168446/6)；[Hugging Face Pricing](https://huggingface.co/pricing)；[Hugging Face Billing](https://huggingface.co/docs/hub/billing)；[Team & Enterprise Plans](https://huggingface.co/enterprise)；[IDM-VTON适配Space：当前暂停状态](https://huggingface.co/spaces/John6666/IDM-VTON-GRADIO5)

吐司与Tensor.Art作为一个关联产品组，两站规则、权益与实操结果分别记录。分类用于确定比较问题，不代表行业份额或平台优劣。

[15个平台对照](../report.html#appendix) · [内容与工具关系](research-framework.md)

## 2. 用户需求与产品价值

这些平台承接视觉制作、代码学习、内容欣赏和问题求助等不同需求，产品能力应与具体任务及剩余工作对应。

### 连续视觉创作需要角色、镜头和跨工具制作支持，单次生成成功不足以满足整项任务。

OpenArt的公开用户记录涉及连续角色、音乐视频及跨镜头制作。平台提供生成和角色能力后，用户仍需学习镜头语言、筛选片段并完成部分外部编辑；继续使用与满意、续费应分别判断。

- **OpenArt**：OpenArt一名公开用户自述为9支专辑MV购买年费，起初因文件管理、教程和角色短镜头受阻，后来学习影视术语并将项目推进约一半。其他记录涉及外部参考图、口型片段和跨工具剪辑。

依据：用户自述及同账号前后记录；付款、项目进度和成片质量未独立核验。

[OpenArt使用经历讨论：专辑MV及后续反馈](https://www.reddit.com/r/generativeAI/comments/1ng7d42/)；[Suno发行者讨论中的OpenArt视觉制作步骤](https://www.reddit.com/r/SunoAI/comments/1u1kork/to_those_distributing_suno_tracks_to_spotifyapple/)

### 课程学习涉及环境配置、运行排错和结果检查。

Datawhale的课程与问题记录显示，学习者会实际运行教材并反馈环境、调用和检索问题。课程、勘误与答疑共同支持学习，但现有样本尚不能判断结课率、独立应用能力或职业分布。

- **Datawhale**：Datawhale的all-in-rag样本有5位不同发帖者，涉及授权配置、模型调用、环境及检索问题。其中一人展示中文BM25检索修正前后对照，说明运行结束后仍需核查结果是否符合任务。

依据：课程资料及公开问题记录；局部改善为提交者自述，未独立复现，不代表结课或就业成果。

[all-in-rag课程仓库](https://github.com/datawhalechina/all-in-rag)；[第一节执行示例报错 #125](https://github.com/datawhalechina/all-in-rag/issues/125)；[KIMI API失效 #121](https://github.com/datawhalechina/all-in-rag/issues/121)；[BM25检索中文分块问题 #102](https://github.com/datawhalechina/all-in-rag/issues/102)；[Windows激活环境问题 #105](https://github.com/datawhalechina/all-in-rag/issues/105)；[学习反馈 #91](https://github.com/datawhalechina/all-in-rag/issues/91)

46条任务画像中，49条不足5个可区分用户观察点，18条暂无直接用户点。用户自述、官方目标和研究者实操各自记录，群体占比未知。

[完整用户画像与产品价值](audience-research.md) · [全国用户规模与分层](china-ai-users.md)

## 3. 内容发现与使用路径

内容形式的差别，主要体现在用户进入详情后能取得什么。视觉卡片可能只提供参考，也可能交付输入表单或完整流程；课程解释操作与判断，运行文件则传递配置；挑战组织同题创作，讨论围绕具体问题补齐条件。多元拾光可共用发布和关联能力，但卡片字段、详情顺序与后续动作应分别设计。

### 效果卡片之后：看作品、套模板、改流程

Liblib模板从效果封面进入输入要求与使用入口；RunningHub换背景详情进一步列出模型、参数和节点，并将应用与完整工作流分开。Tensor.Art的商品例图则停在作品展示，详情明确没有生成数据。三者入口都可以是图片，交付深度却不同。

**LiblibAI：电商产品精修模板**：模板卡片展示效果、任务标题和模板/底模标签；对应详情列1—4张参考图、提示词支持、推荐模型和使用入口。配对截图确认卡片与同一资源详情的关系、输入字段及入口，未进入生成；正文、许可区与作者评论的商用表述存在冲突。

[电商产品商业级渲染精修模板](https://www.liblib.art/modelinfo/b3c0dc71aabb4496af0d178bfa347bc8)

**RunningHub：一键换背景工作流**：商品效果卡片进入换背景详情后，可看到原图与效果、作者说明，以及打开AI应用、运行工作流和下载入口；已读正文另列模型、采样参数和60项节点信息。配对截图证明入口分流和部分详情结构，不能证明节点已经检查或现在仍能运行；资源标注2024年更新。

[一键换背景：产品图摄影](https://www.runninghub.ai/zh-cn/post/1845758651062743041)

**Tensor.Art：MooMooE-commerce商品例图**：模型页的蓝色瓶子例图进入单图详情后，页面提示没有生成数据。截图证明例图与对应详情的关系，以及该图片未提供生成参数；模型页仍有运行入口，但不能据此补出这张图的提示词或种子。此例来自国际站，不能外推国内吐司或全站作品。

[MooMooE-commerce V1](https://tensor.art/models/662744072865292090)

分析：画面能让用户快速判断是否接近目标，详情再承担执行条件的判断。只想换素材的人需要输入表单和输出示例；要调整方法的人需要模型、节点和参数；来找审美参考的人未必需要流程。差异应由详情材料和按钮表达，不能仅靠封面或“同款”标签区分。

没有过程材料的作品仍可供欣赏和参考，不必全部改造成教程。相反，RunningHub样本即使列出了模型、节点和运行入口，也仍是较早资源，现时依赖与输出尚未验证。因此应分别说明“有方法材料”与“在什么条件下验证可用”。

多元拾光可借鉴：保留同一套图片或视频预览，但在详情分别提供“作品参考”“可直接套用”“完整画布”三种交付。作品页展示完整成品和关联方法；套用页列输入、可改项和结果示例；画布页提供流程、依赖、版本及说明。只有实际有材料的入口才显示相应动作。

需要承担的工作：投稿时核对作者实际交付的层次，建立作品、模板与源画布的关联。模板需有可分享输入、输出对照和失败说明；源画布需确认复制范围、依赖及许可。效果封面可以共用，不能用它代替交付验收。

仍需确认：用同一组商品素材完成“直接套用”与“修改画布”两条路径，记录补素材、改参数、求助和最终验收。如果普通用户仍需频繁打开源画布才能完成任务，就需要调整简化表单及内容说明，而不宜宣称套用入口已降低门槛。

### 教程解释判断，运行材料传递操作

Runway课程先说明目标、难度和章节，课程按制作顺序编排内容；Datawhale具体章节将初始提示、输出与修订放在一起，并提供代码学习材料。RunningHub工作流把已有处理过程作为资源交付，使用者可转入应用或检查节点。课程与文件可以关联，但承担的任务不同。

**Runway Academy：分章制作课程**：Building Custom Workflows公开概览列学习目标、难度、总时长和三个带时长章节，说明学习范围与顺序。现有配对截图来自另一门AI for Advertising课程，确认课程卡片的10模块、Beginner、免费入学等字段及对应详情，不能当作工作流课程的截图。广告课程总时长与模块合计不一致；两门课都未完整学习或验证效果。

[Building Custom Workflows](https://academy.runwayml.com/course/custom-workflows)

**Datawhale：迭代讲解与练习材料**：LLM Cookbook的迭代优化章节保留任务、初始提示、输出和修改过程，项目支持在线阅读、PDF与Notebook等材料；Python课程另将实际编码和作业记录用于参与检查。这里没有配对截图，依据已读章节与课程规则；未执行代码，也不能把规则要求当成所有学员已经完成。

[LLM Cookbook项目说明](https://github.com/datawhalechina/llm-cookbook)；[第三章：迭代优化](https://github.com/datawhalechina/llm-cookbook/blob/main/docs/C1/3.%20%E8%BF%AD%E4%BB%A3%E4%BC%98%E5%8C%96%20Iterative.md)；[组队学习规则](https://datawhalechina.github.io/learn-python-the-smart-way-v2/Schedule/team_learning/)；[课本编写与反馈收集](https://datawhalechina.github.io/learn-python-the-smart-way-v2/Contribute/contribute_detail/textbook_and_feedback/)

**RunningHub：配置与应用双入口**：换背景资源详情给出模型、参数和节点清单，并将“打开AI应用”与“运行工作流”并列。它能帮助有准备的使用者从说明进入执行；截图只证明两类入口存在，下载文件、依赖和实际输出尚未验证。本处复用同一组换背景截图，不计作第二个独立样本。

[一键换背景：产品图摄影](https://www.runninghub.ai/zh-cn/post/1845758651062743041)

**Hugging Face：运行界面与源码权限**：Spaces文档区分公开、受保护和私有范围，受保护Space可以公开使用但不公开源码。现有H3 Acceleration Arena配对截图显示应用卡片进入视频对照界面，并保留App、Files、Community入口；没有打开Files、播放或投票，不能用该截图判断这一个应用的源码权限或运行成功。

[Spaces Overview](https://huggingface.co/docs/hub/spaces-overview)

分析：课程按学习依赖组织，让读者理解先做什么、为什么调整；运行材料按执行依赖组织，让使用者判断缺什么、可改什么。面对陌生任务，照着流程运行未必能学会处理偏差；已有经验的人也未必愿意为一次操作完整学课。两类入口应能互相转入，而不应把下载文件当作教学已经完成。

两类形式不是互斥：Datawhale教程可以附Notebook，运行资源也可以附教学。Hugging Face的Spaces文档还区分公开、受保护和私有范围，能公开使用的演示不一定开放源码，因此“能运行”也不能直接写成“可取得完整方法”。

多元拾光可借鉴：针对同一个MakeNow任务，设置两条互相关联的路径：“直接做”提供样例输入、最少参数、输出检查与失败入口；“学做法”按准备、关键修改、结果对照和人工处理分节，并附对应画布。先完善具体任务页，不必先建设多门课程。

需要承担的工作：同一作者需保留输入、尝试、修改理由和对照输出；编辑将教学步骤对应到画布版本。必须有人能回答为何失败、何时需要人工修正。可运行材料与讲解需保持一致；课程文件复制不附带助教服务。

仍需确认：在同一任务下观察新手与有经验者的首选路径、完成时间、主要错误和返回教程的位置。若两组都主要卡在素材准备或结果判断，优先补这些说明；只有出现连续学习需要，再考虑课程化。

### 作品挑战组织同题创作，问题帖组织连续回应




**LINUX DO：问题、追问与处理结果**：知识库管理话题的配对截图显示，列表以标题、分类和最近活动组织，详情保留问题背景、已考虑的方法及楼层回复；它只覆盖首屏，不能证明问题已解决。另一个NEWAPI接入问题样本在登录核对中可见首帖采纳摘要、回复追问与提问者自报解决，两条话题不能混为同一个案例，也没有独立复现该解法。

[AI时代大家是怎么管理自己的知识库的？](https://linux.do/t/topic/2868771)；[关于应用接入的问题请教佬友](https://linux.do/t/topic/1537782)；[壁纸提示词与结果回传](https://linux.do/t/topic/2879086)

分析：挑战需要统一题面和评审条件，才能让作品被比较，作品卡应突出题目、阶段和结果。问题讨论开始时可能连问题条件都不完整，列表应突出问题标题和进展，详情保留引用、追问和作者反馈。两者的“参与”不能混为同一种价值：投票主要表达偏好，排查回复需要解释适用条件。


多元拾光可借鉴：若提供练习与问题讨论，分别组织：作品练习页包含题目、输入素材、限制、提交示例和反馈；问题页包含目标、环境/版本、失败表现、已尝试办法及后续结果。作品可关联练习，问题可关联具体画布；采纳与点评各自标明作用。平台维护账号的投稿、回答和自然用户行为分开记录。

需要承担的工作：练习需有人出题、检查素材并给具体点评；问题区需有人核对技术条件、追问结果，再整理可复用说明。表单可共用附件与引用功能，列表字段、反馈类型与结果状态分别处理。尚无主持或答疑能力时，应缩小主题范围。

仍需确认：对同一批内容分别记录自主交作品、有效点评、问题补充、作者反馈及后续再次使用；区分平台账号与外部用户。如果参与主要由平台自问自答或奖励驱动，就不足以支持自然讨论或日常挑战的供给假设。

### 页面示例：LiblibAI · 电商产品商业级渲染精修

截图日期：2026-09-09。

![图片模型栏目内的模板卡片。封面直接呈现产品渲染用途，悬停后出现使用模板入口。](../research-images/v10/liblib-template-card.jpg)

[来源页面](https://www.liblib.art/)

![同一模板详情：效果图旁并列版本、基础模型、参考图数量和使用参数。](../research-images/v10/liblib-template-detail.jpg)

[来源页面](https://www.liblib.art/modelinfo/b3c0dc71aabb4496af0d178bfa347bc8)

正文的用途声明与右侧可商用标签存在冲突，作者评论又表示可以商用；需向平台或作者确认，不能从标题或单个标签得出许可结论。角度、文字一致性限制来自作者答复，未独立测试。

### 页面示例：RunningHub · 一键换背景：产品图摄影

截图日期：2026-09-09。

![ComfyUI精选工具中的效果卡片，标题会截断；该列表卡片未展示节点。](../research-images/v10/runninghub-workflow-card.jpg)

[来源页面](https://www.runninghub.ai/zh-cn/page-workflow)

![对应详情同时提供打开AI应用和运行工作流两条入口，并展示原图与效果。](../research-images/v10/runninghub-workflow-detail.jpg)

[来源页面](https://www.runninghub.ai/zh-cn/post/1845758651062743041)

详情显示2024年更新，属于较早资源；参数齐全不能证明现在仍可运行。封面、运行量和作者的效率描述均不作成功率证据。

### 页面示例：吐司 / Tensor.Art · MooMooE-commerce 的商品例图

截图日期：2026-09-09。

![模型详情内的例图卡片组。它是模型的效果样本区，并非独立的首页作品流。](../research-images/v10/tensor-work-card.jpg)

[来源页面](https://tensor.art/models/662744072865292090/MooMooE-commerce-V1)

![点击第一张蓝色瓶子例图后，单图详情明确提示没有生成数据。](../research-images/v10/tensor-work-detail.jpg)

[来源页面](https://tensor.art/images/662742037059162229?model_id=662744072865292090)

这是Tensor.Art站点的两个相邻历史例图中的一个；邻图也显示无生成数据。不能外推全部作品，更不能当作吐司国内站的统一规则。

### 页面示例：Runway Academy · AI for Advertising

截图日期：2026-09-09。

![课程卡片先交代目标、章节数、难度和免费入学入口。](../research-images/v10/runway-course-card.jpg)

[来源页面](https://academy.runwayml.com/)

![同一课程的详情展开学习目标与技能，展示开始学习入口。](../research-images/v10/runway-course-detail.jpg)

[来源页面](https://academy.runwayml.com/course/ai-advertising)

页面标总时长20分钟，10个模块时长合计36分59秒，存在不一致。免费课程入口不表示生成工具也免费。

### 页面示例：Hugging Face · H3 Acceleration Arena

截图日期：2026-09-09。

![Spaces周选中的应用卡片，使用状态标签和用途摘要，未依赖一张生成作品封面。](../research-images/v10/huggingface-space-card.jpg)

[来源页面](https://huggingface.co/spaces)

![详情直接承载可交互应用，并保留App、Files、Community入口。画面处于播放前状态。](../research-images/v10/huggingface-space-detail.jpg)

[来源页面](https://huggingface.co/spaces/multimodalart/h3-acceleration-arena)

Running状态只能说明页面当时报告的运行状态。页面的投票数属于该应用自述，不是Hugging Face平台活跃用户数，也未独立核验。

### 页面示例：LINUX DO · AI时代大家是怎么管理自己的知识库的？

截图日期：2026-09-09。

![论坛中的一行话题条目。截图遮盖参与者头像，保留标题、分类和数值。](../research-images/v10/linuxdo-topic-card.jpg)

[来源页面](https://linux.do/)

![首帖先说明具体困扰，再接楼层回复；右侧保留阅读位置和时间轴。](../research-images/v10/linuxdo-topic-detail.jpg)

[来源页面](https://linux.do/t/topic/2868771)

这是具体问题的公开讨论样本，不能代表用户群总体需求。浏览量不是人数，回复数不是解决率；截图是首屏，未读完全部讨论。

部分证据来自官方说明或较早的公开作品。入口存在与完整运行成功分别判断，不能按截图给平台的使用效果排名。

[内容形态与卡片、详情截图](content-forms.md) · [普通内容与任务样本](content-research.json)

## 4. 内容供给与运营机制

平台编选、合作作者与成员贡献承担不同工作，现有案例中都能看到发布之后的组织、答疑或修订。多元拾光当前按平台长期供给核算，合作作者可补充制作能力，自发贡献需要实际出现后再计入。作品数量、运营账号数量和合作计划不能代替可用内容、独立作者与持续产能。

### 代表平台的持续使用与维护证据

核对日期：2026-09-11。

七家代表平台的定向案例复核。记录普通使用者、作者、维护者和官方精选材料，保留同一人的连续行为，不把多篇帖子计为多人。

案例独立存档，未并入原46条画像的观察点计数。没有平台总体抽样，不计算成功率、留存率或社区收入贡献。

#### LiblibAI

站内作者说明了工作流调整；外部API插件有原始报错、回应及可核对的代码改动。 站内工作流的用户回传仍不足；插件问题关闭后也未见本人确认恢复。

##### 用户反馈被写进工作流版本说明，但原始反馈与效果回传仍缺失

Liblib 站内工作流作者；使用者反馈仅经作者转述

任务：给电商产品更换背景，并改善前景遮挡、光照和细节。

问题：作者称 V1 收到问题反馈；V2 说明列出细节迁移时报错、场景遮挡与色调融合等处理目标。未取得原始问题发生条件，也不能将四项更新分别算成四次用户反馈。

- 日期未取得；版本先后由正文得到：作者明确写到 V1 的使用反馈促成 V2 增加和优化。
- V2；日期未取得：新增画布尺寸控制，以避免细节迁移报错；同时增加前景遮罩、重打光与高低频细节增强。
- 2026-09-11：重新读取公开详情，仍可取得上述版本说明与站外教学入口；没有取得原始评论、源码差异、用户复测或实际输出。

观察结果：确认有具名功能调整及作者所述反馈关系；不能确认任何一位反馈者已成功完成换背景，也不能将作者意图视作稳定生成效果。与 D21-LL-FIX 为同一资源复核，不新增独立观察点。

仍未解决：V1/V2 发布时间、实际配置差异与兼容模型版本。；原始提问、作者逐条处理和同一使用者确认。；是否仍可运行、真实输入下的效果、维护工时及费用。

内容与运营分析：版本说明应把为什么改、改了什么及适用条件写清。此例提供的是说明组织参考，尚不能证明反馈被妥善解决；公开报告需将作者修订与用户确认分列。

- [FLUX 电商产品换背景工作流](https://www.liblib.art/modelinfo/98a6d0dd81634abc8ad973d56971c501?from=feed)。发布/更新：未标日期；查阅：2026-09-11。公开正文中作者对 V1 反馈与 V2 四项调整的说明；有留言邀请和站外教学入口，未取得实际评论及返图。

##### 图片生成失败之后，插件确实改了配置；使用者是否恢复仍未知

非官方 Liblib API 插件的使用者与插件维护者；不是 Liblib 平台客服或站内工作流作者

任务：通过 AstrBot 插件调用 Liblib API 生成图片。

问题：使用者提交“图片生成失败”问题单，正文主要为截图；本次没有读取截图中的详细错误。维护者随后将问题归因于 XL 模型的自定义 VAE 配置变化，这是维护者的判断，未取得 Liblib 官方变更公告。

- 2025-05-27T02:40:47Z：使用者创建问题单 #2，报告图片生成失败。
- 2025-05-27T18:00:03Z：仓库提交 7c99243，将插件版本从 1.1.3 改为 1.1.4，并注释掉 XL 分支向请求写入 vaeId 的语句。可以核对具体修改，不只是更新日志中的修复声明。
- 2025-05-27T18:03:02Z—18:03:03Z：问题被关闭；维护者回复称新版本已处理，推测官方不再支持 XL 自定义 VAE。问题关闭与维护者回复不是使用者成功确认。
- 2026-09-11：公开 GitHub 问题接口与评论接口可读到 1 条维护者回复，没有原提问者复测回复；代码差异仍可公开核对。

观察结果：已确认原始问题、维护者回应及同日发布的具体代码改动。该改动与回复所述问题一致，但问题单未显式关联提交，不能把时间接近写成已证明的因果链。原提问者是否升级并成功生成未知。

仍未解决：Liblib 官方接口是否发生了维护者所说的规则变化，以及变化时间。；故障实际输入、模型组合、详细错误及完整复现条件。；用户是否安装 1.1.4、恢复生成并采用输出，是否继续付费或复用。；平台是否参加处理、处理工时与该用户实际费用。

内容与运营分析：API 能调用只是交付的一部分。外部工具还需要跟随请求字段和模型条件维护兼容性，报告可把“已有修复声明”提升为“存在对应代码改动”，效果等级仍停在待使用者确认。社区价值若来自这类支持，应区分平台自己解决、第三方作者适配和用户自助排错。

- [图片生成失败 · Issue #2](https://github.com/machinad/astrbot_plugin_liblibapi/issues/2)。发布/更新：2025-05-27T02:40:47Z；查阅：2026-09-11。问题标题、原始提交与关闭状态。公开网页评论抽取不全，评论内容由同资源的公开 GitHub API 核对；未读取或归档用户截图。
- [插件维护者对 XL VAE 配置的处理回复](https://github.com/machinad/astrbot_plugin_liblibapi/issues/2#issuecomment-2913470329)。发布/更新：2025-05-27T18:03:03Z；查阅：2026-09-11。维护者称已在新版本修复，并提出 XL VAE 配置的原因解释；不是平台官方原因确认。
- [Issue #2 公开评论数据](https://api.github.com/repos/machinad/astrbot_plugin_liblibapi/issues/2/comments)。发布/更新：评论创建于2025-05-27；接口本身为动态记录；查阅：2026-09-11。未经登录的 GET 返回 1 条维护者回复，未见提问者复测确认。仅保存研究摘要；不复制评论引用中的带签名图片地址。
- [更新插件至 v1.1.4 并移除 XL 模型的 VAE 配置](https://github.com/machinad/astrbot_plugin_liblibapi/commit/7c99243075d8b76f8acaeb7004c9a179526882ea)。发布/更新：2025-05-27T18:00:03Z；查阅：2026-09-11。main.py 的 XL 请求分支注释掉 vaeId 赋值，main.py 与 metadata.yaml 版本号从 1.1.3 改为 1.1.4。提交日期由公开 GitHub commits API 交叉核对；未安装或执行。

商业化判断：外部插件案例不能确认使用者实际充值、消费金额或购买会员；站内工作流的作者说明也没有本案例收入数据。维护者的代码工作发生在 GitHub，不能直接计为 Liblib 站内社区创造的收入或留存贡献。站内资源与 API 接入提供了不同层的内容和执行支持，但其商业增量仍未知。

#### RunningHub

API接入问题有原提问者的诊断回传；同一工作流保留三条依赖适配说明。 API任务未确认完成，三条作者日志也不是三次成功验证；外部支持与站内运营需分开。

##### 买了会员仍无法接入，原提问者后来指向站点入口差异

Pixelle-Video 的公开问题提交者及其他使用者；未见 RunningHub 官方或该项目维护者介入

任务：通过 Pixelle-Video 接入 RunningHub 生成视频。

问题：原提问者称已购买 RunningHub 会员，但接口返回 user not exist；其他回复者也报告相似问题，并询问多个 API 入口如何选择。

- 2026-07-15T00:47:30Z：原提问者提交 #231，描述会员购买与接口错误。会员购买是用户自述，未核对交易。
- 2026-07-15—2026-07-16：另外两位可区分回复者报告相似错误，其中一位询问应使用哪种 API 入口；没有运行结果或费用凭证。
- 2026-07-20T01:23:29Z：原提问者回传自己的诊断：项目默认指向国际站，而自己访问的是国内站，因此出现找不到用户。该回复没有说已修改配置并生成成功。
- 2026-07-21T01:07:17Z：问题关闭。未见修复提交、官方确认或原提问者完成视频的回复。
- 2026-09-11：公开问题网页仍未抽出评论；未经登录的 GitHub 评论 API 返回 4 条评论，补得原提问者的诊断回传。

观察结果：由此前只有报错与关闭状态，补到同一提问者的原因分析。尚不能证明该分析正确，也不能把关闭日期算作恢复日期；本次没有读取对应历史版本的默认配置或复现请求。

仍未解决：报错时具体使用的服务域名、账户归属与项目版本是否与诊断一致。；原提问者是否改过配置、重新调用并得到可用视频。；其他回复者是否属于相同原因，会员与 API 额度的具体关系。；平台或项目维护者是否私下提供支持，以及实际支出。

内容与运营分析：付费动作与任务交付之间还有接入环节。内容详情或接入指南应明确服务区域、入口及权益适用条件，让问题回传保留配置调整与实际结果。此案例支持增加这些检查项，不能支持“购买会员即可接通 API”或“社区促成了这次购买”的判断。

- [接入 runninghub 生成视频报错 user not exist · Issue #231](https://github.com/ATH-MaaS/Pixelle-Video/issues/231)。发布/更新：2026-07-15T00:47:30Z；查阅：2026-09-11。原提问者的购买自述、错误与关闭状态；具体创建和关闭时间另由同资源公开 issue API 核对。
- [原提问者关于国际站与国内站的诊断回传](https://github.com/ATH-MaaS/Pixelle-Video/issues/231#issuecomment-5018019399)。发布/更新：2026-07-20T01:23:29Z；查阅：2026-09-11。同一提问者提出入口差异的解释；没有成功生成声明。评论 HTML 本次未抽出，内容通过公开评论接口读取。
- [Issue #231 公开评论数据](https://api.github.com/repos/ATH-MaaS/Pixelle-Video/issues/231/comments)。发布/更新：评论创建于2026-07-15—2026-07-20；接口本身为动态记录；查阅：2026-09-11。4 条公开评论的时间、可区分账号关系与原提问者后续。未保存头像、个人联系信息、签名链接或账号资料。

##### 同一工作流连续适配上游插件，三条日志仍不是三次成功验证

RunningHub 站内工作流作者；原始用户问题与上游插件作者记录未取得

任务：将长视频手动分段生成后衔接。

问题：作者日志分别描述上游插件更新后报错或人物不匹配、分段无法衔接、数据错位。问题及归因都来自资源作者，并非原始用户反馈或平台故障报告。

- 6.20（正文未写年份）：作者称处理插件更新后的报错及人物与参考不匹配。
- 6.22（正文未写年份）：作者称恢复上下文衔接方案，并表示会随上游后续变化再调整。
- 6.29（正文未写年份）：作者称处理插件更新后的数据错位；同页更新时间显示2026-06-29。
- 2026-09-11：浏览检索服务请求超时，但一次无登录普通 HTTP GET 返回200并读到正文及三条日志。没有取得原始评论、实际配置差异或使用者回传。

观察结果：重新确认同一资源保留三条具体症状和处理声明；没有新增第四次维护或修复成功证据。与 RH21-02 / P25-runninghub-E5 为同一资源、同一作者，不增加独立观察点。

仍未解决：每条日志对应的上游版本、实际节点和参数差异。；问题最初来自作者测试还是具体使用者，多久被发现和处理。；用户是否更新配置并成功衔接、最终画质是否符合任务。；谁承担失败成本、维护工时和版本通知责任。

内容与运营分析：工作流内容的维护责任会延续到发布之后，且依赖可能由外部作者控制。可参考其按症状记录变更，同时补上版本对应和复测状态；不能把“可运行入口”和“作者宣布修复”直接合并成可靠交付承诺。

- [Scail-2 长视频手动分段工作流与维护日志](https://www.runninghub.cn/post/2065490120324767746)。发布/更新：页面更新2026-06-29；正文6.20、6.22、6.29未写年份；查阅：2026-09-11。普通无认证 HTTP200 的公开正文，确认三条依赖适配日志；本次未操作工作流、取得配置或读取真实评论。标题中的无劣化和无缝衔接未作为已验证结论。

商业化判断：API 问题单含购买会员的用户自述，但没有交易凭证、支出统计或购买归因。资源维护页也没有该作者实际收益。GitHub 上的用户自助诊断、RunningHub 内作者维护与平台执行服务应分开记录；不能由会员购买或平台总收入推算社区的留存、转化和收入增量。

#### Runway

同一项目跨日期发布并解释制作过程；另有本人确认的修改、重试失败与疑虑缓解。 40集完成属于自述；原失败任务是否完成、费用与社区带来的收入未知。

##### 同一制作团队从第1集持续发布到第14集，并公开表演处理过程

创作者本人公开发帖及制作人说明；自述为无外部资助的双人独立制作团队。包含作品推广目的，非Runway官方精选客户，也不代表普通使用者。三个Reddit帖子属于同一项目、同一发帖账号，不算三个独立用户。

任务：制作并发布40集竖屏科幻微短剧 The Finch Files，用真人表演驱动角色表现，在小团队条件下保持对白和人物表现。

问题：制作人说明，难点是让角色自然表演，而非只生成视觉效果；他们缺少大型化妆与特效团队，使用Runway处理表演，再结合其他制作工具。

- 2026-01-27：发布第1集，称40集已制作完成，计划连续发布；在回复中确认声音由两名团队成员表演。这里的40集完成仍是本人自述。
- 2026-02-02：同一账号发布第5集，说明表演输入Runway的Act及后续Act-2，并愿意答复制作问题、询问能否分享幕后过程。
- 2026-02-15：同一账号在第14集帖子中再次说明Runway用于表演，并继续寻找观众。本次打开时，跨贴的视频入口显示已被版主移除，作者说明仍可读。

观察结果：可以确认同一项目在不同日期持续发布与解释过程，制作人明确自述已完成40集。没有逐集观看、核对工程文件或验证所有集数现在均能访问，不能把发帖持续时间当作每天使用Runway的日志。

仍未解决：每集制作周期、重试次数、费用、观众留存、客户验收和项目收益未知；没有证据说明该团队由Runway社区招募或因社区活动而付费。第14集视频入口移除原因未知。

内容与运营分析：这类内容需要项目总入口、连续更新、成片与幕后过程之间的关联。工具使用、作品发布和观众反馈是三个不同环节；只统计单条作品数量会遗漏项目延续，但连续发帖本身也不能证明商业成功。

- [The Finch Files (episode 1/40 for completed vertical drama)](https://www.reddit.com/r/runwayml/comments/1qoofo0/the_finch_files_episode_140_for_completed/)。发布/更新：2026-01-27；查阅：2026-09-11。主帖及本人回复：首集发布、40集完成自述、后续发布计划、真人配音。公开网页正文读取；绝对日期由同一URL的搜索索引显示。
- [The Finch Files - Reality Bleed - Episode 5/40](https://www.reddit.com/r/runwayml/comments/1qu66l2/the_finch_files_reality_bleed_episode_540/)。发布/更新：2026-02-02；查阅：2026-09-11。同一账号后续发布、表演输入Runway及Act/Act-2的本人说明，和分享幕后方法的意愿。公开正文读取；日期由同一URL的索引显示。
- [The Finch Files | She Never Existed | Ep 14/40](https://www.reddit.com/r/runwayml/comments/1r5leo9/the_finch_files_she_never_existed_ep_1440/)。发布/更新：2026-02-15；查阅：2026-09-11。同一账号继续发布第14集、重申完成及寻找观众；正文可见跨贴被移除标记，因此不作为可播放成片核验。日期由同一URL的索引显示。
- [AI-Driven Performance Capture in The Finch Files](https://www.linkedin.com/posts/antneely_thefinchfiles-aifilmmaking-runwayml-activity-7420595408013406208-4UvV)。发布/更新：未显示绝对发布日期；查阅：2026-09-11。制作人本人公开说明及视频转录，支持输入图、表演、替换声音和输出的过程线索。未播放或独立验证视频。

##### 客服建议带来了重试，用户仍未确认任务完成

普通用户公开求助与本人多次回复；未核验真实账号、套餐或生成记录。回复者给出客服和Discord入口，但本次没有独立确认其雇佣身份。

任务：在Runway入口使用Kling完成含起始图与结束图的视频生成，并弄清重复被拒绝是否影响账号。该案例不能归因于Runway自研模型的生成能力。

问题：请求被拒绝；用户将错误和提示提交给站内虚拟客服，得到安全带相关解释，修改提示与结束图后仍收到同类错误。

- 2026-04-27：用户公开求助。回复者建议咨询站内虚拟客服和社区Discord；本人确认已按提示修改、再次失败，并因担心账号影响暂时停止尝试。
- 2026-04-28：本人补充操作：向虚拟客服提供完整提示和错误，随后修改文字并重做结束图，重试仍失败。并向另一位询问者说明客服入口。
- 帖内后续回复；绝对日期未取得：本人表示多数提示并未被拒绝，检查后账号仍正常；又说自己对连续拒绝导致封号的担心有所缓解。这没有确认原视频生成成功。

观察结果：有本人确认的修改、重试失败和后续账号状态自述；账户疑虑有所缓解，原任务没有完成确认。说将加入Discord只是意愿，没有加入或在那里解决问题的证据。

仍未解决：未取得完整输入、日志、支持工单或成功输出；无法裁决具体拒绝原因及审核正确性。不能将用户对风险的理解写成平台正式规则，也不能把暂时停止重试写成取消订阅或永久流失。

内容与运营分析：帮助内容应同时记录用户改了什么、是否再次执行和本人是否确认结果。得到回复、消除疑虑与完成任务需要分别标记；单看回复数会高估帮助效果。

- [Tried to generate on Kling, failed due to unsafe seatbelt related prompt - runway bot advised to update prompt and try again - failed again.](https://www.reddit.com/r/runwayml/comments/1sxdjf8/tried_to_generate_on_kling_failed_due_to_unsafe/)。发布/更新：2026-04-27；补充回复包含2026-04-28；查阅：2026-09-11。原始求助、回复建议和本人重试步骤；日期由同一URL搜索索引显示。全文还保留后续账户正常及疑虑缓解的回复。
- [本人后续：检查后账号仍正常](https://www.reddit.com/r/runwayml/comments/1sxdjf8/comment/oipliyg/)。发布/更新：页面仅显示相对日期；查阅：2026-09-11。原帖作者的后续账号状态自述，不是平台后台核验，也不是原任务成功记录。
- [本人后续：多数提示未被拒绝，主要担心是连续失败影响账号](https://www.reddit.com/r/runwayml/comments/1sxdjf8/comment/oiq2euf/)。发布/更新：页面仅显示相对日期，并标记编辑；查阅：2026-09-11。补充本人对提问目的及疑虑缓解的解释，防止只取最初停试表态而误判永久弃用。

商业化判断：既有订阅及API价格资料说明收费对象，本次没有补充收入数据。独立团队持续使用与发帖不证明社区促成购买；失败帖对套餐的自述也不是账单。社区对获客、续费或收入的增量贡献仍无可计量证据。


精选作者将创作延伸为主题和模板；另一位参与者表达退出，同伴表示接手。 模板实际采用、活动交接、长期回访及报酬未知；活动日期有官方文字冲突。

##### 每日创作习惯延伸为主题主持和模板供给


任务：把个人故事与感受转为图片，将每日挑战作为固定创作练习，并为其他参与者提供主题与起始模板。

问题：如何持续找到值得表达的题目，并在模型变化后保留个人表达；该访谈没有呈现一次明确的技术失败及修复过程。

- 2026-08-15（访谈显示的发布日期）：本人称每日挑战已进入晨间创作日常；官方文章展示其作品并列出三个模板入口，说明其参与My Sacred Space主题接管。
- 2026-08-17（另一篇官方文章显示的发布日期）：后续官方文章继续介绍该主题与三条模板入口。但两文分别将接管日期写为8月17日和8月15日，无法据此确定活动实际发生日。

观察结果：本人确认持续创作习惯，官方编辑展示其作品及主题、模板供给。没有验证他人使用模板后的结果；模板和活动页的读取未成功，不能确认活动投稿规模或复制成功。

仍未解决：实际挑战日期存在官方文字冲突；加入日期与持续习惯来自回顾性自述。模板使用量、回访、激励安排及是否领取供稿报酬未知。该精选作者不能代表普通用户。

内容与运营分析：兴趣内容可以从个人作品延伸到主题、参与作品和可再用模板，活动结束后仍保留进入方法。这里证明的是一种供给组合存在，不证明模板带来回访增长。


##### 投稿受阻后，创作者退出参与，同伴表示继续主持

非官方公开原始讨论：一名曾参与并主持挑战的创作者及同伴。角色来自本人或同伴自述，未核验站内账号关联；讨论来自对平台持批评意见的小社区，选择偏差明显。

任务：应他人邀请为一个主题拳击挑战制作并调整作品，同时参与自己所在群体主持的挑战。

问题：作者称完成调整后上传被过滤器拒绝，认为反复调整和担心处罚已影响参与意愿。未取得审核记录，不能据此认定平台误判。

- 帖内后续回复；绝对日期未取得：一名同伴表示会继续运行挑战，同时称已关闭自己的一个频道；作者则自述已把大部分剩余积分赠给同伴。这里不记录个人余额或具体转赠金额。
- 帖内后续回复；绝对日期未取得：同伴感谢收到积分并肯定作者此前分享方法。另一位主持人描述创作之外还要花时间投票与互动；这说明主持工作存在额外负担，但没有工时测量。

观察结果：能读到退出挑战的本人表态、具体转赠行动的自述及同伴回应，也有他人继续主持的意愿。没有后台转赠记录、后续挑战运行记录或账号活跃数据，不能确认永久离站或活动确实持续。

仍未解决：原投稿是否符合规则、申诉是否发生、活动是否移交成功及后来是否恢复参与都未知。主帖和回复不能用于推算审核误判率或全站流失率；退出生成、退出挑战和离开朋友网络并非同一件事。

内容与运营分析：内容供给不仅靠作品作者，也靠邀请、主持、评审和关系维护。评估活动时应分别记录投稿完成、主持接续和后续参与，而不能将挑战数量或一句退出表态直接当成供给稳定或用户流失。

- [Knocked Out (Sora-1)](https://www.reddit.com/r/Crappy_Art_With_Audio/comments/1q93dl7/knocked_out_sora1/)。发布/更新：2026-01-10；回复日期未逐条取得；查阅：2026-09-11。原作者描述受邀制作、调整、投稿被拒及退出挑战；同伴回复涉及继续主持、关闭频道和参与工时。日期由同一URL搜索索引及页面日期归档入口确认。未播放或采集作品。
- [原作者对同伴接手与积分转赠的后续回复](https://www.reddit.com/r/Crappy_Art_With_Audio/comments/1q93dl7/comment/nyyf2b9/)。发布/更新：页面仅显示相对日期；查阅：2026-09-11。原作者称已转赠积分、同伴感谢并表示继续主持。只采用行为自述与回应，不保存余额、转赠数额、私人联系信息，也不采用对平台命运的情绪化推断。

商业化判断：既有PRO与生成额度说明证明工具有收费方案。本次作者访谈未披露报酬；个别参与者的订阅或积分转赠自述不支持收入估算。积分在讨论中有时被称为income，不能转写成现金收入。社区关系可能影响参与选择属于个案解释，社区对购买、续费和收入的增量贡献仍未知。

#### Datawhale

同一贡献者两次修改被合并，其中一次经历追问、修正和合并。 作者评测未独立复现；代码合并不代表普通学员已经采用成功。

##### 课程代码收到审查后，作者修正并获合并

公开代码贡献者A；课程仓库维护者。贡献者不等同普通学员样本。

任务：改善第九章菜谱检索示例。

问题：贡献者认为BM25未实际参与检索，中文处理与结果合并需要调整。

- 2026-05-01：A提交PR #106，给出代码修改和自建评测说明。
- 2026-05-02：维护者指出同源分块可能重复计分；A确认问题，追加修正并回复。
- 2026-05-02：维护者将两次提交合并到主分支。

观察结果：审查、作者回应和合并均有公开记录；效果数字仅来自作者评测说明。

仍未解决：未取得评测集及脚本复验，也未见普通学员采用后的结果；不能与第八章Issue #102自动认定为同一修复。

内容与运营分析：内容审核能在投稿后继续发现错误，作者需要承担修订，平台需要有人审查。

- [PR #106：BM25中文检索与RRF合并修正](https://github.com/datawhalechina/all-in-rag/pull/106)。发布/更新：提交2026-05-01；审查与合并2026-05-02；查阅：2026-09-11。作者提交、维护者追问、作者追加修正和主分支合并；自建评测未独立验证。

##### 同一贡献者继续处理答案缺少步骤的问题

与PR #106相同的贡献者A；同一课程仓库维护者。两条PR只对应一名贡献者。

任务：让检索到的菜谱包含回答所需的完整步骤。

问题：作者指出命中菜谱仍可能遗漏步骤，说明检索命中不能替代最终答案检查。

- 2026-05-19：A提交PR #115，为结果补入父文档，并提供开关前后对照。
- 2026-05-23：维护者合并该改动；其开关默认关闭。

观察结果：同一贡献者数周内两次贡献被接纳。结果改善是作者的对照自述，不是独立学员成功。

仍未解决：未执行其评测；默认关闭意味着合并后不能假定所有使用者已获得该效果。

内容与运营分析：跟踪案例质量要检查最终输出及启用条件，持续供给可以包含对已发布案例的修补。

- [PR #115：父文档回填与菜谱步骤完整性](https://github.com/datawhalechina/all-in-rag/pull/115)。发布/更新：提交2026-05-19；合并2026-05-23；查阅：2026-09-11。与#106同一作者的后续提交、对照说明、默认关闭条件与合并记录。
- [PR #106：同一贡献者的前一次修订](https://github.com/datawhalechina/all-in-rag/pull/106)。发布/更新：2026-05-01至2026-05-02；查阅：2026-09-11。交叉确认两次PR属于同一公开账号，不按两名使用者统计。

商业化判断：公开合并说明贡献被接纳，不证明贡献者获酬、学员付费或课程带来收入。两条PR也不足以估计维护工时、成本或普遍响应速度。

#### LINUX DO

接入求助有本人确认；Wiki正文同时存在有用更正与领奖式编辑。 不能把晚于确认的公告当解决原因；有效编辑比例与后续稳定性未知。

##### 接入问题有本人确认，但不能倒置解决步骤

普通提问者A与回复者B；另有社区管理方发布的接口公告。

任务：让自己部署的NEWAPI使用LINUX DO登录。

问题：提问者配置后仍连接失败。

- 2025-11-07：管理方先前发布服务端备用接口公告。
- 2026-01-29（第1—7帖）：A求助并补充条件，B要求核查服务器连通性。
- 2026-01-29（第8帖）：A确认已解决，并将问题归于云服务器无法直连。
- 2026-01-29（第9帖）：B随后引用备用接口公告。

观察结果：提问者本人确认一次解决；公告引用晚于确认，不能认定其实际采用了备用接口。

仍未解决：具体配置变更、后续稳定性和当前可用性未复现；未读取或保存配置截图。

内容与运营分析：答疑应保留条件、本人结果与参考资料，但结果归因必须按实际先后顺序。

- [关于应用接入的问题请教佬友](https://linux.do/t/topic/1537782)。发布/更新：2026-01-29；查阅：2026-09-11。公开正文第1—9帖；第8帖确认早于第9帖公告引用，以同页帖子顺序核对，不另作时区推断。
- [LINUX DO Connect服务端添加备用接口](https://linux.do/t/topic/1144530)。发布/更新：2025-11-07；查阅：2026-09-11。求助回复引用的先前官方公告；不证明提问者采用该方案。

##### Wiki持续出现更正，也受到领奖式编辑干扰

首帖作者与Wiki共同编辑者；具体新增段落编辑者未核实，不归于同一作者。

任务：了解社区徽章的获取条件。

问题：操作说明会变化，编辑奖励又可能吸引无信息改动。

- 2025-01-11：徽章资料主题发布。
- 正文自标2026-09-04：阅读准则条目新增入口更正，并自称经过实测；该日期不是独立核实的修订时间。
- 正文自标2026-09-07至2026-09-09：Wiki编辑条目可见打卡式文字与编辑后未获徽章的疑问。
- 2026-09-11：本次读取上述内容和首帖防止无意义覆盖的提醒。

观察结果：当前正文包含有用途的更正和无信息编辑；未核实对应作者、修订差异及徽章发放结果。

仍未解决：有效维护比例与单个成员持续贡献未知，标题中的2月更新日期也不能代表全文最新变动。

内容与运营分析：共享编辑需要区分修正文档与为获奖而编辑，不能用编辑次数直接评价供给质量。

- [盘点L站的徽章：长期更新](https://linux.do/t/topic/342888)。发布/更新：首发2025-01-11；标题标2026-02-17更新；正文含2026-09-04及9月7—9日自标日期；查阅：2026-09-11。当前Wiki正文中的入口更正、打卡式编辑及维护提醒；未审修订历史，不把正文日期视为平台时间戳。

商业化判断：问题处理与资料维护体现社区作用，不代表外部NEWAPI的经营效果，也不能推算社区推广收入。徽章与编辑行为不证明付费意愿。

#### Hugging Face

额度讨论中有人确认恢复；曾提供的试衣替代应用当前显示暂停。 原试衣求助者成功与否、暂停原因及后续稳定性未知。

##### 额度问题：平台说明修复，使用者反馈仍需逐人核对

普通使用者A、B及后续回复者；官方论坛管理员。各账号不合并为同一用户。

任务：额度耗尽后继续调用Space。

问题：付费使用者称补充额度后仍被拒绝运行。

- 2026-03-31至2026-04-01：A报告充值后仍受限，并补充界面说明。
- 2026-04-02：管理员承认新功能曾短暂无法使用补充额度，回复称已修复。
- 2026-05-07：B先报告继续失败，当天再回复称调整访问凭证权限后恢复。
- 2026-07-17：其他成员报告相似报错；其中一人称曾恢复一次后再次失败。
- 2026-09-11：公开正文可读至7月17日；未读到A的最终确认。

观察结果：B有本人确认的局部恢复；管理员的修复说明不能替代A的验收。

仍未解决：不同报错的根因、持续可用性及账单均未独立核验。

内容与运营分析：结案需要记录具体账号的重试结果；相同报错下应保留不同处理条件。

- [Getting You have exceeded your Pro GPU quota error even with credits loaded](https://discuss.huggingface.co/t/getting-you-have-exceeded-your-pro-gpu-quota-error-even-with-credits-loaded/174850)。发布/更新：2026-03-31；所读回复至2026-07-17；查阅：2026-09-11。首帖、修复说明、B的两次反馈和7月故障记录；没有A的成功确认。
- [About Hugging Face Forums](https://discuss.huggingface.co/about)。发布/更新：未标日期；查阅：2026-09-11。官方论坛管理员名单用于核对4月2日回复者角色，不用于验证修复效果。

##### 试衣演示：有人补适配版本，当前应用仍可能暂停

普通使用者A、B；社区答疑者兼替代演示作者；应用状态由平台页面显示。

任务：在自己的Space使用IDM-VTON试衣。

问题：A自述购买PRO后仍无法运行，复制和重启也未奏效。

- 2025-09-15：A列出尝试步骤并称已申请退款；答疑者指出旧依赖可能有关。
- 2025-09-22：B称长期受阻而放弃；答疑者继续解释环境变化。
- 2025-09-23：同一答疑者发布兼容Gradio 5的替代Space链接。
- 2026-09-11：从原回复链接打开替代Space，页面显示Paused，并引导到Community请求重启；未执行应用。

观察结果：可以确认答疑者提供过替代应用，当前读取时应用暂停；未找到A或B采用后的成功反馈。

仍未解决：暂停开始时间与原因未知；不能把它归为修复失效，也不能认定原用户得到退款。

内容与运营分析：可复用案例需要运行状态与维护入口。发布补丁、应用在线和使用者完成任务应分别记录。

- [Pro Account – ZeroGPU Not Working Despite Subscription](https://discuss.huggingface.co/t/pro-account-zerogpu-not-working-despite-subscription/168446)。发布/更新：2025-09-15至2025-09-23；查阅：2026-09-11。付费受阻、放弃自述与同一答疑者提供适配版本；未见原提问者复验。
- [IDM VTON — Gradio 5适配Space](https://huggingface.co/spaces/John6666/IDM-VTON-GRADIO5)。发布/更新：未标日期；查阅：2026-09-11。本次读取应用页显示Paused；这是当前页面状态，不是运行测试或暂停原因诊断。

商业化判断：存在付费与退款申请自述，未核付款、退款或续费；修复与暂停记录不能计算付费成功率、流失率或平台收入。


### 编选、合作与成员贡献需要不同的交付约定


**Runway**：After Light作品页呈现影片、署名与返回TV入口，体现编选和展示。Creative Partners Program提供工具权益、早期访问与合作机会，并明确不要求特定时间或创作投入，因此不能按入选作者数推定稳定供稿。

[Runway Watch — After Light](https://watch.runwayml.com/after-light)；[Creative Partners Program](https://runway.com/creative-partners-program)



**LINUX DO**：公开邀请函鼓励作者提供完整内容、为社区读者改写介绍，并由成员协助整理、管理者精选。登录样本可见提问者回传结果、回复者提供依据和Wiki修订，参与者补充的材料不同。

[秘密花园园丁邀请函](https://linux.do/t/topic/847468)；[关于应用接入的问题请教佬友](https://linux.do/t/topic/1537782)；[盘点 L 站的徽章：长期更新](https://linux.do/t/topic/342888)

分析：供给不能仅按“官方”或“UGC”二分。作品可以由外部作者制作、平台编选，再由另一人整理过程；活动题目来自成员，规则解释仍需主持；技术答案来自用户，编辑仍要让后续读者找得到。应按实际工作和责任确定合作方式。

开放投稿能增加潜在来源，却不能保证持续有人制作和维护；合作计划中的资源权益也未必包含案例交付。官方编选可以提升可读性，但平台若包办制作、核验、回应与更新，同样会遇到产能限制。

多元拾光可借鉴：平台保证选题、编辑与发布质量；合作内容明确交付结果、过程材料、使用范围和维护期限；成员贡献在实际出现后记录，不列为启动期固定产量。

需要承担的工作：对每份内容指定实际制作与维护者。多账号发布按实际人力核算；如采购作者内容，稿件、素材和后续答疑分别约定，不能将工具额度默认为完整报酬。

仍需确认：目前没有可核的作者履约率、每人稳定稿量、主持人持续参与比例或平台编辑工时。多元拾光也缺少从选题到发布再到更新的完整工时记录，不能据竞品机制估算招聘人数或内容产量。

### 可复用内容需要版本、问题和修订共同维护

LiblibAI资源随模型路线改版，RunningHub作者补充说明与插件适配日志，Datawhale把学习反馈转入教材协作，Hugging Face将运行文件和问题讨论关联到资源仓库。实际维护对象包括输入条件、依赖、教程、旧版本和后续回应，更新封面或发布时间不能完成这些工作。

**LiblibAI**：电商精修V2保留V1关联，并说明模型、模块和配置变化；V1邀请使用者返图与提意见。已见作者维护说明，但未取得完整的返图、修订和用户确认过程。

[电商产品精修+背景替换（SDXL版）V1.0](https://www.liblib.art/modelinfo/6f92484476484efeb7bd5a0db113cbc0)；[电商产品精修+背景替换（FLUX）V2.0](https://www.liblib.art/modelinfo/7b89bfd25f7f418b82381e893a85c789?from=feed&versionUuid=791ecaae74b44c00a1b4423128084c10)

**RunningHub**：资源说明中有作者汇总问题并关联补充教学的做法，另一条长视频工作流保留跨日期插件适配日志。创作者奖励按有效运行、收藏和原创等条件计算；该奖励规则没有证明平台接管作者维护，也未披露维护工时。

[Flux Kontext Dev 模糊变高清及放大修复](https://www.runninghub.cn/post/1938533049359335425/)；[Scail-2 无劣化与长视频手动分段](https://www.runninghub.cn/post/2065490120324767746)；[创作者激励计划](https://www.runninghub.cn/creator-reward)

**Datawhale**：课程协作资料分别列课程入口、作业、直播、教材反馈与学习进度等工作。提问指南要求环境、错误和尝试信息，教材反馈由贡献者与教学团队讨论修订；助教为志愿者，没有即时回复义务。

[团队协作工作流](https://datawhalechina.github.io/learn-python-the-smart-way-v2/Contribute/workflows/)；[How to Ask Questions](https://datawhalechina.github.io/learn-python-the-smart-way-v2/Question/question/)；[课本编写与反馈收集](https://datawhalechina.github.io/learn-python-the-smart-way-v2/Contribute/contribute_detail/textbook_and_feedback/)

**Hugging Face：资源版本与讨论记录**：模型卡记录用途与限制，Space关联运行文件和资源讨论；官方文档允许通过讨论或PR提出修订，代码提交会触发重建。2025-09-23，一位答疑者发布适配Gradio 5的IDM-VTON演示说明，但未取得原求助者复验成功的记录。该记录证明作者提供了新版本，未证明原问题已经解决。

[Model Cards](https://huggingface.co/docs/hub/model-cards)；[Spaces Overview](https://huggingface.co/docs/hub/spaces-overview)；[Pull Requests and Discussions](https://huggingface.co/docs/hub/repositories-pull-requests-discussions)；[Pro Account – ZeroGPU Not Working Despite Subscription](https://discuss.huggingface.co/t/pro-account-zerogpu-not-working-despite-subscription/168446)；[同主题：提供适配Gradio 5的演示](https://discuss.huggingface.co/t/pro-account-zerogpu-not-working-despite-subscription/168446/6)

分析：内容能否继续使用，取决于变化是否被发现、能否找到负责的人，以及修订是否回到用户实际阅读的位置。可运行资源的维护通常更贴近技术支持；教程侧重步骤与错误解释；作品展示主要维护媒体、来源和说明。三类内容不宜采用相同产能假设。

作者写出修复说明或合入修改，仍不等于所有使用者已恢复成功；反过来，某一条讨论未见回复，也不能证明资源永久失效。后续验收应针对具体版本、输入与结果。

多元拾光可借鉴：以少量内容包记录制作、复核、答疑和更新工作；作品、教程与可运行资源分别列出必须维护的材料。出现问题后，修订应回到详情或教程正文，并保留受影响版本和继续使用的条件。

需要承担的工作：每份可复用内容有维护责任、问题入口和停止推荐条件。MakeNow素材显示问题由工具或素材维护者排查；运营负责整理说明与反馈，技术适配需有对应能力的人承担。费用核算包含重试、人工修整与支持时间。

仍需确认：公开资料能够确认维护行为和规则，不能提供平均响应时间、复验通过率、作者失联后的成本或实际利润。自身内容包尚无完整工时与费用，暂不设每周产量和维护人数。

合作规则说明可以约定什么，版本记录说明出现过维护工作；尚不能据此判断作者长期履约率、平台人效或活动带来的留存增量。

[15个平台的运营机制](platform-operations.md) · [作者与维护记录](content-research.json)

## 5. 商业化路径与公开规模

15个样本中，15家有平台内创作、开发或运行能力的资料，工具支持是常见条件。但内容的价值不止发生在执行环节：作品帮助判断效果，方法说明帮助选择和上手，讨论承担排错、反馈与交流。多元拾光需要比较哪些环节由MakeNow和API完成，哪些仍值得社区持续投入；已有工具资源尚不能决定社区定位。

| 数据类型 | 可用于比较 | 不能据此得出 |
| --- | --- | --- |
| 网站访问估计 | 同一提供方、同一月份的访问量与行为 | 真实用户数、留存、付费率 |
| 产品收入、ARR | 各自期间或年化口径的经营规模 | 统一收入排名、社区收入占比、利润 |
| 账户、会员与订阅 | 明确地域、期限及权益后的覆盖规模 | 跨平台去重付费人数 |
| 付费问卷 | 相应调查样本的自报经历 | 全国AI付费人数或全国付费率 |

### 工具支持关系

12家提供平台创作执行，3家提供开发与运行能力，共15家有平台执行能力资料。另有1家同品牌关联API、1家外部工具讨论社区和1家学习合作实践组织。

| 执行关系 | 数量 | 平台 |
| --- | --- | --- |
| 平台开发与运行 | 3 | Hugging Face、魔搭 ModelScope、Dify 社区 |
| 同品牌关联API | 1 | WaytoAGI 通往 AGI 之路 |
| 讨论与外部工具 | 1 | LINUX DO |
| 学习与合作实践 | 1 | Datawhale |

- 这15家是按研究需要选择的样本，不用于估算中国或全球AI社区的工具化比例。
- 平台有执行能力、执行服务收费、社区促进付款是三个不同问题；15家的计数只回答第一项。
- 图像、视频、GPU时间、应用工作区、许可和会员均可能收费，不能统一称为出售文本Token。
- 平台入口、自研模型、外部供应商和成员资源分别记录；工具收入也不直接等于社区贡献或利润。
- 吐司与Tensor.Art只计1个对象，但站点规则、权益、账户互通和实操结果仍分开。

LiblibAI：[会员与生成权益](https://insight.liblib.art/membershipInvitationBonus)；[原创工作流授权销售协议](https://www.liblib.art/activities/dd75ccf1b2674157ba11be35cb6a4a89/Original_ComfyUI_License_Agreement)；[API服务协议](https://www.liblib.art/activities/API-Service-Agreement)
RunningHub：[共享API计价](https://www.runninghub.cn/enterprise-api/sharedApi)；[创作者奖励规则](https://www.runninghub.cn/creator-reward)；[可运行应用样本](https://www.runninghub.cn/ai-detail/1966722305902718977)
吐司 / Tensor.Art：[吐司创作者激励调整](https://tusi.cn/articles/1000707189326777005)；[Tensor.Art创作者政策调整](https://tensor.art/articles/1021600128873589993)；[吐司Canvas更新](https://tusi.cn/updates)
SeaArt：[基础页面与内容类型](https://docs.seaart.ai/guide-1/1-seaart-ai-basic-page)；[模型与Remix](https://docs.seaart.ai/guide-1/2-seaart-ai-basic-function/2-6-models)；[模型训练说明](https://docs.seaart.ai/guide-1/3-advanced-guide/3-2-lora-training-advance/image-training/quick-training-guide)
OpenArt：[当前工作台](https://openart.ai/home)；[价格与权益](https://openart.ai/pricing)；[OpenArtist合作计划](https://openart.ai/program/openartist)；[旧工作流入口（重定向）](https://openart.ai/workflows/home)
即梦：[官网创作与同款入口](https://jimeng.jianying.com/)；[付费服务协议](https://lf3-cdn-tos.draftstatic.com/obj/ies-hotsoon-draft/dreamina/b966ce40-d931-4397-8def-38fe5d03c729.html)
可灵：[付费条款](https://kling.ai/docs/payment-policy)；[作者专题与工具用途](https://kling.ai/blog/kling-ai-turns-two-in-creators-own-words)
Leonardo.Ai：[价格与产品权益](https://www.leonardo.ai/pricing)；[公开作品后续使用](https://intercom.help/leonardo-ai/en/articles/8044018-commercial-usage)；[Blueprints当前能力](https://intercom.help/leonardo-ai/en/articles/12760267-blueprints-by-leonardo-ai)
Runway：[订阅与权益](https://runway.com/pricing)；[Workflow分享与复制](https://help.runwayml.com/hc/en-us/articles/45763528999699-Introduction-to-Workflows)；[Workflow发布为App](https://help.runwayml.com/hc/en-us/articles/47865876793747-Publishing-Workflows-as-Apps)；[API计价](https://docs.dev.runwayml.com/guides/pricing/)；[Runway Academy](https://academy.runwayml.com/)
WaytoAGI：[WayToAGI API文档](https://llm.waytoagi.com/docs)；[WayToAGI AI Websites目录](https://www.waytoagi.com/en/sites?tag=38)；[WaytoAGI知识库与工具首页](https://www.waytoagi.com/zh)
Datawhale：[Datawhale官方GitHub组织](https://github.com/datawhalechina)；[hello-rocm组队学习官方文档](https://raw.githubusercontent.com/datawhalechina/hello-rocm/master/docs/zh/learning/index.md)；[Datawhale组织治理](https://github.com/datawhalechina/whale-governance)
Hugging Face：[Spaces Overview](https://huggingface.co/docs/hub/spaces-overview)；[Billing](https://huggingface.co/docs/hub/billing)；[Pricing](https://huggingface.co/pricing)
ModelScope 魔搭：[魔搭署名的AI开源生态报告](https://www.wicinternet.org/pdf/GlobalValueandPracticalExplorationoftheAIOpenSourceEcosystemUnleashingtheFlywheelEffectandForgingaBornGlobalConsensus.pdf)；[魔搭Notebook功能与实操资源介绍](https://www.modelscope.cn/learn/435254)；[免费模型推理API发布说明](https://community.modelscope.cn/675262372db35d1195183bdb.html)
LINUX DO：[LINUX DO社区细则](https://linux.do/guidelines)；[LINUX DO订阅入口](https://linux.do/s)；[LINUX DO探索地图](https://linux.do/t/topic/1566233?tl=zh_CN)
Dify：[Dify Cloud Pricing](https://dify.ai/pricing/dify-cloud)；[Dify Pricing](https://dify.ai/pricing)；[Dify官方README](https://raw.githubusercontent.com/langgenius/dify/main/README.md)

### 工具内已有内容，社区新增价值取决于交付还缺什么

LiblibAI、RunningHub和Runway都把内容与执行入口连接起来。模型与工作流需要说明版本和依赖；简化应用需要明确可替换的输入；项目分享还受素材和权限范围影响。内容页能启动制作，完整任务仍可能需要选材料、改配置、排错与保存结果。

**LiblibAI**：电商精修资源V2链接V1，说明由SDXL转向FLUX后的输入、配置和模块变化。会员工作流许可协议另规定选入资源的授权销售；运行资格与资源许可需要分别核对。

[电商产品精修+背景替换（SDXL版）V1.0](https://www.liblib.art/modelinfo/6f92484476484efeb7bd5a0db113cbc0)；[电商产品精修+背景替换（FLUX）V2.0](https://www.liblib.art/modelinfo/7b89bfd25f7f418b82381e893a85c789?from=feed&versionUuid=791ecaae74b44c00a1b4423128084c10)；[会员工作流授权许可协议](https://www.liblib.art/activities/dd75ccf1b2674157ba11be35cb6a4a89/Original_ComfyUI_License_Agreement)；[LiblibAI创作图片商业使用规范](https://www.liblib.art/activities/e0aa50f25b874722ac60be71adb8c9cb/Commercial_Guidelines)

**RunningHub**：Klein试衣资源页提供两图输入说明，并列应用和工作流入口。另有公开用户在导入LTX流程后询问采样、节点与模型问题，答疑发生在Hugging Face讨论串。

[Klein虚拟试衣与商品局部替换](https://www.runninghub.cn/post/2074049801244917760)；[help me use runninghub for workflow so confused — Discussion #176](https://huggingface.co/RuneXX/LTX-2.3-Workflows/discussions/176)

**Runway**：官方App文档允许把Workflow封装为简化入口并锁定部分配置，修改需回到源流程，适用范围为工作区成员。Projects用于组织会话、流程与素材；这些能力不能直接视为公开社区模板市场。

[Publishing Workflows as Apps](https://help.runwayml.com/hc/en-us/articles/47865876793747-Publishing-Workflows-as-Apps)；[Introduction to Projects](https://help.runwayml.com/hc/en-us/articles/52913050653203-Introduction-to-Projects)

分析：内容与工具连接得越紧，用户跨站找入口的负担可能越小，但平台也会承担更多可用性和支持工作。多元拾光若复制一份工具已有的效果介绍，新增价值有限；若能帮助用户选对方法、理解前提、找回修订和完成接手，就有可比较的服务内容。这些是待验证的增量，不是已经证明的留存或收入。

并非所有内容都要交付完整流程。作品可以只提供观看和风格参考；工具内项目也可能满足团队继续制作。强制每条内容附带源文件或生成入口，会增加制作与维护成本，也可能妨碍普通阅读。

多元拾光可借鉴：按内容承诺组织材料：作品保留结果与来源，教程给出步骤和检查方法，可复用资源交代输入、依赖、版本与问题入口。优先补足工具使用中缺失的信息和支持，不另建重复的工具介绍库。

需要承担的工作：逐项核清MakeNow已能承接的材料、复制、保存和使用范围。现有一个案例验证了复制与文本保存；原件和副本有图片显示问题，再次生成与完整费用尚未核实。提供运行服务时，还需明确素材失效、节点适配和费用问题由谁处理。

仍需确认：缺少跨入口的完整任务记录，尚不能比较独立社区相对工具内部说明节省了多少步骤、降低了多少失败，或带来多少付费。也缺少相同任务的调用、重试、人工修改与支持成本。

### 执行可以在站外，解释、反馈与参与仍可留在社区


**Datawhale**：2026年6月ROCm共学资料明确由AMD Radeon Cloud提供免费GPU，Datawhale组织教材、日程、作业与答疑。all-in-rag用户问题涉及环境、API和检索检查，运行与结果检查中仍会发现需要修正的问题。该期活动已结束。

[hello-rocm 组队学习入口（官方原文）](https://raw.githubusercontent.com/datawhalechina/hello-rocm/master/docs/zh/learning/index.md)；[第一节执行示例报错 #125](https://github.com/datawhalechina/all-in-rag/issues/125)；[KIMI API失效 #121](https://github.com/datawhalechina/all-in-rag/issues/121)；[BM25检索中文分块问题 #102](https://github.com/datawhalechina/all-in-rag/issues/102)

**LINUX DO**：接入求助样本保留回复、采纳及提问者确认。Connect提供身份授权，Credit文档另描述服务接入与争议处理；外部工具的交付与收费依赖接入方，未确认论坛统一自营AIGC执行服务。

[LINUX DO Connect 文档](https://wiki.linux.do/Community/LinuxDoConnect)；[LINUX DO Credit 使用指南](https://credit.linux.do/docs/how-to-use)；[应用接入求助与采纳结果](https://linux.do/t/topic/1537782)



分析：这三种样本分别把学习进度、问题解决和兴趣参与留在社区。执行地点不足以解释社区价值，用户回到哪里补信息、得到反馈或参加活动更值得观察。对多元拾光而言，API和MakeNow既可作为执行入口，也可服务部分内容；内容的适用范围不必与自营工具完全重合。

站外执行也会分散流程和数据，社区未必能确认用户完成了什么。一个采纳结果或回访自述能够说明价值发生过，无法证明平台总体留存或经营可持续。

多元拾光可借鉴：分别记录内容阅读、练习结果、问题回应、兴趣参与和工具执行。用户领取过积分不应被一律剔除；被奖励的动作与其后的自主使用需要分开。

需要承担的工作：内容要有持续可查的材料，问题要有明确的回应与整理位置。平台组织的发布、回复和测试单列，运营账号不能计作独立贡献者或外部用户需求。外部工具的费用和履约不归入社区自营能力。

仍需确认：缺少这些行为在同一观察期内的持续记录，也缺少内容消费对工具使用、支持成本和收入的增量贡献。现有材料不能给出自营执行与外部执行哪种更优的总体排序。

### 生成能力已有实际收入规模，但不能据产品收入认定收入来自社区。

快手披露，可灵2026年第二季度营业收入超过8.5亿元人民币。这证明产品已有商业收入规模，但个人订阅、团队及API收入份额、社区贡献和产品利润尚未公开。

- **可灵 Kling AI**：快手披露可灵2026年第二季度营业收入超过人民币8.5亿元。个人订阅、团队制作和企业API均有收费入口，但未拆分各入口收入，也未单列社区贡献或可灵毛利。

依据：公司未经审核季度及中期业绩披露；统计对象为可灵产品，不是快手全公司或社区收入。

[快手2026年第二季度及中期未经审核财务业绩](https://ir.kuaishou.com/zh-hans/news-releases/news-release-details/kuaishoukejifabu2026niandierjidujizhongqiweijingshenhecaiwuyeji)

### 社区的付款方可以是商业推广者，普通阅读和讨论不必直接按Token或会员收费。

LINUX DO将普通成员讨论与商家推广采购分开，高级推广已有公开订阅商品。其可确认的是收费路径，论坛收入、付费推广方数量及推广效果仍未知。

- **LINUX DO**：LINUX DO在2026年9月9日的登录记录中提供US$600/月的高级推广订阅；规则将推广权益与普通讨论区分。该入口只确认商品、币种与周期，未验证结算、付款人数及续订。

依据：官方规则及指定日期的登录页面观察，尚无实际交易与财务账目。

[LINUX DO 订阅入口](https://linux.do/s)；[LINUX DO 社区细则](https://linux.do/guidelines)

全国去重AI付费人数仍未知。规模数据保留统计对象、时间、地域和来源性质，不将全球账户、综合会员、月活与访问次数相加。

[各平台商业化与经营规模](business-data.json) · [公开访问数据](public-data.json) · [AI付费用户数据](china-ai-users.md)

## 6. 多元拾光的采用条件

四种方案分别明确筛选、解法、作品与练习的交付范围，并把竞品记录落实到内容展示、结果核验和维护责任。实际能力、工时、完整工具交付及外部需求仍待验证。

| 方案 | 需要持续承担 | 最低范围 |
| --- | --- | --- |
| A · 任务方法与精选内容社区 | 把任务输入、账户或服务区域、必要付费条件放到方法比较中。卡片说明是阅读方法、取得文件还是在线使用；详情注明检查日期。入口不可用时保留方法说明，调整执行入口与推荐理由。；实测推荐须明确实践者和审查责任人，留存输入、关键设置与结果检查。学习文章可以只交付方法解释；没有独立复核的作者案例保留作者说明身份，不把它直接写成平台验证结论。；更正须指明受影响条目、具体条件、来源和修改内容，审核后进入正文。问题记录保留尝试、答复、实际调整和本人结果；没有回传就保留未确认。运营整理与真实读者反馈分别记录，奖励若设置，应围绕被接纳的有效贡献。 | 围绕一个任务编排专题，把已有材料整理为方法比较、步骤说明和关联问答；依据不足的比较项保留未知。只有明确实践者、审查人并完成关键结果检查的方法，才标为平台实测推荐。通过现有内容页人工维护来源、入口和更正，不要求先开发开放编辑或奖励系统。 |
| B · AI应用解法与实践社区 | 解法详情增加本人执行的动作、输出检查与日期；仅有诊断或作者说明的内容按排查记录呈现。卡片说清已确认的范围，使用者回传结果单独记录。；示例卡片交代运行位置和最近检查日期，详情说明必要设置与依赖。资源暂停时保留说明和问题记录，撤下当前可运行的承诺；替代链接只按已查证的状态介绍。；供给职责分开编写、技术复核、结果检查与后续维护，允许同一人承担多项，但每项须有实际记录。没有维护负责人时，只发布截至核验日期的例子，不开放持续排错承诺。 | 以一个材料完整的真实问题为起点，先确认编写、结果检查和维护责任，在限定环境下呈现输入、处理动作与输出对照。通过现有教程和讨论承载，外部资源注明来源、必要设置及检查日期。只有排查过程而没有结果时，发布排查记录；未落实维护责任时，不开放持续排错服务。 |
| C · 视觉创作与方法复用社区 | 保留作品流，同时为确有连续内容的项目提供集合入口；成片、分集和对应幕后过程相互关联。项目卡说明已有可访问内容，制作讲解写清各工具与人工环节承担什么，不把整个作品归功于单一模型。；方法详情对应具体材料版本，写清依赖、可替换输入、已检查输出和入口检查日期。更新说明解释哪些副本受影响、如何继续使用；确认入口不可用或无法核对时调整执行动作，保留作品和过程。失败反馈记录修改与重试结果。；主题先作为可观看、可了解做法的作品集合。只有明确主持人、回应范围、投稿问题处理与结束安排后，才开放参与。模板是可选材料；没有合适模板或主持能力时保留编辑选集，不许诺活动服务。 | 围绕一份真实作品整理可观看结果与对应制作说明；已有连续内容时用集合和关联链接组织，不预定产量。材料只开放能确认的交付范围，完整复用通过后再承诺相应执行步骤。主题可先采用编辑选集，主持与参与支持落实后再开放投稿；无需为这几种内容同时开发独立频道。 |
| D · 创作练习与反馈社区 | 练习入口分别说明仅参考示范、自主参与、申请具体反馈；作品卡片与详情不默认存在点评或修订。反馈型社区须有明确接手者和实际回应；仅有题目与示范时，可以提供学习材料，但不足以兑现反馈承诺。；开放反馈前确认点评者、回应范围和可用时间；负责人退出时暂停接受该项反馈，先说明已有提交如何处理。接替者确认范围后再恢复，未落实时保留题目与示范供自主练习。；作品详情保留目标、建议、作者是否尝试及实际结果；没有返稿就不补造前后对比。共性方法只提炼已有材料支持的判断，不以任务奖励要求用户交出改善结论。 | 在点评者、可用时间和处理范围明确的条件下，围绕一个题目和真实示范开放有限反馈，完成已接手的回应。缺少接手者时，只能准备自主练习材料，尚不足以验证反馈型方案。平台示范与外部尝试分开记录，不用示范稿模拟用户返稿。 |

### 工作流、画布与教程若承诺复用，应交付输入要求、依赖和排错记录，而不只提供封面或复制按钮。

多元拾光可按使用目的组织内容：作品展示结果，教程解释过程，工作流与画布附输入、依赖和问题记录。公开案例表明这些环节各有实际工作，分享能力与支持责任应一并评估。

- **RunningHub**：RunningHub公开使用记录中，外部LTX流程仍需调整采样、节点或模型，答疑发生在Hugging Face讨论串；Datawhale课程用户在代码能运行后还检查检索结果。工具执行、方法解释和问题处理分别承担工作。

依据：公开用户自述、讨论过程与课程记录；尚未验证完整项目交付、平均节省时间或支持成本。

[help me use runninghub for workflow so confused — Discussion #176](https://huggingface.co/RuneXX/LTX-2.3-Workflows/discussions/176)；[BM25检索中文分块问题 #102](https://github.com/datawhalechina/all-in-rag/issues/102)；[团队协作工作流](https://datawhalechina.github.io/learn-python-the-smart-way-v2/Contribute/workflows/)

### 内容消费、社区参与、工具生成与付款需要分别判断，奖励用户不必一律筛除，也不应以签到代替任务完成。

竞品记录显示，参与活动、持续生成和解决问题可能是不同使用目的。多元拾光应分别观察阅读、学习、求助、操作和付款，按各自任务判断价值，不能仅凭积分来源或发帖量认定用户质量。


依据：用户自述与历史登录观察；跨工具回访为2023年个案，当前行为未知，各样本不能估计总体留存。


当前内容由平台维护，后续也按平台持续供给核算。MakeNow已有一个案例的复制与文本保存证据，素材完整性、再次生成和完整费用仍未核实。

[自身条件与证据缺口](platform-supply.md) · [MakeNow研究](makenow-current.json) · [四份方案的证据与采用条件](strategy-comparison.md)

## 待讨论的问题

- 分别阅读四份方案的内容承诺与责任后，哪些职责已有能力承担，哪些只能通过合作或缩小范围提供？
- 对一份实际内容，如何核对制作、编辑、结果检查与修订的工时，以及素材、工具和生成费用？
- 当自身供给与工具交付记录补齐后，哪些方案具备进入用户需求验证的条件？

## 研究深度与未解问题

现有材料已超过功能罗列，能够将具体任务、产品机制、使用困难和部分收费结果联系起来；但用户样本稀疏、平台观察深度不齐，尚不足以验证主力客群、留存因果或经营优劣。

| 方面 | 已达到的层次 | 缺口 |
| --- | --- | --- |
| 产品与内容结构 | 已经分析到入口、字段、详情、交付对象与后续操作。 | 不同内容形式的实际采用率未测。 |
| 运营与供给 | 已有合作条款、版本变化、原始问题及维护回应；七家代表另有跨日期使用、贡献或退出参与记录。 | 多数缺少工时、供稿频率与激励净效果。 |
| 用户与任务 | 46条任务画像另附七家代表的过程记录，分别核对本人反馈、作者说明及官方精选材料。 | 样本稀疏，无法还原平台用户总体。 |
| 实际使用 | 部分平台有生成、保存、再次打开或复用检查。 | 未对15家完成同一任务的全流程验证。 |
| 经营结果 | 已有定价规则、部分经营披露和第三方访问估计。 | 利润、留存因果和社区收入贡献未验证。 |

## 平台档案

- [LiblibAI](../appendix/liblib.html)
- [RunningHub](../appendix/runninghub.html)
- [吐司 / Tensor.Art](../appendix/tusi.html)
- [SeaArt](../appendix/seaart.html)
- [OpenArt](../appendix/openart.html)
- [即梦 AI](../appendix/jimeng.html)
- [可灵 Kling AI](../appendix/kling.html)
- [Leonardo.Ai](../appendix/leonardo.html)
- [Runway](../appendix/runway.html)
- [WaytoAGI 通往 AGI 之路](../appendix/waytoagi.html)
- [Datawhale](../appendix/datawhale.html)
- [Hugging Face](../appendix/huggingface.html)
- [魔搭 ModelScope](../appendix/modelscope.html)
- [LINUX DO](../appendix/linuxdo.html)
- [Dify 社区](../appendix/dify.html)
