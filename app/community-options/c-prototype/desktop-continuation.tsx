'use client';
import {TransientFeedback} from './transient-feedback';
import {useRef,useState} from 'react';
import './desktop-continuation.css';
export function validMakeNowDestination(value?:string){
 try{const url=new URL(value||'');return url.protocol==='https:'&&!url.username&&!url.password&&(url.hostname==='makenow.tv'||url.hostname.endsWith('.makenow.tv'))?url.href:''}catch{return ''}
}
export function appEntryState({destination,paused,mobile,device}:{destination?:string;paused:boolean;mobile:boolean;device:string}){
 const href=validMakeNowDestination(destination);
 return {href,status:!href?'missing':paused?'paused':device==='mobile'&&!mobile?'desktop':'available'} as const;
}
export function DesktopContinuation({item,id}:{item:string;id?:string}){
 const dialog=useRef<HTMLDialogElement>(null),[link,setLink]=useState(''),[message,setMessage]=useState('');
 const open=()=>{const q=new URLSearchParams({page:'app',item,device:'pc'});if(id)q.set('id',id);const activity=new URLSearchParams(location.search).get('activity');if(activity)q.set('activity',activity);setLink(location.origin+'/community-options/c-prototype?'+q);setMessage('');dialog.current?.showModal();};
 return <><button className="cp-button cp-mobile-only" onClick={open}>获取电脑端链接</button><dialog ref={dialog} className="cp-desktop-continuation" aria-labelledby="desktop-continuation-title"><header><h2 id="desktop-continuation-title">在电脑端使用</h2><button aria-label="关闭电脑端提示" onClick={()=>dialog.current?.close()}>×</button></header><p>此应用需要电脑操作。复制链接，在电脑浏览器中打开同一应用，继续使用。</p><label>应用链接<input readOnly value={link} onFocus={e=>e.target.select()}/></label><div>{message==='链接已复制'?<TransientFeedback message={message} onClear={()=>setMessage('')}/>:<output>{message}</output>}<button onClick={async()=>{try{await navigator.clipboard.writeText(link);setMessage('链接已复制');}catch{setMessage('复制失败，请长按链接手动复制');}}}>复制链接</button></div></dialog></>;
}
