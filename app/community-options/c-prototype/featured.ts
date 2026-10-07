'use client';
import {useSyncExternalStore} from 'react';
import {readOperations,publicOperationRows,type OpRow} from '../b-prototype/operations-model';
const subscribe=(onChange:()=>void)=>{window.addEventListener('bp-operations-change',onChange);window.addEventListener('storage',onChange);return()=>{window.removeEventListener('bp-operations-change',onChange);window.removeEventListener('storage',onChange);};};
function snapshot(){
  return JSON.stringify(readOperations().rows.slots);
}
export type FeaturedSlots={appBanner:OpRow[];searchTopics:OpRow[];searchApps:OpRow[];hotwords:OpRow[]};
export function useFeatured():FeaturedSlots{
 const raw=useSyncExternalStore(subscribe,snapshot,()=> '[]');
 let rows:OpRow[]=[];try{rows=publicOperationRows(JSON.parse(raw) as OpRow[]).filter(row=>row.status==='已发布'&&row.published!==false).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));}catch{/* An invalid local configuration renders no placements. */}
 const group=(tab:string)=>rows.filter(row=>row.slotTab===tab);
 return {appBanner:group('appBanner'),searchTopics:group('searchTopics'),searchApps:group('searchApps'),hotwords:group('hotwords')};
}
export const workSampleId=(id:string)=>id==='work-1'?'restore':id.replace(/^work-/,'');


