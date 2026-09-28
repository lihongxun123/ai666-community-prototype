import status from './handoff-status.json';
export function handoffStatus(section:string,id:string,device:string){
 if(section==='c'&&status.completed.includes(id))return {label:status.labels.completed,tone:'done'};
 if(section==='c'&&device==='mobile'&&status.structureMobile.includes(id))return {label:status.labels.structure,tone:'structure'};
 if(section==='c'&&status.refined.includes(id))return {label:status.labels.refined,tone:'review'};
 return {label:status.labels.pending,tone:'pending'};
}
