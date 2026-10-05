'use client';
import {useState} from 'react';
import {MobileBrowserFrame} from './mobile-browser-frame';
import './overlay-gallery.css';

type Sample={pcOnly?:boolean;id:string;title:string;owner:string;shape:'dialog'|'menu'|'notice';trigger:string;rule:string;variants:{id:string;title:string;query:string}[]};
const samples:Sample[]=[
 {id:'activity-choice',title:'活动参与方式',owner:'activity',shape:'dialog',trigger:'活动详情 → 投稿作品',rule:'只在活动中选择生成后发布或上传作品；关闭保留活动背景，不恢复PC全局创作选择入口。',variants:[{id:'choice',title:'选择参与方式',query:'item=guoqing_qitianle_20261001&reviewOverlay=activity-choice'}]},

 {id:'navigation',title:'导航快捷入口',owner:'home',pcOnly:true,shape:'menu',trigger:'导航搜索框 / 头像',rule:'使用真实原型导航组件；点击外部或 Esc 收起，选中入口跳转。',variants:[{id:'search',title:'搜索推荐',query:'reviewOverlay=nav-search'},{id:'account',title:'我的快捷菜单',query:'reviewOverlay=nav-account'}]},
 {id:'operations',title:'运营与公告',owner:'home',pcOnly:true,shape:'dialog',trigger:'首页配置或用户消息触发',rule:'以下为固定演示文案与奖励值。推广、登录推广、精选和公告分别展示；同一时刻只显示一层。频控、服务端已读和奖励发放仅在需求交接，不由原型执行。',variants:[{id:'promotion',title:'首页推广',query:'reviewOverlay=ops-promotion'},{id:'login',title:'登录推广',query:'reviewOverlay=ops-login-promotion'},{id:'featured',title:'精选奖励',query:'reviewOverlay=ops-featured'},{id:'featured-many',title:'多作品精选',query:'reviewOverlay=ops-featured-many'},{id:'announcement',title:'系统公告',query:'reviewOverlay=ops-announcement'}]},
 {id:'reminders',title:'导航提醒',owner:'home',pcOnly:true,shape:'notice',trigger:'活动 / 积分入口',rule:'非模态提示，可关闭或进入对应业务；本地样值不代表真实待办或余额。',variants:[{id:'task',title:'任务提醒',query:'reviewOverlay=ops-task'},{id:'expiring',title:'积分临期',query:'reviewOverlay=ops-expiring'}]},
 {id:'invite',title:'邀请规则',owner:'invite',shape:'dialog',trigger:'邀请有礼 → 查看完整规则',rule:'复用邀请规则弹层，关闭回到邀请页。规则正文可滚动。',variants:[{id:'rules',title:'完整规则',query:'reviewOverlay=invite-rules'}]},
 {id:'delete',title:'删除内容',owner:'mine',shape:'dialog',trigger:'我的内容 → 删除图标',rule:'取消保留内容；确认仅移除当前本地演示记录。',variants:[{id:'content',title:'删除确认',query:'panel=content&reviewOverlay=content-delete'}]},
 {id:'work-media',title:'作品图片预览',owner:'work',shape:'dialog',trigger:'作品主图',rule:'关闭回到作品详情；不新增重复作品详情页面。',variants:[{id:'image',title:'查看大图',query:'item=girl&reviewOverlay=work-image'}]},
 {id:'post-media',title:'帖子图片预览',owner:'post',shape:'dialog',trigger:'帖子图片',rule:'点击图片查看大图，关闭返回原帖子。',variants:[{id:'image',title:'查看大图',query:'reviewOverlay=post-image'}]},

 {id:'account',title:'账号绑定',owner:'profile-edit',shape:'dialog',trigger:'编辑资料 → 账号与绑定',rule:'手机号与微信各自打开绑定表单。关闭回到编辑资料，保留背景。验证码、扫码及绑定均为本地演示，不发送短信、不修改真实账号。',variants:[{id:'phone',title:'绑定手机号',query:'reviewOverlay=account-phone'},{id:'wechat',title:'绑定微信',query:'reviewOverlay=account-wechat'},...['phone-change','wechat-change','phone-unlink','wechat-unlink','last-method'].map((id,i)=>({id,title:['更换手机号','更换微信','解绑手机号','解绑微信','唯一登录方式保护'][i],query:'reviewOverlay=account-'+id}))]},
 {id:'generation-video-preview',title:'参考素材预览',owner:'create',pcOnly:true,shape:'dialog',trigger:'生成工作台 → 点击参考图片或视频',rule:'仅预览当前参考素材，关闭回工作台，不创建生成任务。',variants:[{id:'image',title:'参考图片',query:'reviewOverlay=aigc-reference-image'},{id:'reference',title:'参考视频',query:'reviewOverlay=aigc-reference-video'}]},
 {id:'aigc-extra',title:'生成条件与视频参数',owner:'create',pcOnly:true,shape:'menu',trigger:'AIGC 工作台参数与参考素材',rule:'视频参数为固定演示值，不映射真实模型收费。积分不足保留输入，不创建任务；参考视频可预览和移除。',variants:[...['type','video-quality','video-duration'].map((id,i)=>({id,title:['创作类型','视频画质','视频时长'][i],query:'reviewOverlay=aigc-'+id}))]},
 {id:'aigc',title:'创作参数选择',owner:'create',shape:'menu',trigger:'AIGC 生成 → 输入框下方参数',rule:'菜单锚定触发控件展开。选择更新参数后收起；点击外部或按 Esc 收起，不清空输入、不提交生成。',variants:[{id:'model',title:'模型选择',query:'reviewOverlay=aigc-model'},{id:'ratio',title:'比例选择',query:'reviewOverlay=aigc-ratio'},{id:'activity',title:'活动选择',query:'reviewOverlay=aigc-activity'}]},
 {id:'points',title:'积分变动提醒',owner:'points',shape:'notice',trigger:'服务端确认积分变动 → 积分入口附近',rule:'非模态轻提示，不加遮罩、不夺焦点，自动收起。到账与退回分别重播；同笔事件只展示一次，不改变本地余额。减少动态效果设置下仍保留文字反馈。',variants:[{id:'arrival',title:'积分到账',query:'reviewOverlay=points-arrival'},{id:'refund',title:'积分退回',query:'reviewOverlay=points-refund'}]},
];
export function pageOverlays(page:string,device='pc'){return samples.filter(s=>s.owner===page&&(!s.pcOnly||device==='pc'));}
export function OverlayGallery({page,device,selection,onSelect}:{page:string;device:string;selection:string;onSelect:(id:string)=>void}){
 const list=pageOverlays(page,device), sample=list.find(s=>selection.startsWith(s.id+':'))||list[0];
 const [replay,setReplay]=useState(0);
 if(!sample)return null;
 const variant=sample.variants.find(v=>(device==='pc'||v.id!=='activity')&&selection===sample.id+':'+v.id)||sample.variants[0];
 const src='/community-options/c-prototype?page='+sample.owner+'&device='+device+'&embed=1&reviewScope=overlay-'+sample.id+'-'+variant.id+'&'+variant.query;
 const frame=<iframe key={src+replay} title={sample.title+' · '+variant.title} src={src} sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"/>;
 return <section className={'rv-overlay-gallery '+device} aria-label="弹层与提示样本">
  <nav className="rv-overlay-index" aria-label="弹层快速选择">{list.map(item=><button key={item.id} aria-pressed={item.id===sample.id} onClick={()=>onSelect(item.id+':'+item.variants[0].id)}><span className={'rv-overlay-mini '+item.shape} aria-hidden="true"><i/><b/><em/></span><strong>{item.title}</strong><small>{item.shape==='notice'?'非模态提示':item.shape==='menu'?'锚定菜单':'业务弹层'}</small></button>)}</nav>
  <div className="rv-overlay-body"><header><div><h3>{sample.title}</h3><p>{sample.trigger}</p></div><button onClick={()=>setReplay(n=>n+1)}>{sample.shape==='notice'?'重播提示':'重新打开'}</button></header>
   <nav className="rv-overlay-variants" aria-label="弹层变体">{sample.variants.filter(v=>device==='pc'||v.id!=='activity').map(v=><button key={v.id} aria-pressed={variant.id===v.id} onClick={()=>onSelect(sample.id+':'+v.id)}>{v.title}</button>)}</nav>
   <div className="rv-overlay-content"><div className="rv-overlay-frame">{device==='mobile'?<MobileBrowserFrame>{frame}</MobileBrowserFrame>:frame}</div><details open className="rv-overlay-rules"><summary>交互规则</summary><p>{sample.rule}</p><p>关闭后可查看原页面；使用“重新打开”或“重播提示”复现当前样本。切换设备保留所选场景。</p></details></div>
  </div>
 </section>;
}