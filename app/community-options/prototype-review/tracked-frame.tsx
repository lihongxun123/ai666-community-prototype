'use client';
import {useEffect,useRef,useState} from 'react';
export function TrackedFrame({src,title,onNavigate}:{src:string;title:string;onNavigate:(id:string,search:string,section:string)=>void}){
 const [initial]=useState(src),ref=useRef<HTMLIFrameElement>(null);
 useEffect(()=>{
  const frame=ref.current;if(!frame)return;
  let win:Window|null=null;
  const update=()=>{try{const u=new URL(frame.contentWindow!.location.href);if(u.origin!==location.origin)return;const route=u.pathname.split('/').pop();const section=route==='b-prototype'?'b':route==='cross-prototype'?'cross':route==='c-prototype'||route==='home-prototype'||route==='mobile-home'?'c':null;if(!section)return;onNavigate(u.searchParams.get('page')||(route==='c-prototype'?'topics':route==='home-prototype'||route==='mobile-home'?'home':''),u.search,section);}catch{/* External destinations do not change local review selection. */}};
  const bind=()=>{win?.removeEventListener('popstate',update);win=frame.contentWindow;win?.addEventListener('popstate',update);update();};
  frame.addEventListener('load',bind);if(frame.contentDocument?.readyState==='complete'&&frame.contentWindow?.location.href!=='about:blank')bind();return()=>{frame.removeEventListener('load',bind);win?.removeEventListener('popstate',update);};
 },[onNavigate]);
 return <iframe ref={ref} title={title} src={initial} sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"/>;
}
