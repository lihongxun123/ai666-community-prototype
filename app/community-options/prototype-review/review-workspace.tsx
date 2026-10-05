'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {StateNavigator,type StateOption} from './state-navigator';

export function ReviewWorkspace({mobile,open,onClose,title,tab,onTab,notes,children,states=[],onStateSelect}:{mobile:boolean;open:boolean;onClose:()=>void;title:string;tab:string;onTab:(tab:string)=>void;notes:ReactNode;children:ReactNode;states?:StateOption[];onStateSelect?:(id:string)=>void}){
  const [wide,setWide]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const media=matchMedia('(min-width: 1120px)');const sync=()=>setWide(media.matches);sync();media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync);},[]);
  const docked=mobile&&wide;
  useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&!docked){if(!el.open)el.showModal();}else if(el.open)el.close();},[open,docked]);
  const content=<><header className="rv-notes-heading"><strong>{title}</strong>{!docked&&<button onClick={onClose} aria-label="关闭说明">关闭</button>}</header><nav className="rv-notes-tabs" aria-label="原型说明"><button aria-pressed={tab==='requirements'} onClick={()=>onTab('requirements')}>页面需求</button><button aria-pressed={tab==='flow'} onClick={()=>onTab('flow')}>模块流程</button></nav><div className="rv-notes-body">{notes}</div></>;
  return <div className={'rv-review-workspace'+(docked?' is-docked':'')+(states.length>1?' has-state-nav':'')}>{states.length>1&&<StateNavigator items={states} onSelect={id=>{onStateSelect?.(id);const card=Array.from(document.querySelectorAll<HTMLElement>('[data-review-state]')).find(el=>el.dataset.reviewState===id);const area=card?.closest('.rv-canvas-area');if(card&&area)area.scrollTo({top:area.scrollTop+card.getBoundingClientRect().top-area.getBoundingClientRect().top,behavior:'smooth'});}}/>}<div className="rv-canvas-area">{children}</div>{docked?<aside className="rv-notes-panel" aria-label="当前原型说明">{content}</aside>:<dialog ref={dialog} className="rv-notes-drawer" aria-label={title+' · 说明'} onCancel={onClose} onClose={onClose}>{content}</dialog>}</div>;
}
