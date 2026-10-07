'use client';
import {useEffect,useRef,useState,useId} from 'react';
import {Modal} from 'antd';
import type {ExposeParam, UploadImgCallBack} from 'md-editor-v3';
import type {Block} from './store';
import './markdown-editor.css';
import {MediaPicker} from './content-media';
import {MediaUpload, type MediaUploadItem} from './media-upload';
export function markdownBody(blocks:Block[]){return blocks.filter(b=>!['图片','视频','资源引用'].includes(b.type)).map(b=>b.type==='标题'?'## '+b.text:b.type==='可复制示例'?'```\n'+b.text+'\n```':b.type==='链接'?'['+b.text+']('+b.text+')':b.text).join('\n\n');}
export function MarkdownEditor({value,onChange}:{value:string;onChange:(text:string)=>void}){
 const editorId=useId(); const host=useRef<HTMLDivElement>(null),change=useRef(onChange),sync=useRef<((text:string)=>void)|null>(null),latest=useRef(value),insert=useRef<((text:string)=>void)|null>(null);
 const [error,setError]=useState(false),[imageOpen,setImageOpen]=useState(false),[images,setImages]=useState<MediaUploadItem[]>([]),[uploadError,setUploadError]=useState(''),[uploading,setUploading]=useState(false);
 const processImages=useRef<(files:File[],callback?:UploadImgCallBack)=>Promise<void>>(async()=>{});
 useEffect(()=>{processImages.current=async(files,callback)=>{
  if(uploading||!files.length)return;
  if((callback?0:images.length)+files.length>4){setUploadError('每次最多插入 4 张图片。');if(callback)setImageOpen(true);return;}
  const bad=files.find(file=>!['image/jpeg','image/png','image/webp','image/gif','image/avif'].includes(file.type)||file.size>20*1024*1024);
  if(bad){setUploadError(`${bad.name} 不符合图片类型或单张 20 MB 限制。`);if(callback)setImageOpen(true);return;}
  setUploading(true);setUploadError('');
  try{const next=await Promise.all(files.map(file=>new Promise<MediaUploadItem>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>typeof reader.result==='string'?resolve({url:reader.result,type:'image',name:file.name}):reject(new Error('图片读取失败，请重试。'));reader.onerror=()=>reject(new Error('图片读取失败，请重试。'));reader.readAsDataURL(file);})));if(callback)callback(next.map(item=>item.url));else setImages(current=>[...current,...next]);}
  catch{setUploadError('图片读取失败，请重试。');if(callback)setImageOpen(true);}finally{setUploading(false);}
 };},[uploading,images]);
 useEffect(()=>{change.current=onChange;latest.current=value;},[onChange,value]);
 useEffect(()=>{let disposed=false;let unmount:(()=>void)|undefined;
 Promise.all([import('vue'),import('md-editor-v3'),import('md-editor-v3/lib/style.css')]).then(([vue,md])=>{if(disposed||!host.current)return;const text=vue.ref(latest.current),editor=vue.ref<ExposeParam|null>(null);sync.current=x=>{text.value=x;};insert.current=snippet=>{editor.value?.insert(()=>({targetValue:snippet,select:false}));};const app=vue.createApp({setup:()=>()=>vue.h(md.MdEditor,{ref:editor,modelValue:text.value,'onUpdate:modelValue':(x:string)=>{text.value=x;latest.current=x;change.current(x);},onUploadImg:(files:File[],callback:UploadImgCallBack)=>{void processImages.current(files,callback);},editorId,theme:'light',language:'zh-CN',previewTheme:'default',codeTheme:'atom',style:{height:'520px'},toolbars:['bold','underline','italic','-','title','strikeThrough','sub','sup','quote','unorderedList','orderedList','task','-','codeRow','code','link',0,'table','-','revoke','next','=','preview','previewOnly','htmlPreview','catalog']},{defToolbars:()=>[vue.h(md.NormalToolbar,{title:'插入图片',onClick:()=>{setImages([]);setUploadError('');setImageOpen(true);}},{default:()=>vue.h('svg',{width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':1.7,'aria-hidden':true},[vue.h('rect',{x:3,y:3,width:18,height:18,rx:2}),vue.h('circle',{cx:8.5,cy:8.5,r:1.5}),vue.h('path',{d:'m21 15-5-5L5 21'})])})]})});app.mount(host.current);unmount=()=>app.unmount();}).catch(()=>{if(!disposed)setError(true);});
 return()=>{disposed=true;sync.current=null;insert.current=null;unmount?.();};},[editorId]);
 useEffect(()=>{sync.current?.(value);},[value]);
 const closeImages=()=>{if(!uploading){setImageOpen(false);setImages([]);setUploadError('');}};
 return <div className="bp-markdown-field"><div ref={host}/>{error&&<><p>编辑器加载失败，可继续编辑 Markdown 原文。</p><textarea aria-label="Markdown正文" value={value} onChange={e=>onChange(e.target.value)}/></>}
 <Modal title="插入正文图片" open={imageOpen} onCancel={closeImages} mask={{closable:!uploading}} keyboard={!uploading} closable={!uploading} cancelButtonProps={{disabled:uploading}} okText="插入正文" cancelText="取消" okButtonProps={{disabled:!images.length||uploading}} onOk={()=>{const snippet='\n\n'+images.map(item=>`![${(item.name||'图片').replace(/[[\]\\\r\n]/g,'')}](${item.url})`).join('\n\n')+'\n\n';if(insert.current)insert.current(snippet);else change.current(latest.current+snippet);closeImages();}} width={680}>
  <MediaUpload firstAsCover={false} label="正文图片" items={images} accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple maxCount={4} busy={uploading} onFiles={files=>processImages.current(files)} onRemove={index=>setImages(current=>current.filter((_,i)=>i!==index))} onReorder={(from,to)=>setImages(current=>{const next=[...current];next.splice(to,0,next.splice(from,1)[0]);return next;})}/>
  <p className="bp-markdown-image-hint">支持 JPG、PNG、WebP、GIF、AVIF，单张不超过 20 MB。图片按当前顺序插入光标所在位置。</p>{uploadError&&<p className="bp-markdown-image-error" role="alert">{uploadError}</p>}
 </Modal></div>;
}

export function MarkdownBodyEditor({body,onChange,onError}:{body:Block[];onChange:(body:Block[])=>void;onError:(message:string)=>void}){
 const groups:{blocks:Block[];start:number}[]=[];
 body.forEach((b,index)=>{const media=['图片','视频','资源引用'].includes(b.type);const last=groups[groups.length-1];if(!media&&last&&!['图片','视频','资源引用'].includes(last.blocks[0].type))last.blocks.push(b);else groups.push({blocks:[b],start:index});});
 if(!groups.length)groups.push({blocks:[],start:0});
 return <>{groups.map(({blocks,start})=>{const b=blocks[0];return b&&['图片','视频','资源引用'].includes(b.type)?<div className="bp-block" key={b.id}>{b.type==='资源引用'?<p>资源引用：{b.text}</p>:<MediaPicker mode={b.type==='图片'?'image':'video'} value={b.text} onChange={text=>onChange(body.map(x=>x.id===b.id?{...x,text}:x))} onError={onError}/>}<button disabled={!start} onClick={()=>{const a=[...body];[a[start-1],a[start]]=[a[start],a[start-1]];onChange(a);}}>上移</button><button onClick={()=>onChange(body.filter(x=>x.id!==b.id))}>移除</button></div>:<MarkdownEditor key={b?.id||'empty'} value={markdownBody(blocks)} onChange={text=>onChange([...body.slice(0,start),{id:b?.id||'markdown-body',type:'Markdown',text},...body.slice(start+blocks.length)])}/>;})}</>;
}
