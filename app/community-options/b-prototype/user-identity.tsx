'use client';
import {Avatar} from 'antd';
import './user-identity.css';
const demoUsers:Record<string,{name:string;avatar:string}>={
 '017':{name:'林间',avatar:'/home-prototype/girl.png'},
 '032':{name:'云上旅人',avatar:'/home-prototype/sea.png'},
 '028':{name:'鹿与光',avatar:'/home-prototype/cat.png'},
};
export function demoUserIdentityId(name:string){let hash=2166136261;for(const point of Array.from(name.normalize('NFC')))hash=Math.imul(hash^point.codePointAt(0)!,16777619);return 'U-DEMO-NAME-'+(hash>>>0).toString(36);}
export function UserIdentity({id,name,avatar,onClick}:{id:string;name?:string;avatar?:string;onClick?:()=>void}){
 const short=id.match(/(?:用户 · |U-DEMO-)(\d+)$/)?.[1];const demo=short?demoUsers[short]:undefined;
 const rawName=id&&!/^U-|^ADM-|^demo-user-|^用户 · /.test(id)?id:undefined;const label=name||demo?.name||rawName||'演示用户';const displayId=id.startsWith('用户 · ')?'U-DEMO-'+short:rawName?demoUserIdentityId(rawName):id||demoUserIdentityId(label);
 return <span className="bp-user-identity"><Avatar size={32} src={avatar||demo?.avatar}>{label.slice(0,1)}</Avatar><span>{onClick?<button type="button" className="bp-user-name" onClick={onClick}>{label}</button>:<span>{label}</span>}<small>{displayId}</small></span></span>;
}
