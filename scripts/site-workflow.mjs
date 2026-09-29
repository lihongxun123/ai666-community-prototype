import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync,spawn} from 'node:child_process';
const env={...process.env};
const bundledNode=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe');
const runtime=env.SITES_NODE_PATH||(process.platform==='win32'&&fs.existsSync(bundledNode)?bundledNode:process.execPath);
if(!fs.existsSync(runtime))throw Error('Sites Node runtime not found: '+runtime);
if(process.platform==='win32'){
 // GNU tar otherwise treats the drive letter as a remote host.
 env.TAR_OPTIONS=((env.TAR_OPTIONS||'')+' --force-local').trim();
 const pathKey=Object.keys(env).find(k=>k.toLowerCase()==='path')||'Path';
 const git=spawnSync('where.exe',['git'],{encoding:'utf8'}).stdout?.trim().split(/\r?\n/)[0];
 const candidates=[env.GIT_BASH_PATH,git&&path.resolve(path.dirname(git),'../bin/bash.exe'),path.join(env.ProgramFiles||'C:/Program Files','Git/bin/bash.exe')].filter(Boolean);
 const bash=candidates.find(p=>fs.existsSync(p));
 if(!bash)throw Error('Git Bash not found. Set GIT_BASH_PATH to bash.exe.');
 env[pathKey]=path.dirname(runtime)+path.delimiter+path.dirname(bash)+path.delimiter+(env[pathKey]||'');
}
const check=spawnSync('bash',['--version'],{env,encoding:'utf8'});
if(check.status!==0)throw Error('Git Bash cannot start: '+(check.error?.code||check.stderr));
if(process.argv.includes('--check')){console.log(check.stdout.split('\n')[0]);console.log('Node '+spawnSync(runtime,['--version'],{encoding:'utf8'}).stdout.trim());process.exit(0);}
const base=path.join(env.CODEX_HOME||path.join(os.homedir(),'.codex'),'plugins/cache/openai-curated-remote/sites');
const versions=fs.readdirSync(base).filter(v=>fs.existsSync(path.join(base,v,'scripts/site-workflow.mjs'))).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
const helper=path.join(base,versions[0]||'','scripts',process.argv.includes('--package')?'package-site.mjs':'site-workflow.mjs');
const args=process.argv.slice(2).filter(a=>a!=='--package');
const child=spawn(runtime,[helper,...args],{env,stdio:'inherit'});
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
child.on('exit',(code)=>{process.exitCode=code??1;});
