import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
process.chdir(root);
const env={...process.env,RESEARCH_DEPLOY_TARGET:'node'};
for(const args of [
 ['node_modules/vinext/dist/cli.js','build'],
 ['scripts/dedupe-build-images.mjs'],
 ['scripts/compress-build-images.mjs'],
 ['scripts/validate-build-images.mjs'],
]){
 const result=spawnSync(process.execPath,args,{cwd:root,env,stdio:'inherit'});
 if(result.status!==0)process.exit(result.status??1);
}
// vinext beta.5 mistakenly records the browser asset prefix as an npm
// dependency. Actual runtime modules are checked by production smoke tests.
const manifest=path.join(root,'dist/server/vinext-externals.json');
const externals=JSON.parse(fs.readFileSync(manifest,'utf8'));
if(externals.includes('_next')&&!fs.existsSync('dist/client/_next/static'))throw Error('Missing client assets');
fs.writeFileSync(manifest,JSON.stringify(externals.filter(name=>name!=='_next'),null,2));
const {emitStandaloneOutput}=await import(pathToFileURL(path.join(root,'node_modules/vinext/dist/build/standalone.js')).href);
const {standaloneDir}=emitStandaloneOutput({root,outDir:path.join(root,'dist')});
// Node serves public assets from dist/client; do not ship a second full copy.
const duplicatePublic=path.join(standaloneDir,'public');
if(duplicatePublic!==path.join(root,'dist/standalone/public'))throw Error('Unexpected output path');
fs.rmSync(duplicatePublic,{recursive:true,force:true});
console.log('Node deployment ready: '+standaloneDir);
