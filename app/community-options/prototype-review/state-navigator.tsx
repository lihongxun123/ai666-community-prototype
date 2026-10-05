'use client';
import {useEffect,useRef,useState} from 'react';
export type StateOption={id:string;title:string;active:boolean};

// Script-free copies of the actual previews: no second task or login session runs.
export function StateNavigator({items,onSelect}:{items:StateOption[];onSelect:(id:string)=>void}) {
  const nav=useRef<HTMLElement>(null);
  const [previews,setPreviews]=useState<Record<string,{html:string;width:number;height:number}>>({});
  const key=items.map(item=>item.id).join('|');
  useEffect(()=>{
    const area=nav.current?.parentElement?.querySelector('.rv-canvas-area');
    if(!area) return;
    let disposed=false;
    const cleanups:(()=>void)[]=[];
    const seen=new Set<HTMLIFrameElement>();
    const bind=()=>area.querySelectorAll<HTMLElement>('[data-review-state]').forEach(card=>{
      const frame=card.querySelector('iframe');const id=card.dataset.reviewState!;
      if(!frame||seen.has(frame))return;seen.add(frame);
      let observer:MutationObserver|undefined;let timer:ReturnType<typeof setTimeout>;
      const snapshot=()=>{try{
        const doc=frame.contentDocument;if(!doc?.body||disposed)return;
        const copy=doc.documentElement.cloneNode(true) as HTMLElement;
        copy.querySelectorAll('script,iframe,.site-scrollbar-layer').forEach(el=>el.remove());
        const base=doc.createElement('base');base.href=frame.src;copy.querySelector('head')?.insertBefore(base,copy.querySelector('head')!.firstChild);
        const style=doc.createElement('style');style.textContent='*{animation:none!important;transition:none!important;caret-color:transparent!important}html,body{pointer-events:none!important;scrollbar-width:none!important}';copy.querySelector('head')?.appendChild(style);
        setPreviews(previous=>({...previous,[id]:{html:'<!doctype html>'+copy.outerHTML,width:frame.clientWidth||390,height:frame.clientHeight||760}}));
      }catch{/* Cross-origin destinations retain their state title. */}};
      const queue=()=>{clearTimeout(timer);timer=setTimeout(snapshot,250);};
      const loaded=()=>{observer?.disconnect();try{if(frame.contentDocument?.body){observer=new MutationObserver(queue);observer.observe(frame.contentDocument.body,{childList:true,subtree:true,characterData:true});}}catch{}queue();};
      frame.addEventListener('load',loaded);loaded();
      cleanups.push(()=>{frame.removeEventListener('load',loaded);observer?.disconnect();clearTimeout(timer);});
    });
    const observer=new MutationObserver(bind);observer.observe(area,{childList:true,subtree:true});bind();
    return()=>{disposed=true;observer.disconnect();cleanups.forEach(clean=>clean());};
  },[key]);
  return <nav ref={nav} className="rv-state-nav" aria-label="业务状态快速切换">{items.map(item=>{
    const preview=previews[item.id];
    return <button key={item.id} type="button" aria-current={item.active?'true':undefined} onClick={()=>onSelect(item.id)}>
      <span className="rv-state-thumbnail" aria-hidden="true">{preview?<iframe tabIndex={-1} title={item.title+'缩略图'} sandbox="allow-same-origin" srcDoc={preview.html} style={{width:preview.width,height:preview.height,transform:`scale(${72/preview.width})`}}/>:<span>加载预览</span>}</span>
      <span>{item.title}</span>
    </button>;
  })}</nav>;
}
