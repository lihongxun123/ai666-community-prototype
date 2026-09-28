import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Optimize deployment copies only. Public originals and downloadable archives stay intact.
const root=fs.realpathSync('dist/client');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):e.isFile()?[path.join(p,e.name)]:[]);
const url=p=>'/'+path.relative(root,p).split(path.sep).map(encodeURIComponent).join('/');
const redirects=path.join(root,'_redirects');
const rules=fs.readFileSync(redirects,'utf8').split('\n').filter(x=>x&&!x.startsWith('#')).map(x=>x.split(' '));
const changed=new Map();
let saved=0;
for(const file of walk(root).filter(p=>/\.(png|jpe?g)$/i.test(p))){
  const before=fs.statSync(file).size;
  if(before<200000)continue;
  const meta=await sharp(file).metadata();
  if(meta.pages>1)continue;
  const bytes=await sharp(file).webp({quality:90,effort:4}).toBuffer();
  if(bytes.length>before*.85)continue;
  const target=file+'.webp';
  if(fs.existsSync(target))throw Error('Output collision');
  fs.writeFileSync(target,bytes);
  const after=await sharp(target).metadata();
  if(after.width!==meta.width||after.height!==meta.height)throw Error('Image dimensions changed');
  if(!file.startsWith(root+path.sep))throw Error('Image outside build');
  fs.unlinkSync(file);
  changed.set(url(file),url(target));
  saved+=before-bytes.length;
}
for(const rule of rules)rule[1]=changed.get(rule[1])??rule[1];
for(const [from,to]of changed)rules.push([from,to,'302']);
if(rules.length>2000||new Set(rules.map(r=>r[0])).size!==rules.length)throw Error('Invalid redirect count');
const sources=new Set(rules.map(r=>r[0]));
for(const rule of rules){
  if(sources.has(rule[1]))throw Error('Redirect chain');
  if(!fs.existsSync(path.join(root,decodeURIComponent(rule[1]))))throw Error('Missing image target');
}
fs.writeFileSync(redirects,'# Deployment image optimization; original source assets retained.\n'+rules.map(r=>r.join(' ')).join('\n')+'\n');
const bytes=walk(root).reduce((n,p)=>n+fs.statSync(p).size,0);
console.log(JSON.stringify({optimized:changed.size,savedMiB:+(saved/1048576).toFixed(2),clientMiB:+(bytes/1048576).toFixed(2),redirects:rules.length}));
