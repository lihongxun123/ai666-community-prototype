'use client';
import {TransientFeedback} from './transient-feedback';
import {useState,useSyncExternalStore} from 'react';
import {prototypeStore as store} from './storage';
import './messages.css';
const messages=[
{id:'reply',type:'互动',title:'周末观察回复了你的评论',detail:'可以先整理参考素材，再确定画面效果。',time:'今天 10:32',target:'post?item=restore&discussion=1'},
{id:'points',type:'通知',title:'签到积分已到账',detail:'+20',time:'今天 09:15',target:''},
{id:'review',type:'通知',title:'作品修改审核结果',detail:'本次修改已通过',time:'昨天',target:'my-content'},
{id:'like',type:'互动',title:'鹿与光喜欢了你的作品',detail:'旧照修复练习',time:'昨天',target:'work?item=restore'},
{id:'activity',type:'通知',title:'活动投稿资格更新',detail:'查看本人稿件资格与奖励记录',time:'9月24日',target:'submissions'},
{id:'unavailable',type:'互动',title:'有人回复了你的帖子',detail:'原内容已不可访问',time:'9月23日',target:''},
];
const initialRead=['like','activity'];
function snapshot(){return store.getItem('cp-message-read')||JSON.stringify(initialRead)}
function subscribe(fn:()=>void){window.addEventListener('cp-messages',fn);return()=>window.removeEventListener('cp-messages',fn)}
export function useMessageRead(){const raw=useSyncExternalStore(subscribe,snapshot,()=>JSON.stringify(initialRead));try{return JSON.parse(raw) as string[]}catch{return initialRead}}
export function markMessagesRead(ids:string[]){let current:string[];try{current=JSON.parse(snapshot())}catch{current=initialRead}store.setItem('cp-message-read',JSON.stringify([...new Set([...current,...ids])]));window.dispatchEvent(new Event('cp-messages'))}
export function markAllMessagesRead(){markMessagesRead(messages.map(m=>m.id))}
export function useUnreadMessages(){const read=useMessageRead();return messages.filter(m=>!read.includes(m.id)).length}
export function MessageCenter({state,go}:{state:string;go:(target:string)=>void}){
 const read=useMessageRead(),[tab,setTab]=useState('全部'),[notice,setNotice]=useState('');
 const rows=state==='empty'?[]:messages.filter(m=>tab==='全部'||m.type===tab);
 return <section className="message-center"><div className="message-toolbar"><nav aria-label="消息类型">{['全部','互动','通知'].map(t=><button key={t} aria-pressed={tab===t} onClick={()=>{setTab(t);setNotice('')}}>{t}</button>)}</nav><button className="message-read-all" disabled={state==='empty'||messages.every(m=>read.includes(m.id))} onClick={markAllMessagesRead}>全部已读</button></div><TransientFeedback message={notice} onClear={()=>setNotice('')}/><div className="message-list">{rows.map(m=><button key={m.id} className={'message-row'+(read.includes(m.id)?' is-read':' is-unread')} onClick={()=>{markMessagesRead([m.id]);if(m.id==='unavailable'||state==='removed'){setNotice('原内容已不可访问，消息已保留。');return}if(m.target)go(m.target);else setNotice('')}}><span><strong>{m.title}</strong><small>{m.detail}</small><time>{m.time}</time></span>{!read.includes(m.id)&&<i className="message-dot" aria-label="未读"/>}</button>)}</div>{!rows.length&&<p className="message-empty">暂无消息</p>}</section>
}
