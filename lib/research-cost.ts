export type CostInputs = Record<'gross'|'refund'|'other'|'hours'|'rate'|'maintenance'|'accepted',string>;
export function calculateResearchCost(input:CostInputs){
 const keys=Object.keys(input) as (keyof CostInputs)[];
 if(keys.some(k=>input[k].trim()===''))return {status:'empty' as const};
 const v=Object.fromEntries(keys.map(k=>[k,Number(input[k])])) as Record<keyof CostInputs,number>;
 if(keys.some(k=>!Number.isFinite(v[k])||v[k]<0)||!Number.isInteger(v.accepted)||v.refund>v.gross)return {status:'invalid' as const};
 const cash=v.gross-v.refund+v.other+v.maintenance, labor=v.hours*v.rate,total=cash+labor;
 if(![cash,labor,total].every(Number.isFinite))return {status:'invalid' as const};
 return {status:'valid' as const,cash,labor,total,perAccepted:v.accepted>0?total/v.accepted:null};
}
