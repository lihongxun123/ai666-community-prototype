'use client';
import {useEffect,useRef,useState} from 'react';
import {MobileBrowserFrame} from './mobile-browser-frame';
export function TrackedFrame({src,title,onNavigate,onActivate,mobileBrowser=false}:{src:string;title:string;mobileBrowser?:boolean;onNavigate:(id:string,search:string,section:string)=>void;onActivate?:(id:string,search:string,section:string)=>void}){
 const [initial]=useState(src),ref=useRef<HTMLIFrameElement>(null);
 const [status,setStatus]=useState<'loading'|'ready'|'failed'>('loading');
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  const check=()=>{try{
   const doc=ref.current?.contentDocument;
   if(doc&&doc.location.href!=='about:blank'&&(doc.body?.innerText.trim()||doc.querySelector('main img, main canvas'))){setStatus('ready');clearInterval(poll);clearTimeout(timeout);}
  }catch{/* A failed or inaccessible preview remains retryable. */}};
  const poll=setInterval(check,300);
  const timeout=setTimeout(()=>setStatus('failed'),15000);
  return()=>{clearInterval(poll);clearTimeout(timeout);};
 },[attempt]);
 useEffect(()=>{
  const frame=ref.current;if(!frame)return;
  let win:Window|null=null,disposed=false;
  const update=(activate=false)=>{if(disposed)return;try{const u=new URL(frame.contentWindow!.location.href);if(u.origin!==location.origin)return;const route=u.pathname.split('/').pop();const section=route==='b-prototype'?'b':route==='cross-prototype'?'cross':route==='c-prototype'||route==='home-prototype'||route==='mobile-home'?'c':null;if(!section)return;(activate&&onActivate?onActivate:onNavigate)(u.searchParams.get('page')||(route==='c-prototype'?'topics':route==='home-prototype'||route==='mobile-home'?'home':''),u.search,section);}catch{/* External destinations do not change local review selection. */}};
  const navigate=()=>update(true);
  const unbind=()=>{try{win?.removeEventListener('popstate',navigate);win?.removeEventListener('pointerdown',navigate);}catch{/* An error page or external destination may make the old window inaccessible. */}win=null;};
  const bind=()=>{unbind();try{
   const next=frame.contentWindow;
   if(!next||next.location.origin!==location.origin)return;
   win=next;win.addEventListener('popstate',navigate);win.addEventListener('pointerdown',navigate);update();
  }catch{setStatus('failed');}};
  frame.addEventListener('load',bind);
  try{if(frame.contentDocument?.readyState==='complete'&&frame.contentWindow?.location.href!=='about:blank')bind();}catch{/* The readiness timer handles inaccessible initial documents. */}
  return()=>{disposed=true;frame.removeEventListener('load',bind);unbind();};
 },[onNavigate,onActivate,attempt]);
 const content=<><iframe key={attempt} ref={ref} title={title} src={initial} sandbox="allow-same-origin allow-scripts allow-forms allow-downloads" onError={()=>setStatus('failed')}/>{status!=='ready'&&<output className="rv-frame-status">{status==='loading'?'正在加载原型…':<><span>原型未能加载</span><button onClick={()=>{setStatus('loading');setAttempt(n=>n+1);}}>重新加载</button></>}</output>}</>;
 return mobileBrowser?<MobileBrowserFrame>{content}</MobileBrowserFrame>:content;
}
