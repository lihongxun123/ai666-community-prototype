import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const options={compressionLevel:9,adaptiveFiltering:true,palette:false};
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
export async function optimizeImage(original,cacheDir){
 const key=hash(Buffer.concat([Buffer.from(JSON.stringify({schema:2,mode:'lossless-png-jpeg-original',options,versions:sharp.versions})),original]));
 const file=path.join(cacheDir,key+'.bin'),manifest=file+'.json';
 try{const meta=JSON.parse(fs.readFileSync(manifest,'utf8')),bytes=fs.readFileSync(file);if(meta.hash===hash(bytes))return {bytes,hit:true};}catch{/* Regenerate missing or damaged cache. */}
 const image=sharp(original),meta=await image.metadata();let bytes=original;
 // JPEG re-encoding is not lossless. Keep JPEG, animated and high-bit-depth originals.
 if(meta.format==='png'&&!(meta.pages>1)&&meta.depth==='uchar'){
  const candidate=await image.keepMetadata().png(options).toBuffer();
  if(candidate.length<original.length){
   const after=await sharp(candidate).metadata();
   const beforePixels=await sharp(original).ensureAlpha().raw().toBuffer();
   const afterPixels=await sharp(candidate).ensureAlpha().raw().toBuffer();
   if(after.width!==meta.width||after.height!==meta.height||after.format!==meta.format||!beforePixels.equals(afterPixels))throw Error('Lossless image verification failed');
   bytes=candidate;
  }
 }
 fs.mkdirSync(cacheDir,{recursive:true});
 const temp=file+'.'+process.pid+'.tmp';fs.writeFileSync(temp,bytes);fs.renameSync(temp,file);
 fs.writeFileSync(manifest,JSON.stringify({hash:hash(bytes),lossless:true}));
 return {bytes,hit:false};
}
