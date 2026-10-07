'use client';
import {useEffect,useRef,useState} from 'react';
import {Alert,Empty,Tag,Tabs} from 'antd';
import {CommunityAnalytics} from './community-analytics';
const pages=['analytics-overview','analytics-growth','analytics-users','analytics-creation','analytics-content','analytics-activity','analytics-quality','analytics-metrics'];
function V02Analytics({page,state,go}:{page:string;state:string;go:(page:string)=>void}){
 const ref=useRef<HTMLIFrameElement>(null);
 const [search]=useState(()=>{if(typeof window==='undefined')return '';const q=new URLSearchParams(window.location.search);['page','state','embed','detailOnly'].forEach(k=>q.delete(k));return q.toString();});
 useEffect(()=>{const listener=(e:MessageEvent)=>{if(e.origin===location.origin&&e.source===ref.current?.contentWindow&&e.data?.type==='analytics-navigate'&&pages.includes(e.data.page)){go(e.data.page+(e.data.search||''));return;}if(e.origin===location.origin&&e.source===ref.current?.contentWindow&&e.data?.type==='analytics-state'&&e.data.page===page){const q=new URLSearchParams(e.data.search);q.set('page',page);const current=new URLSearchParams(location.search);for(const key of ['embed','detailOnly'])if(current.has(key))q.set(key,current.get(key)!);history.replaceState(null,'','?'+q);return;}if(e.origin===location.origin&&e.source===ref.current?.contentWindow&&e.data?.type==='analytics-business'&&typeof e.data.page==='string'&&['works','reviews','posts','aigc-generations','users','user-register-sources','op-points','op-events','op-shop','op-taxonomy'].includes(e.data.page))go(e.data.page);};window.addEventListener('message',listener);return()=>window.removeEventListener('message',listener);},[go,page]);
 if(state==='empty')return <Empty description="暂无统计数据"/>;
 if(state==='error'||state==='load-failed')return <Alert type="error" title="统计数据加载失败" action={<button onClick={()=>go(page)}>重试</button>}/>;
 return <><Tag style={{marginBottom:12}}>演示数据</Tag><iframe ref={ref} title="数据分析" src={'/analytics-baseline/'+page+'.html'+(search?'?'+search:'')} style={{width:'100%',height:'calc(100vh - 165px)',minHeight:600,border:0}} onLoad={()=>{const url=ref.current?.contentWindow?.location;if(!url)return;const target=url.pathname.split('/').pop()?.replace('.html','');if(target&&pages.includes(target)&&target!==page)go(target+(url.search||''));}}/></>;
}

export function AnalyticsBaseline(props:{page:string;state:string;go:(page:string)=>void}){
 const mode=props.page==='analytics-content'?'content':props.page==='analytics-activity'?'activity':props.page==='analytics-metrics'?'metrics':null;
 if(!mode||props.state==='empty'||props.state==='error'||props.state==='load-failed')return <V02Analytics {...props}/>;
 return <Tabs items={[{key:'existing',label:mode==='content'?'内容分析':mode==='activity'?'活动分析':'原有指标',children:<V02Analytics {...props}/>},{key:'community',label:mode==='content'?'社区内容':mode==='activity'?'社区任务':'社区指标',children:<CommunityAnalytics mode={mode}/>}]} />;
}
