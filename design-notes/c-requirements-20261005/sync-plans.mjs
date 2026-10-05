import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const target=path.resolve(dir,'../../app/community-options/prototype-review/product-plans-c.json');
const plans=JSON.parse(fs.readFileSync(target,'utf8'));
const set=(id,fields)=>plans[id]={...plans[id],...fields};
set('circles',{scenario:'PC 从一级圈子进入交流首页；手机从社区进入圈子列表。',need:'PC 快速切换推荐和已加入圈子的帖子，手机找回已加入及发现圈子。',role:'PC 左侧帖子流、右侧个人发帖入口和圈子信息；手机使用圈子列表。',rationale:'宽屏同时展示内容与参与入口；手机按列表到详情逐层浏览。',journey:'PC 切换圈子即筛选帖子并更新右侧信息，查看全部进入发现圈子；手机选圈子进入详情。',boundary:'公开浏览不强制加入；圈内发帖需加入并有权限，退出不删除历史帖。'});
set('circle',{need:'了解圈子主题、公告和公开讨论。',rationale:'基本资料和公告帮助判断是否参与，圈内发布带入当前圈子。',journey:'手机从列表或关联进入详情；PC 同一圈子在圈子首页切换内容及右侧资料，不另设重复详情。'});
set('tutorials',{scenario:'PC 从一级教程导航进入；手机在社区教程栏目按主题寻找内容。',journey:'按有效分类筛选，进入同一教程详情；默认最近正式公开更新时间倒序，同时间按标识稳定排序。'});
set('tutorial',{journey:'阅读正文与目录，查看引用作品或关联应用；可复用能力进入应用详情，参考素材在关联内容内说明。',boundary:'教程由官方维护；失效引用不泄露原内容，也不自动使整篇教程下架。'});
set('create',{journey:'图片、剧本、视频按所选模型展示有效参数与输入约束。PC 在连续任务流中生成、查看结果、继续调整和主动发布，手机使用适配工作台；活动关联随任务带入发布。',boundary:'社区生成与 MakeNow 应用执行分开。任务超时不等于失败或退款；结果不自动公开；限额、模型、报价和进度使用有效配置，不硬编码样本值。'});
set('my-relations',{audience:'希望回访已关注作者的用户。',scenario:'从我的关注统计或关系入口找回作者。',need:'查看和管理作者关注关系。',role:'只承接关注作者；圈子和粉丝各自独立。',rationale:'按关系对象区分，避免作者和圈子混排。',journey:'PC 在我的左侧导航切换关注面板；手机进入关注作者列表，再打开作者主页。',boundary:'取消关注不删除内容或改变公开权限。'});
set('mine',{journey:'PC 左侧切换内容、投稿、草稿、生成记录、收藏及关注、圈子、粉丝面板；手机通过内容标签与关系统计入口找回对应对象。',boundary:'内容管理五类列表不新增独立一级页面；PC 关系在本人空间切换，手机保留独立关系列表；私有数据不进入公开作者主页。'});
set('community',{journey:'手机作品、交流、教程分别保留筛选和位置；PC 分别映射 AIGC、圈子首页、教程。发布由对应全局创作或圈内入口承接。',boundary:'手机消费列表不增加独立发布按钮；栏目共享对象身份，不复制详情。'});
set('discussion',{role:'手机社区交流栏目；PC 兼容入口进入圈子首页。',journey:'浏览帖子并阅读或展开评论；PC 可切换圈子，手机通过所属圈子进入详情。'});
set('author',{role:'公开展示作者资料、统计及作品和帖子。',boundary:'普通与官方账号均不展示个人 AI 应用或教程栏目；不暴露积分、绑定资料、收藏、草稿、生成记录与私人管理。'});
set('app',{journey:'先读用途与展示样本、使用条件，再通过已配置且适配设备的入口到 MakeNow；目录入口与具体能力入口明确区分。',boundary:'执行、费用、任务和结果由 MakeNow 承载；可打开地址不代表身份互通、素材传递或结果回传已实现。'});
set('work',{journey:'不同入口进入同一作品与评论。阅读图片/视频/文本、作者、提示词及有授权的参考素材；复制提示词或主动选择同款后进入支持的创作路径。',boundary:'不编造缺失提示词或素材授权；关联能力失效与作品下架分别处理；生成同款不自动发布。'});
const extra={
 'discover-circles':{audience:'希望发现新圈子的PC访问者。',scenario:'从圈子首页推荐圈子的查看全部进入。',need:'集中浏览可加入的公开圈子。',role:'PC二级发现列表，手机由现有圈子列表承接。',rationale:'圈子首页保持讨论重点，发现页承担完整供给。',journey:'看圈子资料、加入或进入圈子首页选中该圈子。',boundary:'当前不提供搜索；加入与浏览分开；不新增PC圈子详情。',success:'能查看全部有效圈子并回到对应讨论。'},
 'my-circles':{audience:'已经加入圈子的用户。',scenario:'从我的找回讨论空间。',need:'查看和管理本人加入关系。',role:'PC本人空间的圈子面板；手机我的圈子列表。',rationale:'圈子关系与作者关注分开。',journey:'查看圈子进入对应端讨论；退出后刷新本人关系。',boundary:'退出不删除历史帖，关闭圈子按公开权限处理。',success:'正确找回圈子，退出不影响原帖身份。'},
 'my-fans':{audience:'查看关注自己用户的作者。',scenario:'从我的粉丝统计或左侧粉丝入口进入。',need:'浏览粉丝并访问作者或回关。',role:'PC粉丝面板和手机粉丝列表。',rationale:'粉丝是别人关注我的关系，与我关注谁分开。',journey:'查看作者，主动关注或取消本人已建立的关注。',boundary:'取消回关不删除对方关注本人的关系。',success:'粉丝与关注关系方向准确，操作后数量口径一致。'}
};
Object.assign(plans,extra);
delete plans.resource;
fs.writeFileSync(target,JSON.stringify(plans,null,2)+'\n');
console.log('Aligned affected product plans');
