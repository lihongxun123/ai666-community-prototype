# 一致性创作案例：实际材料交付核查

核查日：2026-09-13（北京时间10:26—10:29）。只读公开正文与配置字段；没有登录运行、生成、下载媒体或权重、付费、联系作者。依据此前供给对照，本次检查4个原对象，另追到1个明确关联的上游替代。

结论：四个原对象均未取得可直接复做同案例的完整交付包。这个结论是材料核查状态，不是它们不能运行：Liblib一条明确关闭工程下载，一条只有部分参数，OpenArt提供方法但无固定案例包，RunningHub当前正文读取失败。上游另有可检查的三场景JSON，出现了可以逐项处理的文件名、精度和随机种子问题。

“未取得完整交付包”是本次材料状态，不表示工具无法运行。只有3个原对象此次正文可读；RunningHub保留为直接读取失败。以下“已读”不代表作者或平台的效果承诺已验证。

| 对象 | 当前能交付到哪一步 | 下一项缺少的证据 |
|---|---|---|
| [9分镜in-context作者工作流](https://www.liblib.art/modelinfo/f9476636e9c04a22a107882f7a2098df?from=pic_detail) | 有在线操作说明，原工程不可直接离线复做 | 原作者授权工程或明确改走DR-05；把三分屏到九分镜的组织说明补齐。 |
| [一致性连贯电影镜头丨分镜丨镜头](https://www.liblib.art/modelinfo/60c89401121e4d81998ed8bb26d94751?from=search) | 提示方法可读，执行项目尚未形成 | 精确LoRA、Qwen版本、输入图绑定与可读取工程；再谈重复执行。 |
| [一致性视频教程＋Character Builder](https://openart.ai/blog/how-to-maintain-consistency-in-ai-videos/) | 有可操作方法；缺同案例材料和固定运行配置 | 完整参考/场景提示包、角色配置、模型设置与该次费用；另确认保存/导出方式。 |
| [一键生成多镜头+多角度](https://www.runninghub.cn/ai-detail/2069946576503660545) | 访问未复核，暂不能发作可立即复做的交付入口 | 正文可访问和真实参数面板是第一步；索引、同标题页面不能代替。 |
| [上游film-storyboard.json替代模板](https://github.com/ali-vilab/In-Context-LoRA/blob/main/workflow/film-storyboard.json) | 公开配置可检查，可另行搭建；依赖/文件名/版本仍需对齐 | 对齐权重文件名/精度并固定环境和种子；此次没有执行这个步骤。 |

## DR-01 · 9分镜in-context作者工作流

原研究对象。关联DP-001顶层4、5、6、7、8、10：项目材料、多人/运动/切镜条件；这些评论没有亲测过程。这里只复核供给，没有新增评论样本。

| 交付要素 | 实际读到 | 尚未确认 |
|---|---|---|
| 原始输入 | 按角色占位符和场次填写逐行分镜提示，正文建议转英文。 [S01](https://www.liblib.art/modelinfo/f9476636e9c04a22a107882f7a2098df?from=pic_detail) | 完整示例输入包、运行器必填控件与校验规则未取得。 |
| 文件与许可 | 作者明确暂不开放工作流下载；在线运行仅为页面说明。 [S01](https://www.liblib.art/modelinfo/f9476636e9c04a22a107882f7a2098df?from=pic_detail) | 作者工程JSON未取得；示例素材和作者编排的再分发许可未见。 |
| 参数与版本 | 作者默认1024×1536，建议较高清用1280×1920；只建议更换模型和提示。 [S01](https://www.liblib.art/modelinfo/f9476636e9c04a22a107882f7a2098df?from=pic_detail) | 作者节点图、模型文件/修订、种子和插件版本未公开到本次所读正文。 |
| 成本说明 | 正文说明每次66积分。 [S01](https://www.liblib.art/modelinfo/f9476636e9c04a22a107882f7a2098df?from=pic_detail) | 当前账户结算、失败重试扣费和九分镜总价未核；不换算现金。 |
| 失败定位 | 作者指出改变比例可能产生4/5分屏，裁切比例也需随之改动。 [S01](https://www.liblib.art/modelinfo/f9476636e9c04a22a107882f7a2098df?from=pic_detail) | 没有可复核失败输入/输出配对、任务日志或八人运动问题定位。 |
| 输出承诺 | 标题宣传9分镜；正文讲三分屏生成与后续裁切。 [S01](https://www.liblib.art/modelinfo/f9476636e9c04a22a107882f7a2098df?from=pic_detail) | 未核9镜组织节点，不能承诺直接交付九段视频或运动一致性。 |

复做前的具体阻断：

- **离线复做作者版本**：明确不开放JSON，无法复制作者编排。 所需补件：开放许可及具体版本工程；否则选择DR-05上游模板另建流程。
- **在线第一次运行**：尚未核输入控件、模型选择与当次结算。 所需补件：用户自主在可用账户中确认字段和费用后才能评估运行。
- **兑现评论中的复杂视频要求**：现有证据是分镜图说明。 所需补件：相同人数/动作/切镜的实际输入与逐段结果。

替代关系：上游公共三场景模板是独立替代，不能标成已经取得本作者九分镜工程。

## DR-02 · 一致性连贯电影镜头丨分镜丨镜头

原研究对象。关联DP-001顶层5、6、8、10：镜头转接和运动条件。这里只复核供给，没有新增评论样本。

| 交付要素 | 实际读到 | 尚未确认 |
|---|---|---|
| 原始输入 | 按下一场景、摄影机方向、光照/氛围和风格写提示，串联多次生成。 [S02](https://www.liblib.art/modelinfo/60c89401121e4d81998ed8bb26d94751?from=search) | 如何提交初始图、参考图数量、各字段格式在所读正文不明。 |
| 文件与许可 | 已读的是工作流介绍和提示示例。 [S02](https://www.liblib.art/modelinfo/60c89401121e4d81998ed8bb26d94751?from=search) | 没有取得JSON、LoRA文件；未见下载许可或商业使用条件，不能把未知写成禁止下载。 |
| 参数与版本 | 说明Qwen Image Edit与LoRA强度0.7—0.8。 [S02](https://www.liblib.art/modelinfo/60c89401121e4d81998ed8bb26d94751?from=search) | Qwen修订版、LoRA精确文件、尺寸、采样器、步数、种子、节点依赖未确定。 |
| 成本说明 | 所读范围未提供。 [S02](https://www.liblib.art/modelinfo/60c89401121e4d81998ed8bb26d94751?from=search) | 对象费用、运行时间、重试成本未见。 |
| 失败定位 | 明确侧重风景/定场、场景递进，不以静态肖像或精细物体操控为目标。 [S02](https://www.liblib.art/modelinfo/60c89401121e4d81998ed8bb26d94751?from=search) | 这是适用范围说明，没有可重放的错误日志或修复前后材料。 |
| 输出承诺 | 作者描述连续图像序列与叙事分镜。 [S02](https://www.liblib.art/modelinfo/60c89401121e4d81998ed8bb26d94751?from=search) | 未读到每次张数和视频交付规格；运动词描述镜头变化，不等于已经生成连续运动视频。 |

复做前的具体阻断：

- **第一次复做**：无法把0.7—0.8落到明确LoRA和已连接节点。 所需补件：该对象工程、确切文件名及初始图输入绑定。
- **要求人物/物件精细一致**：作者声明的优化目标并非精细物体操控。 所需补件：用目标场景核适用性，不能只调整强度便承诺成功。

## DR-03 · 一致性视频教程＋Character Builder

原研究对象及其官方功能/条款补证。关联DP-001顶层2、4、5、6、7、8、10：如何开始、参考输入、排错与成本。这里只复核供给，没有新增评论样本。

| 交付要素 | 实际读到 | 尚未确认 |
|---|---|---|
| 原始输入 | 角色可从参考图、文本或预设建立；保存后以角色名复用；视频另配场景、动作和产品/风格参考。 [S03](https://openart.ai/blog/how-to-maintain-consistency-in-ai-videos/)、[S11](https://openart.ai/features/ai-character/) | 没有教程案例的原图、完整提示序列与已保存角色资产。 |
| 文件与许可 | 条款要求生成账号；Plus及以上允许符合条款的输出商用；输入须有必要权利。 [S13](https://openart.ai/suite/terms)、[S03](https://openart.ai/blog/how-to-maintain-consistency-in-ai-videos/) | 未见教程项目/角色资产可导出的文件包或第三人再分发许可；输出使用权不等于教程素材与软件开放。 |
| 参数与版本 | 教程要求确定模型、时长、比例和分辨率，固定角色/参考并记录种子。 [S03](https://openart.ai/blog/how-to-maintain-consistency-in-ai-videos/)、[S11](https://openart.ai/features/ai-character/) | 无某一完整案例的固定模型修订与数值；教程和当前角色页列举的模型组合不同，不能拼成同一次配置。 |
| 成本说明 | 定价页Plus显示12,000积分/月及商用字样，价格文本同时显示$34与$27/席/月。 [S12](https://openart.ai/suite/pricing) | 没有核定周期或结算价；套餐近似视频数排除Director，不能据此算教程多场景任务单价。 |
| 失败定位 | 教程把脸变、物件消失、风格漂移分开，建议加参考角度、短片段和按场景修改。 [S03](https://openart.ai/blog/how-to-maintain-consistency-in-ai-videos/) | 未取得失败项目和修正结果；这是供应商建议，不能认定已解决。 |
| 输出承诺 | 功能页提供可复用角色，教程描述多场景制作入口。 [S11](https://openart.ai/features/ai-character/)、[S13](https://openart.ai/suite/terms) | 条款不保证匹配提示或结果质量；角色资产能复用不等于八人切镜不漂移。 |

复做前的具体阻断：

- **照教程复做同一个例子**：没有原参考、完整场景提示、角色资产和设置快照。 所需补件：一份获准使用的输入包与各镜头配置。
- **做自己的在线任务**：账号与可用积分、选定模型/时长的实际消耗未核。 所需补件：实际账户输入页与单次预估；此次未登录运行。
- **交付可持续维护项目**：服务内资产并非已取得离线工程；条款有未订阅/停订后保存期。 所需补件：在实际产品核导出格式及资产备份方式，不能承诺永久留存。

## DR-04 · 一键生成多镜头+多角度

原研究对象；此次直接读取失败。关联DP-001顶层4、5、6、7、8、10：一键入口、素材与复杂镜头条件。这里只复核供给，没有新增评论样本。

| 交付要素 | 实际读到 | 尚未确认 |
|---|---|---|
| 原始输入 | 旧索引仅说上传图片。 [S04](https://www.runninghub.cn/ai-detail/2069946576503660545) | 当前文件类型、像素、张数及必填控件未读到。 |
| 文件与许可 | 索引出现工作流/API入口；同标题同作者另有工作流页候选。 [S04](https://www.runninghub.cn/ai-detail/2069946576503660545)、[S05](https://www.runninghub.cn/post/2069941228808003585) | 未验证两入口绑定；未取得JSON、素材、模型或许可。入口文字不是文件已交付。 |
| 参数与版本 | 所读范围未提供。 [S04](https://www.runninghub.cn/ai-detail/2069946576503660545)、[S05](https://www.runninghub.cn/post/2069941228808003585) | 底模、LoRA、尺寸、种子、节点及应用版本未知；候选页日期仅来自索引。 |
| 成本说明 | 索引称按实际用量计费。 [S04](https://www.runninghub.cn/ai-detail/2069946576503660545) | 无本次报价和重试规则；不引用招揽注册的赠额为实际预算。 |
| 失败定位 | 所读范围未提供。 [S04](https://www.runninghub.cn/ai-detail/2069946576503660545) | 没有读到具体排错说明；当前研究阻断为正文读取超时，不等于应用运行失败。 |
| 输出承诺 | 索引标题宣称多镜头/多角度，分类为图生图。 [S04](https://www.runninghub.cn/ai-detail/2069946576503660545) | 张数、尺寸、是否视频、人物运动保持均不可确认。 |

复做前的具体阻断：

- **所有复做判断**：原应用此次两次正文失败；相关工作流页也未打开。 所需补件：重新读到原应用的实际参数面板和关联工作流，先恢复对象级证据。
- **离线工程或商用**：文件与许可均未取得。 所需补件：明确版本文件和权利说明；不要把同标题他人应用借来补齐本对象。

## DR-05 · 上游film-storyboard.json替代模板

由DR-01明确链接追到的上游替代；不是Liblib作者九分镜工程。关联DP-001顶层4、7：可取得工作流材料；不证明是foyege同款项目。这里只复核供给，没有新增评论样本。

| 交付要素 | 实际读到 | 尚未确认 |
|---|---|---|
| 原始输入 | README给出带角色名及三场景标记的文本结构。 [S06](https://github.com/ali-vilab/In-Context-LoRA) | 没有与评论者目标一致的输入包；需自备合法题材和提示。 |
| 文件与许可 | 具体JSON正文已读；HF列表有film-storyboard.safetensors，标172MB，仅核目录。 模型卡标MIT，但正文要求遵循FLUX；底模许可另限制模型/衍生模型使用，输出条款另列。 [S07](https://github.com/ali-vilab/In-Context-LoRA/blob/main/workflow/film-storyboard.json)、[S08](https://huggingface.co/ali-vilab/In-Context-LoRA)、[S09](https://huggingface.co/ali-vilab/In-Context-LoRA/tree/main)、[S10](https://huggingface.co/black-forest-labs/FLUX.1-dev/blob/main/LICENSE.md)、[S06](https://github.com/ali-vilab/In-Context-LoRA) | 原JSON未另存、权重未下载；训练数据许可不能从仓库可访问推成可商用。 |
| 参数与版本 | JSON实际用flux1-dev、Euler、simple/20步、guidance3.5、1024×1536、LoRA强度1/1、RandomNoise模式randomize。 [S07](https://github.com/ali-vilab/In-Context-LoRA/blob/main/workflow/film-storyboard.json) | main未固定提交和运行环境；JSON version0.4不是ComfyUI版本。 |
| 成本说明 | 所读范围未提供。 [S06](https://github.com/ali-vilab/In-Context-LoRA) | 本地硬件、推理耗时和成本未测；README训练所需24GB不应当作本流程推理实测。 |
| 失败定位 | JSON Note有模型目录与内存问题提示。 实际LoRA节点为movie-shots.safetensors，HF发布文件为film-storyboard.safetensors；Note写T5 fp16，实际DualCLIP加载fp8。 [S07](https://github.com/ali-vilab/In-Context-LoRA/blob/main/workflow/film-storyboard.json)、[S09](https://huggingface.co/ali-vilab/In-Context-LoRA/tree/main) | 未导入验证；这些是可定位的配置对应问题，不是已观察的报错。 |
| 输出承诺 | 三场景分镜模板接SaveImage，交付目标是图片。 [S06](https://github.com/ali-vilab/In-Context-LoRA)、[S07](https://github.com/ali-vilab/In-Context-LoRA/blob/main/workflow/film-storyboard.json) | 没有九段动画、时长、音频或复杂运动保持承诺。 |

复做前的具体阻断：

- **导入后加载模型**：LoRA文件名与发布目录不一致；T5说明与节点精度不同。 所需补件：先明确要使用的权重，再在节点中重新选择匹配文件；不假定同名或自动适配。
- **复算同一次结果**：种子节点为randomize，环境和主分支未锁定。 所需补件：保存当次种子、模型校验值、节点/ComfyUI版本，仍不能承诺跨环境逐像素一致。
- **当成作者同款九分镜**：上游只有三场景示例，与作者裁切/编排未比对。 所需补件：明确作为替代任务交付，原作者工程继续标未取得。

## 已读配置中的差异

| 差异 | 对复做的影响 | 来源 |
|---|---|---|
| 工作流LoRA名movie-shots.safetensors与发布目录film-storyboard.safetensors不一致。 | 照原节点导入可能找不到对应权重；未实际运行。 | [S07](https://github.com/ali-vilab/In-Context-LoRA/blob/main/workflow/film-storyboard.json)、[S09](https://huggingface.co/ali-vilab/In-Context-LoRA/tree/main) |
| 注释要求T5 fp16，但实际加载字段为t5xxl_fp8_e4m3fn.safetensors。 | 需按选定精度核文件与内存，不能仅复制Note。 | [S07](https://github.com/ali-vilab/In-Context-LoRA/blob/main/workflow/film-storyboard.json) |
| 条款页首2026-07-30与页尾2026-07-20不一致。 | 可引用条款所读内容，不能擅自认定唯一更新日。 | [S13](https://openart.ai/suite/terms) |
| 教程和当前角色功能页列举的模型组合不同。 | 属于随服务变化的说明，未固定同案例模型版本。 | [S03](https://openart.ai/blog/how-to-maintain-consistency-in-ai-videos/)、[S11](https://openart.ai/features/ai-character/) |

不能把文件列表当权重已到手，也不能把JSON的0.4格式字段当成固定的软件环境。上游提供了可核的依赖信息，仍需在后续获准执行时核对实际加载、输入和结果。此轮没有借替代模板证明原作者工程已交付。

## 来源与阅读边界

所有访问发生于2026-09-13 02:26:40—02:29:35 UTC，即北京时间10:26:40—10:29:35。逐页秒级时间未单独记录，因此JSON用真实访问区间而非补造时间。日期“未显示”保留缺失；原研究八周窗口与此次供给快照分开。

| 来源 | 发布／修改或版本 | 实际阅读范围 |
|---|---|---|
| [S01 · 大师级AI视频前后9分镜头一致性in-context工作流](https://www.liblib.art/modelinfo/f9476636e9c04a22a107882f7a2098df?from=pic_detail) | 未显示 | 作者正文25—100行：输入格式、分辨率、积分、分屏异常与不开放下载；未打开运行器。 |
| [S02 · 一致性连贯电影镜头丨分镜丨镜头](https://www.liblib.art/modelinfo/60c89401121e4d81998ed8bb26d94751?from=search) | 未显示 | 作者正文25—66行：Qwen Image Edit、镜头提示、LoRA强度和适用限制。 |
| [S03 · How to Maintain Brand Consistency in AI Videos](https://openart.ai/blog/how-to-maintain-consistency-in-ai-videos/) | 2026-08-05 | 正文118—236行：角色保存、参考输入、输出设置、排错、费用与许可说明；外部模型排名和测试主张不作为效果证据。 |
| [S04 · 一键生成多镜头+多角度](https://www.runninghub.cn/ai-detail/2069946576503660545) | 未显示 | 此次两次打开均失败；只取得搜索索引中的作者应用介绍与计费文字，索引标注约3周前抓取。未读到当前实际输入控件。 检索日不是页面更新时间；不把索引字段当当前可运行性。 |
| [S05 · 一键生成多镜头+多角度（工作流页候选）](https://www.runninghub.cn/post/2069941228808003585) | 2026-06-25；同一索引另有NaN.NaN.NaN | 搜索索引中同标题、同作者和打开AI应用文字；直接打开失败。没有实际核对其应用跳转目标。 仅索引显示且内部日期字段异常，保留原样，不当当前版本。 |
| [S06 · Official repository of In-Context LoRA for Diffusion Transformers](https://github.com/ali-vilab/In-Context-LoRA) | 2024-11-07（发布消息） | README的发布消息、训练/推理材料区分、MODEL ZOO、License；未训练。 |
| [S07 · workflow/film-storyboard.json](https://github.com/ali-vilab/In-Context-LoRA/blob/main/workflow/film-storyboard.json) | 未显示 | GitHub可读JSON的模型加载、Note、采样、分辨率、RandomNoise、LoRA、SaveImage与version字段；文件页标952行/16.5KB。未保存原文件、未导入运行。 |
| [S08 · ali-vilab/In-Context-LoRA model card](https://huggingface.co/ali-vilab/In-Context-LoRA) | 未显示 | 模型卡标签、Film Storyboard条目、FLUX许可说明。 |
| [S09 · ali-vilab/In-Context-LoRA Files & versions](https://huggingface.co/ali-vilab/In-Context-LoRA/tree/main) | 未显示 | 文件列表中film-storyboard.safetensors，显示172MB；未点击权重下载。 |
| [S10 · FLUX.1 [dev] Non-Commercial License v1.1.1](https://huggingface.co/black-forest-labs/FLUX.1-dev/blob/main/LICENSE.md) | v1.1.1 | 许可1—3节，区分模型/衍生模型使用与输出使用；仅记录原条文范围，不替代具体项目授权判断。 |
| [S11 · AI Character Generator](https://openart.ai/features/ai-character/) | 未显示 | 功能正文124—238及FAQ：三条输入路径、角色复用、当前模型示例；未使用创作控件。 |
| [S12 · OpenArt Pricing](https://openart.ai/suite/pricing) | 未显示 | 套餐可见价格、积分、Plus商用字样与加购区；没有切换计费周期、登录或结算。 静态文本同时出现原价与折扣价，选中周期未核。 |
| [S13 · OpenArt Terms of Service](https://openart.ai/suite/terms) | 2026-07-30（页首）；2026-07-20（页尾） | 2.1账号、3.2积分、4.1—4.2输出使用与无保证、5.1输入权利、5.5保存期，以及页首/页尾日期。 同页日期冲突，modifiedAt保留null，未自行选定生效版本。 |
