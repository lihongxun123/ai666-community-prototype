'use client';
import {useEffect,useRef,useState} from 'react';
export function TrackedFrame({src,title,onNavigate,onActivate}:{src:string;title:string;onNavigate:(id:string,search:string,section:string)=>void;onActivate?:(id:string,search:string,section:string)=>void}){
 const [initial]=useState(src),ref=useRef<HTMLIFrameElement>(null);
 useEffect(()=>{
  const frame=ref.current;if(!frame)return;
  let win:Window|null=null;
  const update=(activate=false)=>{try{const u=new URL(frame.contentWindow!.location.href);if(u.origin!==location.origin)return;const route=u.pathname.split('/').pop();const section=route==='b-prototype'?'b':route==='cross-prototype'?'cross':route==='c-prototype'||route==='home-prototype'||route==='mobile-home'?'c':null;if(!section)return;(activate&&onActivate?onActivate:onNavigate)(u.searchParams.get('page')||(route==='c-prototype'?'topics':route==='home-prototype'||route==='mobile-home'?'home':''),u.search,section);}catch{/* External destinations do not change local review selection. */}};
  const navigate=()=>update(true);
  const bind=()=>{win?.removeEventListener('popstate',navigate);win?.removeEventListener('pointerdown',navigate);win=frame.contentWindow;win?.addEventListener('popstate',navigate);win?.addEventListener('pointerdown',navigate);update();};
  frame.addEventListener('load',bind);if(frame.contentDocument?.readyState==='complete'&&frame.contentWindow?.location.href!=='about:blank')bind();return()=>{frame.removeEventListener('load',bind);win?.removeEventListener('popstate',navigate);win?.removeEventListener('pointerdown',navigate);};
 },[onNavigate,onActivate]);
 return <iframe ref={ref} title={title} src={initial} sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"/>;
}
