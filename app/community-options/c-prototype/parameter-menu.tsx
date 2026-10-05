'use client';
import {useEffect,useId,useRef,useState} from 'react';

export function ParameterMenu({label,value,options,onChange,initialOpen=false}:{label:string;value:string;options:string[];onChange:(value:string)=>void;initialOpen?:boolean}){
 const [open,setOpen]=useState(initialOpen);
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const id=useId();
 useEffect(()=>{
   if(!initialOpen)return;
   const timer=window.setTimeout(()=>trigger.current?.scrollIntoView({block:'end',behavior:'instant'}),100);
   return()=>window.clearTimeout(timer);
 },[initialOpen]);
 useEffect(()=>{
   if(!open)return;
   const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};
   const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();setOpen(false);trigger.current?.focus();}};
   document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
   return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[open]);
 const focusOption=(index:number)=>root.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')[index]?.focus();
 return <div ref={root} className="lw-parameter-menu">
   <button ref={trigger} type="button" className="lw-parameter-trigger" aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={open?id:undefined} onClick={()=>setOpen(!open)} onKeyDown={event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setOpen(true);window.setTimeout(()=>focusOption(Math.max(0,options.indexOf(value))),0);}}}>{value}<img src="/home-prototype/icons/arrow-down-s-line.svg" alt=""/></button>
   {open&&<div id={id} role="listbox" aria-label={label} className="lw-parameter-options">{options.map((option,index)=><button type="button" key={option} role="option" aria-selected={value===option} tabIndex={value===option?0:-1} onClick={()=>{onChange(option);setOpen(false);trigger.current?.focus();}} onKeyDown={event=>{const next=event.key==='ArrowDown'?(index+1)%options.length:event.key==='ArrowUp'?(index+options.length-1)%options.length:event.key==='Home'?0:event.key==='End'?options.length-1:null;if(next!==null){event.preventDefault();focusOption(next);}if(event.key==='Tab')setOpen(false);}}>{option}{value===option&&<img src="/home-prototype/icons/check-line.svg" alt="已选"/>}</button>)}</div>}
 </div>;
}
