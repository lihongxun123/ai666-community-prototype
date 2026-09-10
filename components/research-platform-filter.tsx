'use client';
import {groups} from '@/lib/research-types';
export function ResearchPlatformFilter({query,setQuery,group,setGroup,count}:{query:string;setQuery:(value:string)=>void;group:string;setGroup:(value:string)=>void;count:number}){return <div className="research-platform-filter">
 <label>平台档案筛选<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="平台、用户或内容"/></label>
 <label>社区类型<select value={group} onChange={e=>setGroup(e.target.value)}><option>全部</option>{groups.map(g=><option key={g}>{g}</option>)}</select></label>
 <span>{count} 家平台</span>{(query||group!=='全部')&&<button className="text-button" onClick={()=>{setQuery('');setGroup('全部');}}>清除筛选</button>}
 </div>;}
