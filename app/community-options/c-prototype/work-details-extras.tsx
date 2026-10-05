"use client";
import {MediaPreview} from './media-preview';
import {useFeedbackExpiry} from './transient-feedback';
/* oxlint-disable next/no-img-element -- Local prototype media. */
import {useState,useRef,useEffect} from 'react';
import {prototypeStore as store} from './storage';
import './work-details-extras.css';
export function WorkMedia({image,title,images}:{image:string;title:string;images?:string[]}){const [open,setOpen]=useState(false);const trigger=useRef<HTMLButtonElement>(null);const [selected,setSelected]=useState(0);const sources=images?.length?images:[image];useEffect(()=>{setSelected(0)},[image]);useEffect(()=>{const frame=window.requestAnimationFrame(()=>{const first=Array.from(document.querySelectorAll<HTMLButtonElement>('.wd-media')).find(node=>node.getClientRects().length>0);if(new URLSearchParams(window.location.search).get('reviewOverlay')==='work-image'&&trigger.current?.getClientRects().length&&first===trigger.current&&!document.querySelector('dialog:modal'))setOpen(true);});return()=>{window.cancelAnimationFrame(frame);setOpen(false)}},[]);return <><button ref={trigger} className="wd-media" aria-label="查看作品大图" onClick={()=>setOpen(true)}><img src={sources[selected]} alt={title+' · '+(selected+1)}/></button>{sources.length>1&&<div className="wd-gallery" aria-label="作品图片"><div>{sources.map((src,i)=><button key={src} aria-label={'查看第'+(i+1)+'张图片'} aria-pressed={selected===i} onClick={()=>setSelected(i)}><img src={src} alt={'作品图片 '+(i+1)}/></button>)}</div><span>{selected+1} / {sources.length}</span></div>}<MediaPreview title="作品大图" items={sources.map((src,i)=>({src,name:title+" · "+(i+1)}))} index={open?selected:null} onIndexChange={setSelected} onClose={()=>setOpen(false)}/></>}
export const workCreationInfo:Record<string,{prompt:string;model:string;ratio:string;references?:{url:string;name:string;reusable:boolean}[]}>={
 girl:{references:[{url:'/home-prototype/portrait.png',name:'人物光线参考',reusable:true},{url:'/home-prototype/interior.png',name:'海岸场景参考',reusable:true}],model:'图片模型',ratio:'9:16',prompt:'创作一组地中海夏日旅行主题的视觉作品：穿着白色轻盈长裙的女孩走过海边小镇，蓝白建筑沿着坡道层层展开，转角处盛开的三角梅形成自然前景。阳光从侧后方照入，突出发丝、裙摆和石阶的细腻质感。整体以海蓝、奶白与柔和暖金为主色，保留自然肤色，画面明亮通透，具有电影静帧的叙事感。系列延伸到海景露台、午后桌面与日落海岸，保持统一光感与色彩；避免过度锐化、文字水印和杂乱背景。'},
 restore:{model:'图片模型',ratio:'3:2',prompt:'修复老照片的划痕与褪色，保留人物原有五官、神态和年代质感。'},
 perfume:{model:'图片模型',ratio:'4:3',prompt:'透明香水瓶置于明亮海岸前，保留瓶身标签与玻璃质感，夏日暖光。'},
};
workCreationInfo["sea"]={"model":"视频模型","ratio":"16:9","prompt":"海岸日落，镜头缓慢向前推进，浪花映着暖金色光线，保持地平线稳定，呈现自然海风与水面变化。"};
workCreationInfo["letter"]={"model":"文字模型","ratio":"文本","prompt":"写一封关于夏日海边的短信，用海风、石板路和落日描写一个普通下午，语言克制温暖，有具体细节。"};
workCreationInfo["headphones"]={"model":"图片模型","ratio":"4:3","prompt":"耳机产品静物，柔和侧光，简洁背景，突出材质纹理与安静氛围。"};
workCreationInfo["tram"]={"model":"图片模型","ratio":"3:4","prompt":"一辆电车穿过通向海边的街道，夏日阳光，丰富建筑层次，自然透视。"};
workCreationInfo["cup"]={"model":"图片模型","ratio":"4:3","prompt":"蓝花陶瓷杯与新鲜柠檬放在海景露台桌面，午后自然光，细腻陶瓷质感。"};
workCreationInfo["cat"]={"model":"图片模型","ratio":"1:1","prompt":"可爱的小猫抱着西瓜，清新夏日背景，细腻毛发，自然光线，明快配色。"};
workCreationInfo["portrait"]={"model":"图片模型","ratio":"3:4","prompt":"向日葵花田中的自然人像，温暖阳光照亮眼睛与发丝，真实肤色，柔和背景。"};
workCreationInfo["anime"]={"model":"图片模型","ratio":"3:4","prompt":"蓝色花丛中的动漫角色，微风吹动发丝，细致线条，清透光影。"};
workCreationInfo["underwater"]={"model":"图片模型","ratio":"3:4","prompt":"水下人物与蓝色纱裙，光束穿过水面，层次丰富，梦幻清澈。"};
workCreationInfo["interior"]={"model":"图片模型","ratio":"4:3","prompt":"面朝地中海的明亮客厅，木质家具与亚麻织物，阳光洒在地面，真实空间透视。"};
workCreationInfo["dog"]={"model":"图片模型","ratio":"1:1","prompt":"户外散步的小狗，自然抓拍瞬间，快乐表情，柔和日光。"};
workCreationInfo["writing"]={"model":"图片模型","ratio":"4:3","prompt":"安静的书桌与打开的笔记本，窗边柔光，专注的写作氛围。"};
workCreationInfo["repair-portrait"]={"model":"图片模型","ratio":"3:4","prompt":"修复人像的局部模糊，保留面部特征与自然肤色。"};
workCreationInfo["repair-interior"]={"model":"图片模型","ratio":"4:3","prompt":"修复空间照片中杂乱的边缘，保持建筑结构与原有光线。"};
workCreationInfo["repair-color"]={"model":"图片模型","ratio":"3:4","prompt":"修复角色图像边缘并调整配色，保留角色身份与构图。"};
workCreationInfo["repair-pet"]={"model":"图片模型","ratio":"1:1","prompt":"修复宠物照片的局部模糊，保留毛发层次与表情。"};
export function remixWork(item:string,state:string,go:(target:string)=>void){const info=workCreationInfo[item];if(!info)return;store.setItem('cp-light-create-draft',JSON.stringify({type:state==='text'||item==='letter'?'text':state==='video'||item==='sea'?'video':'image',prompt:info.prompt,ratio:info.ratio,references:info.references?.filter(reference=>reference.reusable).map(({url,name})=>({url,name}))||[]}));go('create')}
export function WorkDetailsExtras({item,state,go}:{item:string;description:string;state:string;go:(target:string)=>void}){
 const [notice,setNotice]=useState(''),[expanded,setExpanded]=useState(false);
 const info=workCreationInfo[item],prompt=info?.prompt;
 useEffect(()=>{setExpanded(false);setNotice('')},[item]);
 useFeedbackExpiry(notice,()=>setNotice(''),2000);
 if(!prompt)return null;
 return <section className="wd-generation" aria-label="创作信息"><div className="wd-prompt-head"><h3>提示词</h3><dl className="wd-creation-meta"><div><dt>模型</dt><dd>{info.model}</dd></div><div><dt>比例</dt><dd>{info.ratio}</dd></div></dl><button className="wd-copy" onClick={async()=>{try{await navigator.clipboard.writeText(prompt);setNotice('已复制')}catch{setNotice('复制失败，请重试')}}}><img src={'/home-prototype/icons/'+(notice==='已复制'?'check':'file-copy')+'-line.svg'} alt=""/>{notice||'复制'}</button></div><p className={!expanded&&prompt.length>120?'wd-prompt-collapsed':''}>{prompt}</p>{prompt.length>120&&<button className="wd-prompt-expand" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'收起':'展开全部'}</button>}<WorkReferences references={info.references||[]}/><button className="wd-remix" onClick={()=>remixWork(item,state,go)}>一键同款</button></section>
}

function WorkReferences({references}:{references:{url:string;name:string;reusable:boolean}[]}){const [preview,setPreview]=useState<{url:string;name:string}|null>(null);const dialog=useRef<HTMLDialogElement>(null);if(!references.length)return null;return <section className="wd-references" aria-label="参考素材"><header><h3>参考素材</h3><small>{references.length} 张图片</small></header><div className="wd-reference-list">{references.map(reference=><button key={reference.url} onClick={()=>{setPreview(reference)}} aria-label={'预览'+reference.name}><img src={reference.url} alt={reference.name}/></button>)}</div><MediaPreview title="参考素材预览" items={references.map(r=>({src:r.url,name:r.name}))} index={preview?references.findIndex(r=>r.url===preview.url):null} onIndexChange={i=>setPreview(references[i])} onClose={()=>setPreview(null)}/></section>}
