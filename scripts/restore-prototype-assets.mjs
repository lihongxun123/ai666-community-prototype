import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const assets=JSON.parse(await fs.readFile(new URL('./prototype-assets.json',import.meta.url),'utf8'));
const base='https://ai666-community-research-20260908.hongxun-li.chatgpt.site/';
for (const asset of assets) {
 const response=await fetch(new URL(asset.url,base));
 if(!response.ok)throw Error('Download failed: '+asset.path);
 let bytes=Buffer.from(await response.arrayBuffer());
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw Error('Asset version changed: '+asset.path);
 if(asset.path.endsWith('.png')&&asset.url.endsWith('.webp'))bytes=await sharp(bytes).png().toBuffer();
 const destination=path.resolve('public',asset.path);
 if(!destination.startsWith(path.resolve('public')+path.sep))throw Error('Invalid asset path');
 await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,bytes);
}
console.log('Prototype assets ready:',assets.length);
