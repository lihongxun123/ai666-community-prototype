'use client';
import {useSyncExternalStore} from 'react';
const subscribe=(onChange:()=>void)=>{window.addEventListener('bp-operations-change',onChange);window.addEventListener('storage',onChange);return()=>{window.removeEventListener('bp-operations-change',onChange);window.removeEventListener('storage',onChange);};};
function snapshot(){
  let reviewFrame=false;
  try{reviewFrame=window.parent!==window&&window.parent.location.pathname.endsWith('/prototype-review');}catch{/* Cross-origin embeds use the explicit flag. */}
  return reviewFrame||new URLSearchParams(location.search).has('embed')?'null':localStorage.getItem('bp-published-features')||'null';
}
export function useFeatured(){const raw=useSyncExternalStore(subscribe,snapshot,()=>'null');try{return JSON.parse(raw) as {works:string[];posts:string[]}|null;}catch{return null;}}
export const workSampleId=(id:string)=>id==='work-1'?'restore':id.replace(/^work-/,'');


