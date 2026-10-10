'use client';
import {useSyncExternalStore} from 'react';
import {readOperations,publicOperationRows,type OpRow} from '../b-prototype/operations-model';
import {contentMediaSrc} from './content-data';
const subscribeTopics=(notify:()=>void)=>{window.addEventListener('bp-operations-change',notify);window.addEventListener('storage',notify);return()=>{window.removeEventListener('bp-operations-change',notify);window.removeEventListener('storage',notify);};};
const topicsSnapshot=()=>JSON.stringify(publicOperationRows(readOperations().rows.topics).filter(r=>r.status==='已发布'&&r.published!==false).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id)));
export function useHomeTopics(contentDB:{records:{id:string;publicStatus:string}[]}){
 const topicData=useSyncExternalStore(subscribeTopics,topicsSnapshot,()=> '[]');
 return (JSON.parse(topicData) as OpRow[]).filter(t=>Array.isArray(t.refs)&&t.refs.some(id=>contentDB.records.some(r=>r.id===id&&r.publicStatus==='公开'))).filter(t=>t.id!=='tp-restore'||contentDB.records.some(r=>r.id==='tutorial-1'&&r.publicStatus==='公开')).filter(t=>t.id!=='tp-writing'||contentDB.records.some(r=>r.id==='app-1'&&r.publicStatus==='公开')).slice(0,4).map(t=>({id:t.id,title:t.name,image:contentMediaSrc(typeof t.cover==='string'?t.cover:''),category:t.name}));
}
