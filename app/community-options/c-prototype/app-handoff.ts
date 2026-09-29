// Local handoff demonstration; production per-application links are not configured.
export function appHandoffUrl(item: string, recordId?: string) {
 const q=new URLSearchParams({page:'app',source:'app',item});
 if(recordId)q.set('id',recordId);
 if(typeof location!=='undefined'){
  const current=new URLSearchParams(location.search);
  for(const key of ['activity','device'])if(current.has(key))q.set(key,current.get(key)!);
  q.set('return','/community-options/c-prototype?page=app&item='+encodeURIComponent(item)+(recordId?'&id='+encodeURIComponent(recordId):'')+(current.has('activity')?'&activity='+encodeURIComponent(current.get('activity')!):'')+(current.has('device')?'&device='+encodeURIComponent(current.get('device')!):''));
 }
 return '/community-options/cross-prototype?'+q.toString();
}
