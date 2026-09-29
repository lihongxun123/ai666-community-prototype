import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const site=process.cwd(),root=fs.realpathSync('dist/client'),pub=path.resolve('public');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const rel=f=>path.relative(pub,f).split(path.sep).join('/');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const images=walk(pub).filter(f=>/\.(png|jpe?g|webp)$/i.test(f));
const canonical=new Map();for(const f of images.filter(f=>!rel(f).startsWith('research-deliveries/')))canonical.set(hash(f),rel(f));
const extras=JSON.parse(fs.readFileSync('lib/lossless-assets.json','utf8'));
const aliases=JSON.parse(fs.readFileSync('lib/report-image-aliases.json','utf8'));
const mappings=[];for(const f of images.filter(f=>rel(f).startsWith('research-deliveries/'))){const to=canonical.get(hash(f));if(to)mappings.push({from:rel(f),to,bytes:fs.statSync(f).size});}
// Only frozen, static report references are rewritten. Source reports and originals remain intact.
if(Object.keys(aliases).length!==mappings.length+extras.attachments.length+extras.conversions.length)throw Error('Stale legacy image aliases');
for(const m of [...mappings,...extras.attachments,...extras.conversions])if(aliases['/'+m.from]!=='/'+m.to)throw Error('Legacy image alias missing: '+m.from);
const textFiles=walk(root).filter(f=>/\.(html|css|json|md|csv|js|mjs)$/.test(f));let rewritten=0;
for(const f of textFiles){let text=fs.readFileSync(f,'utf8'),next=text;const here=path.posix.dirname(path.relative(root,f).split(path.sep).join('/'));
 for(const m of mappings){const relative=path.posix.relative(here,m.from);for(const old of ['/'+m.from,relative]){
  // Complete URL token only, not a substring of another asset name/path.
  const escaped=old.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  next=next.replace(new RegExp('(?<=["\'`(\\s=])'+escaped+'(?=["\'`)\\s?#<>]|$)','g'),'/'+m.to);
 }}if(next!==text){fs.writeFileSync(f,next);rewritten++;}
}
// Static concept directories only. Dynamic home/proposal galleries are never guessed unused.
const sourceText=['app','components','lib','public'].flatMap(d=>walk(d)).filter(f=>/\.(tsx?|html|css|json|md|csv|js|mjs)$/.test(f)).map(f=>fs.readFileSync(f,'utf8')).join('\n');
const unused=images.filter(f=>/^(proposal-fusion|concepts\/a-task)\//.test(rel(f))&&!sourceText.includes(path.basename(f))&&!sourceText.includes(path.basename(f,path.extname(f)))).map(f=>({from:rel(f),bytes:fs.statSync(f).size}));
for(const m of [...mappings,...unused]){const file=path.resolve(root,m.from);if(!file.startsWith(root+path.sep)||hash(file)!==hash(path.join(pub,m.from)))throw Error('Unsafe image cleanup');fs.unlinkSync(file);}
for(const m of [...extras.attachments,...extras.conversions]){
 const file=path.resolve(root,m.from),target=path.resolve(root,m.to);
 if(!file.startsWith(root+path.sep)||!target.startsWith(root+path.sep)||!fs.existsSync(target))throw Error('Unsafe extra cleanup');
 if(extras.attachments.includes(m)&&hash(file)!==hash(target))throw Error('Attachment identity mismatch');
 fs.unlinkSync(file);
}
const proof={attachments:extras.attachments,conversions:extras.conversions,originalsPreserved:true,rewrittenFiles:rewritten,mappings,unused,removedImages:mappings.length+unused.length,savedMiB:+([...mappings,...unused].reduce((s,m)=>s+m.bytes,0)/1048576).toFixed(2)};
fs.mkdirSync('dist/.openai',{recursive:true});fs.writeFileSync('dist/.openai/image-cleanup.json',JSON.stringify(proof,null,2));
console.log(JSON.stringify({removedImages:proof.removedImages,duplicateImages:mappings.length,unusedImages:unused.length,savedMiB:proof.savedMiB,rewrittenFiles:rewritten}));
