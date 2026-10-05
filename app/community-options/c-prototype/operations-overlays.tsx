'use client';
import {useEffect,useRef,useState} from 'react';
import './operations-overlays.css';

// Explicit reader samples. No production events, transactions or acknowledgement requests.
const content:Record<string,{title:string;description:string;action:string;target:string}>={
 'ops-promotion':{title:'国庆创作计划',description:'用 AI 记录假期灵感，探索本期创作活动。',action:'查看活动',target:'activity?item=guoqing_qitianle_20261001'},
 'ops-login-promotion':{title:'把灵感变成你的第一件作品',description:'登录后保存创作记录，参与社区创作与分享。',action:'登录并探索',target:'login'},
 'ops-announcement':{title:'社区使用说明',description:'欢迎来到多元拾光。你可以浏览公开作品、学习教程，使用 AI 应用并分享自己的创作。',action:'知道了',target:''},
 'ops-featured':{title:'你的作品入选精选',description:'《日落之前》已入选精选，奖励积分已自动发放。',action:'查看作品',target:'work?item=sea'},
 'ops-task':{title:'还有新的创作任务',description:'前往活动中心，查看适合你的任务与参与规则。',action:'查看任务',target:'activities'},
 'ops-expiring':{title:'部分积分即将到期',description:'你有 50 积分将在 3 天后到期，可查看明细或前往商城使用。',action:'查看积分',target:'points'},
};
export function OperationsOverlays({sample,go}:{sample:string;go:(target:string)=>void}){
 const data=content[sample==='ops-featured-many'?'ops-featured':sample],dialog=useRef<HTMLDialogElement>(null);
 const [open,setOpen]=useState(true),[dismiss,setDismiss]=useState(false);
 const [anchor,setAnchor]=useState<{top:number;right:number}>();
 const floating=sample==='ops-task'||sample==='ops-expiring';
 useEffect(()=>{if(data&&!floating&&open)dialog.current?.showModal();return()=>dialog.current?.close();},[sample,open,floating,data]);
 useEffect(()=>{if(!floating)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[floating]);
 useEffect(()=>{if(!floating)return;const place=()=>{const target=document.querySelector(sample==='ops-task'?'.community-services>button':'.community-points');const rect=target?.getBoundingClientRect();if(rect)setAnchor({top:rect.bottom+12,right:Math.max(16,window.innerWidth-rect.right-30)});};place();window.addEventListener('resize',place);return()=>window.removeEventListener('resize',place)},[floating,sample]);
 if(!data||!open)return null;
 const close=()=>setOpen(false),action=()=>{close();if(sample!=='ops-featured-many'&&data.target)go(data.target)};
 const body=<><button className="op-close" aria-label="关闭提示" onClick={close} data-dismiss-icon="true"><img src="/home-prototype/icons/close-line.svg" alt="" /></button>{sample==='ops-promotion'&&<img className="op-cover" src="/home-prototype/sea.png" alt="日落之前"/>}<div className="op-body"><p className="op-eyebrow">{sample==='ops-announcement'?'社区公告':sample==='ops-featured'?'精选通知':floating?'温馨提醒':'多元拾光'}</p><h2 id="op-title">{data.title}</h2><p>{sample==='ops-featured-many'?'你的 2 件作品入选精选，奖励积分已自动发放。':data.description}</p>{sample==='ops-featured-many'&&<div className="op-featured-list">{[['sea','日落之前'],['girl','夏日的转角']].map(([id,title])=><button key={id} onClick={()=>{close();go('work?item='+id)}}>{title}<span>查看作品 ›</span></button>)}</div>}{sample==='ops-announcement'&&<div className="op-article"><h3>创作与分享</h3><p>发布前请检查标题、提示词与素材，尊重原创和他人权益。作品的公开结果可在“我的内容”查看。</p><h3>积分与活动</h3><p>活动奖励在满足规则后自动发放，到账情况可在积分明细中查看。具体参与条件以对应活动规则为准。</p></div>}{sample.startsWith('ops-featured')&&<div className="op-reward"><strong>{sample==='ops-featured-many'?'+40':'+20'}</strong><span>积分已到账</span></div>}<div className="op-actions"><button onClick={action}>{sample==='ops-featured-many'?'知道了':data.action}</button>{sample.startsWith('ops-featured')&&<button className="secondary" onClick={()=>{close();go('notifications')}}>查看消息</button>}{floating&&<button className="secondary" onClick={close}>稍后再看</button>}</div>{['ops-promotion','ops-login-promotion','ops-announcement'].includes(sample)&&<label className="op-dismiss"><input type="checkbox" checked={dismiss} onChange={e=>setDismiss(e.target.checked)}/>{sample==='ops-announcement'?'不再提醒':'今日不再提示'}</label>}</div></>;
 return floating?<aside style={anchor} className={'op-floating '+(sample==='ops-task'?'is-task':'')} aria-labelledby="op-title">{body}</aside>:<dialog ref={dialog} className="op-dialog" aria-labelledby="op-title" onCancel={close}>{body}</dialog>;
}
