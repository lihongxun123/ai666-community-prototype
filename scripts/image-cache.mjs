import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const options={png:{palette:true,quality:90,effort:7},jpeg:{quality:88,mozjpeg:true}};
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
export async function optimizeImage(original,cacheDir){
 const key=hash(Buffer.concat([Buffer.from(JSON.stringify({schema:1,options,versions:sharp.versions})),original]));
 const file=path.join(cacheDir,key+'.bin'),manifest=file+'.json';
 try{const meta=JSON.parse(fs.readFileSync(manifest,'utf8')),bytes=fs.readFileSync(file);if(meta.hash===hash(bytes))return {bytes,hit:true};}catch{/* Missing or damaged cache is regenerated. */}
 const image=sharp(original),meta=await image.metadata();let bytes=original;
 if(!(meta.pages>1)){
  bytes=meta.format==='png'?await image.png(options.png).toBuffer():await image.jpeg(options.jpeg).toBuffer();
  const after=await sharp(bytes).metadata();
  if(after.width!==meta.width||after.height!==meta.height||after.format!==meta.format)throw Error('Image contract changed');
  if(bytes.length>=original.length)bytes=original;
 }
 fs.mkdirSync(cacheDir,{recursive:true});
 const temp=file+'.'+process.pid+'.tmp';fs.writeFileSync(temp,bytes);fs.renameSync(temp,file);
 fs.writeFileSync(manifest,JSON.stringify({hash:hash(bytes)}));
 return {bytes,hit:false};
}
