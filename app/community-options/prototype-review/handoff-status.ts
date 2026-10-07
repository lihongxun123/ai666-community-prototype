import {pageIterations} from './iterations';
export function handoffStatus(section:string,id:string,_device:string){return section==='cross'?{label:'历史方案',tone:'pending'}:pageIterations(section,id).length?{label:'设计已完成',tone:'done'}:{label:'设计进行中',tone:'pending'};}
