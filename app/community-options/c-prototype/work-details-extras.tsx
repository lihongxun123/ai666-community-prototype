"use client";
/* oxlint-disable next/no-img-element -- Local prototype media. */
import {useState,useRef,useEffect} from 'react';
import {prototypeStore as store} from './storage';
import './work-details-extras.css';
export function WorkMedia({image,title}:{image:string;title:string}){const dialog=useRef<HTMLDialogElement>(null);useEffect(()=>()=>dialog.current?.close(),[]);return <><button className="wd-media" aria-label="查看作品大图" onClick={()=>dialog.current?.showModal()}><img src={image} alt={title}/></button><dialog ref={dialog} className="wd-preview" aria-label="作品大图"><button autoFocus onClick={()=>dialog.current?.close()} aria-label="关闭大图">×</button><img src={image} alt={title}/></dialog></>}
export const workCreationInfo:Record<string,{prompt:string;model:string;ratio:string}>={
 restore:{model:'图片模型',ratio:'3:2',prompt:'修复老照片的划痕与褪色，保留人物原有五官、神态和年代质感。'},
 perfume:{model:'图片模型',ratio:'4:3',prompt:'透明香水瓶置于明亮海岸前，保留瓶身标签与玻璃质感，夏日暖光。'},
};
export function remixWork(item:string,state:string,go:(target:string)=>void){const info=workCreationInfo[item];if(!info)return;store.setItem('cp-light-create-draft',JSON.stringify({type:state==='text'||item==='letter'?'text':state==='video'||item==='sea'?'video':'image',prompt:info.prompt,ratio:info.ratio}));go('create')}
export function WorkDetailsExtras({item,state,go}:{item:string;description:string;state:string;go:(target:string)=>void}){
 const [notice,setNotice]=useState(''),[expanded,setExpanded]=useState(false);
 const info=workCreationInfo[item],prompt=info?.prompt;
 useEffect(()=>{setExpanded(false);setNotice('')},[item]);
 if(!prompt)return null;
 return <section className="wd-generation" aria-label="创作信息"><div className="wd-prompt-head"><h3>提示词</h3><dl className="wd-creation-meta"><div><dt>模型</dt><dd>{info.model}</dd></div><div><dt>比例</dt><dd>{info.ratio}</dd></div></dl><button className="wd-copy" onClick={async()=>{try{await navigator.clipboard.writeText(prompt);setNotice('已复制')}catch{setNotice('复制失败，请重试')}}}><img src={'/home-prototype/icons/'+(notice==='已复制'?'check':'file-copy')+'-line.svg'} alt=""/>{notice||'复制'}</button></div><p className={!expanded&&prompt.length>120?'wd-prompt-collapsed':''}>{prompt}</p>{prompt.length>120&&<button className="wd-prompt-expand" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'收起':'展开全部'}</button>}<button className="wd-remix" onClick={()=>remixWork(item,state,go)}>一键同款</button></section>
}
