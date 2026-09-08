import type { DeepDive, ResearchImage, TaskRecord } from './research-types';
const img=(file:string,title:string,url:string,kind:ResearchImage['kind'],observation:string,limitation='取图避开账户区域。截图只证明当时可见状态。'):ResearchImage=>({file:'/research-images/'+file,title,url,date:'2026-09-09',kind,observation,limitation});
const limit='仅使用既有免费资源；没有充值或公开发布。每平台最多 3 次提交，包含重试。';
const task=(steps:string[],result:string,attempts=0,scope='围绕虚构白陶瓷杯，检查进入、配置、生成、保存与再使用。'):TaskRecord=>({date:'2026-09-09',scope,steps,result,attempts,limit});
export const fieldAccess:Record<string,string>={
 liblib:'已登录，完成模板发现、生成配置与资产入口检查；停在提交前，未确认当前扣款将使用免费资源。',
 runninghub:'已登录并打开 AI 应用目录。首次设置与新功能提示在本会话反复出现；未提交生成。另有官方工具指南，界面观察与文档分开。',
 tusi:'吐司已生成 1 张、保存到素材库、重新打开并做同款；Tensor.Art 已检查模型带入和参数模板，未生成。两站按一个产品组研究，权益不推定互通。',
 civitai:'第一轮曾读取官方公告；第二轮访问 civitai.com 被浏览器工具策略阻止。补核官方 GitHub 文档，没有尝试绕过站点限制，也未完成登录生成。',
 seaart:'已登录，查到图片配置、每日体力说明和私密创作 VIP 开关。停在生成前，没有把 Free 标签等同于免费私密生成。',
 openart:'已登录，完成广告案例 Remix、图片生成、资产找回、参考图续作，共提交 2 次并得到 2 张结果；生成使用注册试用资源，未公开。',
 nightcafe:'公开规则和官方帮助页可核；当前 Studio 的浏览器访问被工具策略阻止，未实操。所附帮助页截图不代替登录产品体验。',
 jimeng:'已登录，默认 5.0 Pro 提交进入会员页；切换 4.0 后用既有赠送积分生成 1 张。离开后重新打开本次记录，恢复提示词和配置，未再生成。',
 kling:'已登录，用既有赠送灵感值生成 1 张。已在资产管理中找到结果，打开详情并重新编辑，恢复配置；未再次生成。',
 midjourney:'官方文档已核：网页与 Discord 没有免费试用。当前标签仍停在注册入口，未进入创作工作区；未订阅或提交生成。',
 leonardo:'官方 Blueprints 目录与说明可核；用户标签仍停在含服务条款确认的首次设置，未代为同意，未生成。',
 runway:'官方项目、Workflow/App 和 Academy 资料可核；用户标签仍停在使用者身份设置，未代填身份、未生成。',
 waytoagi:'About、公开组织材料、历史共创与访谈可读。第二轮取得参与角色页面；未投稿、报名、联系作者或验证付费服务。',
 datawhale:'官方课程、贡献指南与组织资料可读。第二轮核查 P2S 的提问、反馈、任务分工；未报名课程，也未实测课程完成与留存。',
 huggingface:'模型卡、官方 Hub 文档与代码公开可核；已取得模型资源页截图。没有创建或复制 Space，也未配置凭据或运行付费计算。',
 modelscope:'已登录，打开运行中的图片编辑创空间和公开 README，检查参考图、参数与复制入口；未上传、复制、运行或创建资源。',
 linuxdo:'按本轮范围仅做公开研究，未登录、提问或测试通知。论坛页面在研究浏览器中加载受限；指南、公开导航与 Credit 文档分别注明来源。',
 dify:'已登录，检查基础聊天模板和复杂研究模板的预览、配置与创建条件；未创建应用、发送消息、授权插件或配置 API 凭据。'
};
export function applyFieldEvidence(d:Record<string,DeepDive>){
 d.liblib.images=[img('liblib-input.jpg','模板选择之后的图片输入区','https://www.liblib.art/ai-tool/image-generator','登录产品页','可调整模型、比例和张数，提交前显示本次积分成本。已填任务，尚未生成。')];
 d.liblib.task=task(['从电商模板进入复用，模板被加载到原页面输入区。','判断“整套电商主图”模板与单杯白底图不完全匹配，转到图片生成器。','填写白杯任务，检查模型、比例、数量和生成成本；查看资产分类与重新编辑入口。'],'完成输入准备。可见 18 积分报价，但没有确认免费扣款来源，因此未提交；生成、保存与再次生成仍未核验。');
 d.liblib.ux.unshift('实际点击模板卡片主体会进入详情，点击“使用模板”则直接加载创作框。两条入口减少了部分跳转，但用户仍需判断模板是否适合自己的任务。');
 d.runninghub.images=[img('runninghub.png','官方 AI 应用使用指南','https://www.runninghub.cn/blog/ai-prompts-use-cases/runninghub-ai-apps-guide','官方资料页','研究应用如何把 ComfyUI 工作流包装成少量输入。','这是官方教程页，不能据此评价当前登录页的流畅程度。')];
 d.runninghub.task=task(['登录后依次遇到新控制台、会员促销、密码设置和银行账户功能提示，未填写或绑定。','打开 AI 应用目录，看到按用途和模型分类的精选应用。','尝试关闭可选提示；部分提示在本会话再次出现。'],'没有进入一次完整的免费生成。弹层重复只作为本会话现象记录，不能推定所有用户都会遇到。');
 d.runninghub.ux.unshift('本会话开始任务前同时出现多种与当前创作无关的提示。对新用户而言，了解账单、购买会员、设置密码和完成图片任务是不同目的；可以测量这些提示是否打断首个任务。');
 d.tusi.images=[img('tusi-detail.jpg','吐司商品工具的实际输入字段','https://tusi.cn/template/812146249464777940','登录产品页','输入仍显示 TA Node - PromptText、LoadImage 和 LoraLoader；案例要求先有商品参考图。'),img('tusi-result.jpg','吐司首张白底杯图','https://tusi.cn/template/812146249464777940','登录产品页','从普通文生图生成器得到结果，保留 AI 生成标记。','这是普通文生图结果，并非上方商品换背景工具的运行结果。'),img('tusi-library.jpg','保存后在素材库找回图片与参数','https://tusi.cn/library','登录产品页','素材库保留输入、模型和尺寸等信息，并提供做同款、编辑和下载。'),img('tensor-config.jpg','Tensor.Art 模型带入后的生成配置','https://tensor.art/models/662744072865292090/MooMooE-commerce-V1','登录产品页','模型自动带入，仍有 LoRA、ControlNet、采样和参数模板入口。','该站只检查配置，没有提交生成；不能沿用吐司的成功结果。')];
 d.tusi.task=task(['先查看商品换背景工具，发现必须准备参考图，因此转入普通文生图。','填写白杯任务，采用 Z-Image-Turbo、1024×1024、1 张；得到带 AI 标记的杯图。','点击添加到素材库，重新打开素材库后找到该图和生成参数。','从素材库点击做同款：提示词、模型、尺寸和采样等带入；原随机种子仍需要额外选择使用。','Tensor.Art 完成电商模型发现、模型带入及参数模板入口检查，未生成。'],'吐司完成生成、保存、找回和配置复用。未用新素材再次提交，也未验证换背景工具。生成前有 3 次按钮激活，最终只有 1 个任务被接收；未继续消耗试次。',1);
 d.tusi.ux.unshift('素材保存与临时生成历史不能混为一谈。本次生成详情显示到期日期，保存到素材库后可另行找回；不能据一个任务的日期推定全部资源的统一保留期。“做同款”带入主要设置，但不会自动固定原随机种子。');
 d.seaart.images=[img('seaart-config.jpg','图片参数与两种 VIP 选项','https://www.seaart.ai/create/image','登录产品页','Private Creation 和 Free Creation 均关闭并标 VIP，输入区另外显示 Free。','不同位置的 Free 含义不能直接合并。本轮未提交。')];
 d.seaart.task=task(['查看 Z Image Turbo 图片入口与每日体力说明。','填写白杯主题，查看默认比例、两张输出和 Free 标签。','检查 Private Creation：关闭且标 VIP；未修改或购买。'],'已完成配置观察。非私密结果是否进入社区未确认，不满足本轮已确认的非公开范围，因此没有生成。');
 d.seaart.ux.unshift('当前页面同时出现体力、Free 标签、Private Creation 与 Free Creation。用户需要分别理解本次扣费和结果可见范围；只看生成按钮附近的 Free，容易忽略其他条件。');
 d.openart.images=[img('openart-result.jpg','第一张图片及其输入','https://openart.ai/suite/create-image/nano-banana-2','登录产品页','Nano Banana 2、1 张、4:3、1K；生成结果出现在资产区并带品牌水印。'),img('openart-reuse.jpg','从保存的杯图继续制作场景图','https://openart.ai/suite/create-image/nano-banana-2','登录产品页','从 Media 找回白底图，经 Use → Reference image 带入，再改成窗边木桌场景，第二次生成成功。','两次观察只能证明本次流程走通；没有测量普遍商品一致性或商用交付率。')];
 d.openart.task=task(['关闭来源问卷、升级推荐与更新介绍，找到广告案例并进入 Remix。','原案例带入参考图和视频参数；根据当前任务转到图片工具。','用现有注册试用额度完成白底杯图；进入 Media 后仍可找到结果。','由 Use → Reference image 把首图带回创作页，要求保留杯型、把手和底环，改为窗边木桌。','第二次生成得到场景图；参考图和两次结果在同一工作区可见，未发布或去水印。'],'完成两次生成、资产找回和参考图续作。没有下载到本地，也没有验证 7 天之后能否找回。',2);
 d.openart.ux.unshift('首次使用前连续出现问卷、升级推荐与更新说明。进入制作后，Media 的 Use 菜单把编辑、重建、参考图和图转视频分开；本次成功把保存的图继续用于新场景。');
 d.openart.sources.push({title:'OpenArt 当前服务条款',url:'https://openart.ai/suite/terms',date:'2026-07-30',type:'官方',note:'5.5 默认私密及免费未发布内容保留期；4.1 商业用途条件优先于旧 FAQ'}, {title:'OpenArt 新版帮助中心',url:'https://openart.ai/suite/help-center',date:'未标更新时间；访问 2026-09-09',type:'官方',note:'注册试用资源、生成预留、失败通常返还及图片默认私密'});
 d.openart.sections.push({title:'免费试用的保存与使用条件',status:'事实',paragraphs:['新版帮助说明生成图片默认私密，发布才对其他用户可见；本轮使用已有注册试用资源。生成前可见成本，失败通常返还，不能保证每次即时返还。','7 月 30 日条款写明非订阅用户未发布创作保留 7 天，商业用途授权限定为 Plus 及以上。旧 FAQ 有更宽泛表述，本报告保留冲突并采用更新条款的限制，不把免费内部样图当作可商用证明。'],refs:[d.openart.sources.length-1,d.openart.sources.length]});
 d.civitai.images=[img('civitai-evidence.png','官方资源关联说明','https://github.com/civitai/civitai/blob/main/docs/features/image-resources.md','官方资料页','说明作品与模型、LoRA 等资源的关联、筛选和归因。','这是官方代码仓库文档截图，当前 civitai.com 的登录界面未取得。')];
 d.nightcafe.images=[img('nightcafe-doc-retry.png','Promptle 的任务、反馈与分享规则','https://help.nightcafe.studio/portal/en/kb/articles/promptle-daily-ai-art-puzzle','官方资料页','同一题目提供起始图、目标图和有限修改，帮助页明确仍属 Alpha。','当前 Studio 访问受工具策略限制；帮助页可读，不代表已进入或完成游戏。')];
 d.jimeng.images=[img('jimeng-input.jpg','即梦图片任务入口','https://jimeng.jianying.com/ai-tool/home/?type=image','登录产品页','生成模式、模型、比例、数量与按张成本放在同一输入区。','截图为初始两张配置；提交前另改为单张方图，实际结果见下方记录。')];
 d.jimeng.images.push(img('jimeng-result.jpg','免费额度生成结果与继续编辑入口','https://jimeng.jianying.com/ai-tool/home/?type=image','登录产品页','图片 4.0 得到杯图；结果下提供修改建议、重新编辑和再次生成。','前一次 5.0 Pro 提交进入会员页。换模型后重新核对了数量，未沿用自动变回四张的配置。'));
 d.jimeng.task=task(['从 Agent 切到图片生成，查看已有每日赠送积分。','填写白杯任务，改为单张、1:1、2K；默认图片 5.0 Pro 的提交进入会员页，没有接收生成任务。','返回后换图片 4.0，数量自动变回 4 张；再改回 1 张，页面标 1/张。','再次提交后得到 1 张杯图。离开创作页后，从本次对话记录重新打开结果。','点击重新编辑，恢复提示词、图片 4.0、1:1、2K、1 张；没有再次提交。'],'完成一次生成、历史找回与配置复用。共激活提交两次，实际接收一个任务；使用已有赠送积分，未购买会员。尚未测试换参考图的第二次制作和长期归档。',1);
 d.jimeng.ux.unshift('更换模型后输出数量从 1 自动变成 4，需要再次检查。结果页直接提供“把背景换成木质桌面”等续作建议，把下一步放在图片旁；本轮只检验了重新编辑，未点击这些建议生成。');
 d.kling.images=[img('kling-config.jpg','可灵 Omni 图片配置','https://klingai.com/app/omni/new','登录产品页','分辨率、比例与数量放在浮层；右侧另有生成历史与资产入口。','这是生成前配置；实际提交改为 1 张，结果另行记录。')];
 d.kling.images.push(img('kling-result.jpg','可灵本次生成的杯图','https://klingai.com/app/omni/new','登录产品页','排队后出现一张结果，保留平台生成标记。','杯身倾斜并呈悬浮感，与任务要求的正面棚拍和自然落影仍有差距；本轮没有修到可交付标准。'));
 d.kling.task=task(['进入 Omni 图片模式，确认已有每月免费赠送灵感值。','填写白杯任务，采用图片 3.0 Omni、2K、智能比例、1 张，提交成本显示 2。','任务进入队列，提示预计等待大于 10 分钟；随后生成成功，没有为加速购买会员。','打开资产管理，在未分类作品中找到本次杯图；打开详情可见创意描述、模型、时间和使用选项。','点击重新编辑，提示词、模型、2K、智能比例与单张配置恢复。没有点击再次生成。'],'完成一次生成、资产找回与配置复用。结果仍需验收，不把生成成功算作商品可采用。没有验证元素库复用或跨场景一致性。',1);
 d.kling.ux.unshift('本次结果自动进入创作资产，详情把使用工具和重新编辑分开。排队时只有“大于 10 分钟”的预估，还伴随会员加速入口；对有交付时限的人，等待是否可接受需要在真实任务中判断。');
 d.leonardo.images=[img('leonardo.png','Blueprints 按用途发现','https://app.leonardo.ai/blueprints/platform','公开产品页','模板目录按具体用途与职业组织，帮助用户先判断要做什么。','本图来自公开目录；用户首次设置未完成，未执行模板生成。')];
 d.leonardo.task=task(['打开用户已登录标签，页面仍是首次使用 Step 1 of 2。','Continue 下包含同意服务条款，留给用户本人处理。'],'未进入工作区，也未提交生成。',0,'核对首次使用状态；不代用户同意条款。');
 d.runway.images=[img('runway-academy.png','官方自定义工作流课程','https://academy.runwayml.com/course/custom-workflows','官方资料页','研究从节点、输入到可复用流程的教学组织方式。','本轮用户工作区仍有首次身份设置；课程页面不能替代登录实操。')];
 d.runway.task=task(['打开用户标签，停在首次设置 Step 1 of 4。','页面要求选择使用者身份，没有可见跳过；未替用户填写。'],'未进入工作区、未创建项目或提交生成。',0,'核对首次使用状态；不代填身份。');
 d.midjourney.images=[img('midjourney-rooms.png','官方解释为什么移除 Web Rooms','https://updates.midjourney.com/an-update-on-rooms/','官方资料页','该公告把功能下线与过多目标、扩展问题关联，是分析聊天室取舍的直接证据。','官方公告页，非当前创作界面；没有免费网页生成实操。')];
 d.huggingface.images=[img('huggingface.png','模型卡、版本与社区入口','https://huggingface.co/Qwen/Qwen3-8B','公开产品页','资源详情将 Model card、Files and versions、Community 放在同一处。','示例模型只用于观察资源组织，没有下载、复制或运行。')];
 d.datawhale.images=[img('datawhale.png','P2S 教学团队的工作分工','https://datawhalechina.github.io/learn-python-the-smart-way-v2/Contribute/workflows/','官方资料页','作业、文字教程、答疑与进度跟进分别有对应工作，不应把完成度全部归功于页面。','这是 P2S 课程规则，不能外推成 Datawhale 所有活动的统一流程。')];
 d.waytoagi.images=[img('waytoagi-participate.png','学习、贡献与组织的参与方式','https://about.waytoagi.com/','官方资料页','公开介绍区分学习者、内容贡献与组织工作。','属于组织自述，不能据图中规模信息推算活跃或留存。')];
 d.linuxdo.images=[img('linuxdo-repository.png','LINUX DO Credit 官方开源文档','https://github.com/linux-do/credit/blob/master/README_zh.md','官方资料页','图中说明社区账号接入与信任等级；文档下方另有贡献流程。Credit 官网与仓库互相链接，已核归属。','这是 Credit 文档，不能代替论坛本体的界面截图或登录实操；论坛与文档站在研究浏览器中加载受限。')];
 d.linuxdo.sources.push({title:'LINUX DO Credit 官方仓库',url:'https://github.com/linux-do/credit',date:'未标文档更新时间；访问 2026-09-09',type:'官方代码库',note:'credit.linux.do 官网开源贡献入口链接本仓库，仓库反向链接官网；只研究文档，不运行程序'});
 d.dify.images=[img('dify-template.jpg','模板预览区明确列出创建条件','https://cloud.dify.ai/','登录产品页','基础聊天模板示例标示最多 5 条试用消息，右侧列出必须配置的模型；可以查看编排详情。','本轮没有发送消息。看到试用说明，不代表已经试用或自己创建的应用开箱即用。')];
 d.dify.task=task(['检查基础聊天模板的试用说明、编排详情与必须配置项。','对照复杂市场研究模板：依赖模型、Skill 及搜索工具授权，预览试用不可直接进行。','没有从模板创建应用、配置模型或授权工具，也没有发送试用消息。'],'明确区分看模板、试用示例、创建自己的应用和完成配置；本轮只完成前者的界面核验。',0,'登录后只读检查模板预览与创建前条件；不是图片生成测试。');
 d.dify.task.limit='只读查看；未创建、发送、授权或消耗资源。';
 d.dify.ux.unshift('同一预览窗把示例体验、编排详情和必须配置项放在一起。基础聊天示例与复杂研究模板的可试程度不同；社区可以降低发现方法的成本，不能替使用者补齐模型与外部服务。');
 d.modelscope.images=[img('modelscope-app.jpg','运行中图片编辑创空间的输入要求','https://modelscope.cn/studios/Boogu/boogu-image-edit-gradio','登录产品页','页面同时展示输入图、编辑指令、输出与运行信息，上方另有复制、文件和交流反馈。','运行状态与复制按钮不证明用户已成功运行或复制；本轮没有提交。')];
 d.modelscope.task=task(['打开一个运行中的图片编辑创空间，核对参考图、编辑指令、输出区与配置说明。','打开公开 README，对照 1K 预览、2K 与显存配置；看到复制与交流反馈入口。','没有上传素材、运行编辑、复制创空间或创建计算资源。'],'完成应用和代码说明之间的条件核查。模型资源可找到，不等于图片任务已完成；不同创空间的输入和算力要求需要单独看。',0,'只读检查一个图片编辑创空间与 README。');
 d.modelscope.task.limit='只读查看；未上传、复制、运行或创建资源。';
 d.modelscope.ux.unshift('图片编辑表单在结果区旁明确要求先有参考图，运行信息另设区域；顶部的“运行中”只能说明服务状态。用户能试用一个展示应用，与能复制并维持自己的应用，是两项不同能力。');
}
