import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

// Historical reports keep their original public files and ZIPs. Only identical
// image copies in the deployment output are replaced by static-asset redirects.
const site=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=fs.realpathSync(path.join(site,'dist/client'));
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):e.isFile()?[path.join(p,e.name)]:(()=>{throw Error('Unexpected nonregular build member')})());
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const relative=p=>path.relative(root,p).split(path.sep).join('/');
const url=p=>'/'+relative(p).split('/').map(encodeURIComponent).join('/');
const redirects=path.join(root,'_redirects');
if(fs.existsSync(redirects))throw Error('Existing redirects require explicit reconciliation');
const groups=new Map();
for(const p of walk(root).filter(p=>/\.(png|jpe?g|webp)$/i.test(p))){
 const key=path.extname(p).toLowerCase()+':'+sha(p);
 if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);
}
const mappings=[];
for(const [key,paths]of groups){
 paths.sort((a,b)=>relative(a).length-relative(b).length||relative(a).localeCompare(relative(b)));
 const target=paths[0];
 for(const from of paths.slice(1)){
  const resolved=fs.realpathSync(from),rel=path.relative(root,resolved);
  if(rel.startsWith('..')||path.isAbsolute(rel)||!fs.lstatSync(resolved).isFile())throw Error('Unsafe duplicate target');
  if(sha(resolved)!==sha(target))throw Error('Image identity mismatch');
  mappings.push({from:url(from),to:url(target),sha256:key.slice(key.indexOf(':')+1),bytes:fs.statSync(from).size});
 }
}
if(mappings.length>2000)throw Error('Static redirect limit exceeded');
const rules=mappings.map(m=>`${m.from} ${m.to} 302`);
if(rules.some(r=>r.length>1000))throw Error('Redirect rule length exceeded');
if(new Set(mappings.map(m=>m.from)).size!==mappings.length)throw Error('Duplicate redirect source');
const froms=new Set(mappings.map(m=>m.from));
for(const m of mappings)if(froms.has(m.to))throw Error('Redirect chain');
for(const m of mappings){
 const from=path.join(root,...m.from.slice(1).split('/').map(decodeURIComponent));
 const source=path.join(site,'public',...m.from.slice(1).split('/').map(decodeURIComponent));
 if(!fs.existsSync(source)||sha(source)!==m.sha256)throw Error('Public original missing or changed');
 fs.unlinkSync(from);
}
fs.writeFileSync(redirects,'# Identical report images; original sources and archives are retained.\n'+rules.join('\n')+'\n');
const proof={method:'SHA-256 identity + Cloudflare Workers Static Assets 302 redirects',sourcePublicUntouched:true,duplicateCopies:mappings.length,bytesSaved:mappings.reduce((n,m)=>n+m.bytes,0),mappings};
fs.mkdirSync(path.join(site,'dist/.openai'),{recursive:true});
fs.writeFileSync(path.join(site,'dist/.openai/image-dedupe.json'),JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify({duplicateImages:mappings.length,savedMiB:Math.round(proof.bytesSaved/1048576*100)/100,sourcePublicUntouched:true}));
