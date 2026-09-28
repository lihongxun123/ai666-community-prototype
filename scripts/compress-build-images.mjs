import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

// Keep every original URL and image format; optimize deployment copies only.
const root=fs.realpathSync('dist/client');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):e.isFile()?[path.join(p,e.name)]:[]);
const cache=new Map();
let saved=0,optimized=0;
for(const file of walk(root).filter(p=>/\.(png|jpe?g)$/i.test(p))){
  const original=fs.readFileSync(file);
  if(original.length<100000)continue;
  const key=crypto.createHash('sha256').update(original).digest('hex');
  let bytes=cache.get(key);
  if(!bytes){
    const image=sharp(original),meta=await image.metadata();
    if(meta.pages>1)continue;
    bytes=meta.format==='png'?await image.png({palette:true,quality:90,effort:7}).toBuffer():await image.jpeg({quality:88,mozjpeg:true}).toBuffer();
    const after=await sharp(bytes).metadata();
    if(after.width!==meta.width||after.height!==meta.height||after.format!==meta.format)throw Error('Image contract changed');
    if(bytes.length>=original.length)bytes=original;
    cache.set(key,bytes);
  }
  if(bytes.length<original.length){
    if(!file.startsWith(root+path.sep))throw Error('Image outside build');
    fs.writeFileSync(file,bytes);
    saved+=original.length-bytes.length;optimized++;
  }
}
const files=walk(root),total=files.reduce((n,p)=>n+fs.statSync(p).size,0);
if(total>235*1048576)throw Error('Client assets exceed release budget');
const missing=[];
const publicRoot=path.resolve('public');
for(const source of walk(publicRoot))if(!fs.existsSync(path.join(root,path.relative(publicRoot,source))))missing.push(path.relative(publicRoot,source));
if(missing.length)throw Error('Missing public assets: '+missing.join(', '));
console.log(JSON.stringify({optimized,savedMiB:+(saved/1048576).toFixed(2),clientMiB:+(total/1048576).toFixed(2),publicAssetsChecked:walk(publicRoot).length,missing:missing.length,originalUrlsAndFormatsPreserved:true}));
