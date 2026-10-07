import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
const root=path.resolve(import.meta.dirname,'../..');process.chdir(root);
const read=p=>fs.readFileSync(p,'utf8');
const base='app/community-options/b-prototype/';
// Evaluate only the page-registration initializers, including their local constants.
// Never import React components or execute their browser storage side effects.
const cache=new Map();
function value(file,name,sourceBase=base){
 const key=sourceBase+file+':'+name;if(cache.has(key))return cache.get(key);
 const sourcePath=fs.existsSync(sourceBase+file)?sourceBase+file:(sourceBase+file).replace(/\.tsx$/,'.ts');
 const source=ts.createSourceFile(file,read(sourcePath),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const declarations=new Map();const imports=new Map();
 for(const statement of source.statements){
  if(ts.isVariableStatement(statement))for(const d of statement.declarationList.declarations)if(ts.isIdentifier(d.name)&&d.initializer)declarations.set(d.name.text,d.initializer.getText(source));
  if(ts.isImportDeclaration(statement)&&statement.importClause?.namedBindings&&ts.isNamedImports(statement.importClause.namedBindings))for(const e of statement.importClause.namedBindings.elements)imports.set(e.name.text,{file:path.posix.join(path.posix.dirname(file),statement.moduleSpecifier.text)+'.tsx',name:e.propertyName?.text||e.name.text});
 }
 const expression=declarations.get(name);if(!expression)throw Error('Missing declaration '+key);
 const js=ts.transpileModule('result = ('+expression+');',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
 const context={};for(let attempt=0;attempt<30;attempt++){
  try{vm.runInNewContext(js,context,{timeout:1000});cache.set(key,context.result);return context.result;}
  catch(error){const dep=/^(\w+) is not defined$/.exec(error.message)?.[1];if(!dep)throw error;if(imports.has(dep)){const ref=imports.get(dep);context[dep]=value(ref.file,ref.name,sourceBase);}else if(declarations.has(dep))context[dep]=value(file,dep,sourceBase);else throw error;}
 }
 throw Error('Unresolved '+key);
}
const pages=value('page.tsx','bPages'),navigation=value('page.tsx','backendNavigation');
const consumerPages=value('page.tsx','allPages','app/community-options/c-prototype/');
const requirements=JSON.parse(read('design-notes/page-requirements-b.json'));
const plans=JSON.parse(read('app/community-options/prototype-review/product-plans-b.json'));
const local=JSON.parse(read('design-notes/b-end-20261006/local-flows.json'));
const errors=[];for(const p of pages){if(!requirements[p.id])errors.push('missing requirement '+p.id);if(!plans[p.id])errors.push('missing plan '+p.id);if(!local[p.id]&&!p.id.startsWith('work'))errors.push('missing local flow '+p.id);if(p.states.some(s=>['unknown','review-unknown','result-unknown'].includes(s)))errors.push('removed state '+p.id);}
for(const p of pages)if(p.states.some(s=>['no-permission','permission-denied','read-only','readonly','permission-revoked','unauthorized'].includes(s)))errors.push('duplicate permission sample '+p.id);
if(pages.filter(p=>p.id==='permission-example').length!==1)errors.push('missing shared permission example');
if(new Set(pages.map(p=>p.id)).size!==pages.length)errors.push('duplicate page ids');
for(const group of navigation)for(const id of group.items)if(!pages.some(p=>p.id===id))errors.push('unknown nav '+id);
for(const f of ['content-management-flows','platform-management-flows'])for(const [id,edges]of Object.entries(JSON.parse(read('design-notes/b-end-20261006/'+f+'.json'))))if(pages.some(p=>p.id===id))for(const edge of edges){const raw=edge[1],consumer=raw.startsWith('c:'),target=raw.replace(/^[bc]:/,'').split('?')[0],registry=consumer?consumerPages:pages;if(!registry.some(p=>p.id===target))errors.push(id+' broken flow '+raw);}
const metrics=JSON.parse(read(base+'metrics-catalog.json'));
const result={checkedAt:new Date().toISOString(),pageCount:pages.length,navigationCount:navigation.reduce((n,g)=>n+g.items.length,0),metricsCount:metrics.length,pages,errors,passed:errors.length===0};
fs.writeFileSync('design-notes/b-end-20261006/coverage.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,pages:undefined}));if(errors.length)process.exitCode=1;
