const normalize=(value:string)=>value.normalize('NFKC').toLowerCase();
// Search results use plain text; query remains compatible with existing callers.
export function SearchHighlight({text}:{text:string;query:string}){return <>{text}</>;}
export function searchSnippet(text:string,query:string){
 const segments=Array.from(new Intl.Segmenter('zh-CN',{granularity:'grapheme'}).segment(text));
 const source=segments.map(s=>normalize(s.segment)).join('');const positions=normalize(query).trim().split(/\s+/).filter(Boolean).map(w=>source.indexOf(w)).filter(n=>n>=0);
 const at=positions.length?Math.min(...positions):0;let offset=0;let hit=segments.findIndex(s=>{offset+=normalize(s.segment).length;return offset>at});if(hit<0)hit=0;
 const start=Math.max(0,hit-24),end=Math.min(segments.length,start+120);return (start?'…':'')+segments.slice(start,end).map(s=>s.segment).join('')+(end<segments.length?'…':'');
}
