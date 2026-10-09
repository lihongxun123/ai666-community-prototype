'use client';
import {useRef} from 'react';
import {Button,Card,Checkbox,Form,Input,Select,Space} from 'antd';
import {emptyAppCase,type AppCase,type AppEditorial} from '../app-editorial';
import {MediaPicker} from './content-media';
import {readOperations,publicOperationRows} from './operations-model';
import {useContentModel} from './content-model';
export function AppCaseEditor({value,onChange,onError}:{value:AppEditorial&{refs:string[]};onChange:(next:AppEditorial&{refs:string[]})=>void;onError:(error:string)=>void}){
 const db=useContentModel(),c=value.appCase;
 const cache=useRef<Partial<Record<AppCase['style'],AppCase>>>({});
 const setStyle=(style:string)=>{if(c)cache.current[c.style]=structuredClone(c);if(style==='none'){onChange({...value,appCase:undefined});return;}const key=style as AppCase['style'];const cached=cache.current[key];const next=c||emptyAppCase();onChange({...value,appCase:cached||{...next,style:key,items:key==='comparison'?[0,1].map(i=>next.items[i]||{id:crypto.randomUUID(),title:i?'处理后':'处理前',image:'',text:''}):next.items}})};
 const update=(next?:AppCase)=>onChange({...value,appCase:next});
 const changeItem=(index:number,patch:Partial<AppCase['items'][number]>)=>{if(c)update({...c,items:c.items.map((x,i)=>i===index?{...x,...patch}:x)})};
 const move=(index:number,delta:number)=>{if(!c)return;const items=[...c.items];[items[index],items[index+delta]]=[items[index+delta],items[index]];update({...c,items})};
 const topics=publicOperationRows(readOperations().rows.topics).filter(x=>x.status==='已发布'&&x.published!==false);
 const tutorials=db.records.filter(x=>x.kind==='tutorial'&&x.visibility==='已公开'&&x.published);
 const tutorialOptions=tutorials.map(x=>({value:x.id,label:x.published!.title}));
 for(const id of value.refs)if(!tutorialOptions.some(x=>x.value===id))tutorialOptions.push({value:id,label:id+'（当前不可见）'});
 const topicOptions=topics.map(x=>({value:x.id,label:String(x.name)}));
 for(const id of value.topicRefs||[])if(!topicOptions.some(x=>x.value===id))topicOptions.push({value:id,label:id+'（当前不可见）'});
 return <><Form.Item label="案例展示"><Select value={c?.style||'none'} onChange={setStyle} options={[{value:'none',label:'不展示案例'},{value:'media',label:'图片组'},{value:'comparison',label:'前后对照'}]}/></Form.Item>{c&&<Card size="small" style={{marginBottom:24}}><Form.Item label="案例标题" required><Input maxLength={60} showCount value={c.title} onChange={e=>update({...c,title:e.target.value})}/></Form.Item><Form.Item label="案例简介"><Input.TextArea maxLength={300} showCount rows={2} value={c.summary} onChange={e=>update({...c,summary:e.target.value})}/></Form.Item><Form.Item><Checkbox checked={c.illustrative} onChange={e=>update({...c,illustrative:e.target.checked})}>示意案例</Checkbox></Form.Item>{c.items.map((item,i)=><Card size="small" key={item.id} title={c.style==='media'?`图片 ${i+1}`:i?'处理后':'处理前'} style={{marginBottom:16}} extra={<Space><Button type="text" disabled={i===0} onClick={()=>move(i,-1)}>上移</Button><Button type="text" disabled={i===c.items.length-1} onClick={()=>move(i,1)}>下移</Button>{c.style==='media'&&<Button type="text" danger onClick={()=>update({...c,items:c.items.filter((_,n)=>n!==i)})}>移除</Button>}</Space>}><Form.Item label="名称" required><Input maxLength={60} value={item.title} onChange={e=>changeItem(i,{title:e.target.value})}/></Form.Item>{c.style==='media'&&<Form.Item label="图片" required><MediaPicker mode="image" value={item.image} onError={onError} onChange={image=>changeItem(i,{image,panel:undefined})}/></Form.Item>}<Form.Item label={c.style==='media'?'图片说明':'正文'} required={c.style==='comparison'}><Input.TextArea rows={c.style==='media'?2:7} maxLength={4000} showCount value={item.text} onChange={e=>changeItem(i,{text:e.target.value})}/></Form.Item></Card>)}{c.style==='media'&&<Button disabled={c.items.length>=4} onClick={()=>update({...c,items:[...c.items,{id:crypto.randomUUID(),title:'',image:'',text:''}]})}>添加图片</Button>}</Card>}<Form.Item label="关联教程"><Select mode="multiple" showSearch={{optionFilterProp:"label"}} value={value.refs} onChange={refs=>onChange({...value,refs})} options={tutorialOptions}/></Form.Item><Form.Item label="关联专题"><Select mode="multiple" showSearch={{optionFilterProp:"label"}} value={value.topicRefs||[]} onChange={topicRefs=>onChange({...value,topicRefs})} options={topicOptions}/></Form.Item></>;
}
