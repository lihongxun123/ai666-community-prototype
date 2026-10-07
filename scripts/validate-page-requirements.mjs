import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function initializer(file,name){
  const source=ts.createSourceFile(file,fs.readFileSync(path.join(root,file),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  let result;
  function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText(source)===name)result=node.initializer;ts.forEachChild(node,visit);}
  visit(source);
  if(!result)throw new Error(`Missing registry ${name}`);
  return result;
}
function ids(file,name){
  const result=[];
  function visit(node){
    if(ts.isPropertyAssignment(node)&&node.name.getText().replace(/['"]/g,'')==='id'&&ts.isStringLiteral(node.initializer))result.push(node.initializer.text);
    ts.forEachChild(node,visit);
  }
  visit(initializer(file,name));return result;
}
const base='app/community-options/';
const c=[['page.tsx','homePages'],['topics.tsx','topicPages'],['applications.tsx','applicationPages'],['reading.tsx','readingPages'],['personal.tsx','personalPages']].flatMap(([file,name])=>ids(base+'c-prototype/'+file,name));
const b=[...new Set([
 ...[['work-management.tsx','worksPages'],['content-management.tsx','contentManagementPages'],['model-series-management.tsx','modelSeriesPages'],['platform-management.tsx','platformPages'],['aigc-management.tsx','aigcPages'],['retained-operations-management.tsx','retainedOperationsPages'],['page.tsx','bPages']].flatMap(([file,name])=>ids(base+'b-prototype/'+file,name)),
 ...initializer(base+'b-prototype/operations-management.tsx','pageSpecs').elements.map(row=>row.elements[0].text)
])];
const cross=ids(base+'cross-prototype/data.ts','crossPages');
const errors=[];const counts={};
for(const [section,registered] of Object.entries({c,b,cross})){
  const entries=JSON.parse(fs.readFileSync(path.join(root,`design-notes/page-requirements-${section}.json`),'utf8'));
  counts[section]=registered.length;
  for(const id of registered)if(!entries[id])errors.push(`${section}/${id}: missing requirements`);
  for(const [id,text] of Object.entries(entries)){
    if(!registered.includes(id))errors.push(`${section}/${id}: unregistered page`);
    if(!/^### [^\n]+\n\n/.test(text))errors.push(`${section}/${id}: missing opening section or heading spacing`);
    if(/(?:本轮|本次修改|已精调|待确认版本|原型演示|localStorage|sessionStorage|\d+\s*px\b)/i.test(text))errors.push(`${section}/${id}: process or layout detail`);
    if(/^### [^\n]+\n(?!\n)/m.test(text))errors.push(`${section}/${id}: heading cannot render`);
  }
  const texts=registered.map(id=>entries[id]).filter(Boolean);
  if(new Set(texts).size!==texts.length)errors.push(`${section}: duplicate whole-page requirements`);
}
if(process.argv.includes('--registry')){console.log(JSON.stringify({c,b,cross}));process.exit(0);}
console.log(JSON.stringify({counts,total:Object.values(counts).reduce((a,b)=>a+b,0),errors},null,2));
if(errors.length)process.exitCode=1;
