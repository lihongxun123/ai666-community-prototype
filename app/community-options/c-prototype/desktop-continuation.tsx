'use client';
import {useRef} from 'react';
import './desktop-continuation.css';
export function validMakeNowDestination(value?:string){
 try{const url=new URL(value||'');return url.protocol==='https:'&&!url.username&&!url.password&&(url.hostname==='makenow.tv'||url.hostname.endsWith('.makenow.tv'))?url.href:''}catch{return ''}
}
export function appEntryState({destination,paused,device}:{destination?:string;paused:boolean;mobile:boolean;device:string}){
 const candidate=validMakeNowDestination(destination);
 const target=candidate?new URL(candidate):null;
 const generic=target&&(/^\/(?:agents?|skills?|skill-market)?\/?$/.test(target.pathname)||(['agents','skills'].includes(target.searchParams.get('view')||'')&&!target.searchParams.get('tool')&&!target.searchParams.get('id')));
 const href=generic?'':candidate;
 return {href,status:!href?'missing':paused?'paused':device==='mobile'?'desktop':'available'} as const;
}
export function DesktopContinuation(_props:{item:string;id?:string}){
 const guide=useRef<HTMLDialogElement>(null);
 return <><button className="cp-button" onClick={()=>guide.current?.showModal()}>在 MakeNow 中使用</button><dialog ref={guide} className="cp-desktop-continuation" aria-labelledby="app-desktop-title"><h2 id="app-desktop-title">建议在电脑端使用</h2><p>请在电脑端登录多元拾光，打开这个应用，再前往 MakeNow。</p><div><button onClick={()=>guide.current?.close()}>知道了</button></div></dialog></>;
}

export function ResultDesktopGuide(){
 const guide=useRef<HTMLDialogElement>(null);
 return <><button className="cp-button result-desktop-entry" onClick={()=>guide.current?.showModal()}>前往 MakeNow 继续创作</button><dialog ref={guide} className="cp-desktop-continuation" aria-labelledby="result-desktop-title"><header><h2 id="result-desktop-title">建议在电脑端继续创作</h2></header><p>请在电脑端登录多元拾光，打开这条生成结果，再前往 MakeNow。</p><div><button onClick={()=>guide.current?.close()}>知道了</button></div></dialog></>;
}
