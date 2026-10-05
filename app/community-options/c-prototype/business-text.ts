// Display-level prototype helpers; real service validation must use the same contract.
export const countCharacters=(value:string)=>Array.from(new Intl.Segmenter('zh-CN',{granularity:'grapheme'}).segment(value)).length;
const normalize=(value:string)=>value.normalize('NFKC').toLocaleLowerCase().trim().replace(/\s+/g,' ');
export function searchRank(title:string,body:string,query:string){const q=normalize(query),t=normalize(title),b=normalize(body),words=q.split(' ').filter(Boolean);if(!q)return 0;if(t===q)return 0;if(words.every(w=>t.includes(w)))return 1;if(words.every(w=>(t+' '+b).includes(w)))return 2;return 99;}
