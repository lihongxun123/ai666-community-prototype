import fs from 'node:fs';
import path from 'node:path';
import {optimizeImage} from './image-cache.mjs';

// Optimize retained deployment images only; source images and formats are preserved.
const root=fs.realpathSync('dist/client');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):e.isFile()?[path.join(p,e.name)]:[]);
const cacheDir=path.resolve('.cache/site-images');
const started=performance.now();
let cacheHits=0,cacheMisses=0;
let saved=0,optimized=0;
for(const file of walk(root).filter(p=>/\.(png|jpe?g)$/i.test(p))){
  const source=path.join('public',path.relative(root,file));
  const original=fs.readFileSync(fs.existsSync(source)?source:file);
  if(original.length<100000)continue;
  const {bytes,hit}=await optimizeImage(original,cacheDir);
  if(hit)cacheHits++;else cacheMisses++;
  if(bytes.length<original.length){
    if(!file.startsWith(root+path.sep))throw Error('Image outside build');
    fs.writeFileSync(file,bytes);
    saved+=original.length-bytes.length;optimized++;
  }
}
const files=walk(root),total=files.reduce((n,p)=>n+fs.statSync(p).size,0);

const cleanup=JSON.parse(fs.readFileSync('dist/.openai/image-cleanup.json','utf8'));
const excluded=new Set([...cleanup.mappings,...cleanup.unused,...cleanup.attachments,...cleanup.conversions].map(m=>m.from));
const missing=[];
const publicRoot=path.resolve('public');
for(const source of walk(publicRoot))if(!excluded.has(path.relative(publicRoot,source).split(path.sep).join('/'))&&!fs.existsSync(path.join(root,path.relative(publicRoot,source))))missing.push(path.relative(publicRoot,source));
if(missing.length)throw Error('Missing public assets: '+missing.join(', '));
if(total>240*1048576)throw Error('Client assets exceed lossless release budget (240 MiB plus Worker overhead)');
console.log(JSON.stringify({cacheHits,cacheMisses,elapsedSeconds:+((performance.now()-started)/1000).toFixed(2),optimized,savedMiB:+(saved/1048576).toFixed(2),clientMiB:+(total/1048576).toFixed(2),publicAssetsChecked:walk(publicRoot).length,missing:missing.length,lossless:true,originalsPreserved:true}));
