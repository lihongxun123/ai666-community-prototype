'use client';
import {useEffect,useRef,useState} from 'react';
import './media-preview.css';
export type PreviewMedia={src:string;type?:'image'|'video';name:string};
export function MediaPreview({items,index,onIndexChange,onClose,title='媒体预览'}:{items:PreviewMedia[];index:number|null;onIndexChange:(n:number)=>void;onClose:()=>void;title?:string}){
 const video=useRef<HTMLVideoElement|null>(null);
 const dialog=useRef<HTMLDialogElement>(null),[failed,setFailed]=useState(false);
 const open=index!==null&&!!items[index],item=index===null?undefined:items[index];
 useEffect(()=>{setFailed(false)},[index,item?.src]);
 useEffect(()=>{if(!open)return;const node=dialog.current,focus=document.activeElement as HTMLElement|null;node?.showModal();return()=>{node?.querySelector('video')?.pause();node?.close();if(focus?.isConnected)focus.focus();}},[open]);
 const move=(delta:number)=>onIndexChange(((index??0)+delta+items.length)%items.length);
 return <dialog ref={dialog} className="media-preview" aria-label={title} onCancel={e=>{e.preventDefault();onClose()}} onKeyDown={e=>{if((e.target as HTMLElement).tagName==='VIDEO')return;if(items.length>1&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowLeft'?-1:1)}}}>
 <header><span>{title} {open?`${(index??0)+1} / ${items.length}`:''}</span><button type="button" autoFocus aria-label="关闭媒体预览" onClick={onClose}><img src="/home-prototype/icons/close-line.svg" alt=""/></button></header>
 <div className="media-preview-stage" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>{item&&(failed?<p role="alert">素材暂时无法加载，请关闭后重试。</p>:item.type==='video'?<video ref={node=>{if(!node)video.current?.pause();video.current=node;}} key={item.src} src={item.src} controls playsInline onError={()=>setFailed(true)}/>:<img src={item.src} alt={item.name} onError={()=>setFailed(true)}/>)}</div>
 {items.length>1&&<><button className="media-preview-prev" aria-label="上一项素材" onClick={()=>move(-1)}><img src="/home-prototype/icons/arrow-left-s-line.svg" alt=""/></button><button className="media-preview-next" aria-label="下一项素材" onClick={()=>move(1)}><img src="/home-prototype/icons/arrow-right-s-line.svg" alt=""/></button><nav aria-label="媒体缩略图">{items.map((m,i)=><button key={m.src+i} aria-label={'查看第'+(i+1)+'项素材'} aria-pressed={index===i} onClick={()=>onIndexChange(i)}>{m.type==='video'?<span>视频</span>:<img src={m.src} alt=""/>}</button>)}</nav></>}
 </dialog>
}
