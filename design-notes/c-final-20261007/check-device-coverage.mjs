import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,'../..');
const base=path.join(root,'app/community-options');
const requirements=JSON.parse(fs.readFileSync(path.join(root,'design-notes/page-requirements-c.json'),'utf8'));
const js=ts.transpileModule(fs.readFileSync(path.join(base,'navigation-model.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {readerVisible,deviceDestination}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const pages=[];
for(const [file,name] of [['page.tsx','homePages'],['topics.tsx','topicPages'],['applications.tsx','applicationPages'],['reading.tsx','readingPages'],['personal.tsx','personalPages']]){
 const source=ts.createSourceFile(file,fs.readFileSync(path.join(base,'c-prototype',file),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(node){
  if(ts.isVariableDeclaration(node)&&node.name.getText(source)===name){
   function collect(n){
    if(ts.isObjectLiteralExpression(n)){
     const fields=Object.fromEntries(n.properties.filter(p=>ts.isPropertyAssignment(p)&&ts.isStringLiteral(p.initializer)).map(p=>[p.name.getText(source).replace(/['"]/g,''),p.initializer.text]));
     if(fields.id)pages.push({...fields,source:'app/community-options/c-prototype/'+file});
    }
    ts.forEachChild(n,collect);
   }
   collect(node.initializer);
  }
  ts.forEachChild(node,visit);
 }
 visit(source);
}
const rows=pages.map(p=>({...p,requirements:!!requirements[p.id],devices:Object.fromEntries(['pc','mobile'].map(device=>[device,{visible:readerVisible(p.id,device),...deviceDestination(p.id,'',device)}]))}));
const errors=[];
for(const p of rows)if(!p.requirements)errors.push('Missing requirements: '+p.id);
for(const id of Object.keys(requirements))if(!rows.some(p=>p.id===id))errors.push('Unregistered requirements: '+id);
for(const row of rows)for(const [device,destination] of Object.entries(row.devices))if(!rows.some(p=>p.id===destination.id))errors.push(`${device}/${row.id}: missing destination ${destination.id}`);
const result={date:'2026-10-07',scope:'注册、需求键及默认设备路由；不证明全部运行交互或视觉验收',registered:rows.length,visible:Object.fromEntries(['pc','mobile'].map(d=>[d,rows.filter(p=>p.devices[d].visible).length])),errors,pages:rows};
fs.writeFileSync(path.join(dir,'device-coverage.json'),JSON.stringify(result,null,2)+'\n');
const cell=d=>(d.visible?'独立评审入口':'合并/隐藏')+'；'+d.id+(d.query?'?'+d.query:'');
fs.writeFileSync(path.join(dir,'device-coverage.md'),'# C 端双端页面对照\n\n2026-10-07。根据当前注册表、设备导航和页面需求生成。共 '+rows.length+' 个页面标识，PC '+result.visible.pc+' 个、移动端 '+result.visible.mobile+' 个独立评审入口。数量不含通用反馈、弹层样本及同页标签，也不代表逐页已定稿。\n\n| 页面 | 标识 | PC 承载 | 移动端承载 | 页面需求 |\n|---|---|---|---|---|\n'+rows.map(p=>`| ${p.title} | ${p.id} | ${cell(p.devices.pc)} | ${cell(p.devices.mobile)} | ${p.requirements?'正文存在（语义未全验）':'缺失'} |`).join('\n')+'\n\n来源：C 原型五组页面注册、navigation-model.ts、page-requirements-c.json。复核命令：node design-notes/c-final-20261007/check-device-coverage.mjs。参数化入口及行为需要另行浏览器验证。\n');
console.log(JSON.stringify({registered:result.registered,visible:result.visible,errors},null,2));
if(errors.length)process.exitCode=1;
