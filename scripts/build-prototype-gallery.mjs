import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const root=process.cwd(), evidence=path.join(root,'design-notes/retained-evidence'), out=path.join(root,'public/prototype-screenshots');
fs.mkdirSync(out,{recursive:true});
const labels={home:'首页'};
for(const file of ['c-prototype/topics.tsx','c-prototype/applications.tsx','c-prototype/reading.tsx','c-prototype/personal.tsx','cross-prototype/data.ts']){
 const source=fs.readFileSync(path.join(root,'app/community-options',file),'utf8');
 for(const m of source.matchAll(/id:\s*'([^']+)',\s*title:\s*'([^']+)'/g))labels[m[1]]=m[2];
}
const items=[];
function add(section,module,prefix,ids){for(const id of ids.split(' ')){const file=prefix+id+'.png';if(!fs.existsSync(path.join(evidence,file)))throw new Error('Missing screenshot: '+file);fs.copyFileSync(path.join(evidence,file),path.join(out,file));items.push({section,module,title:labels[id]||id,file});}}
add('C 端','首页与发现','c-refined-','home topics topic apps app');
add('C 端','社区与内容','c-refined-','community circles circle post tutorials tutorial work resource search author');
add('C 端','跨端承接','c-refined-','pc-handoff account-link return-result');
add('C 端','创作与发布','c-refined-','create publish post-edit publish-status');
Object.assign(labels,{entry:'创作与发布选择',result:'工作台 · 生成结果',history:'工作台 · 生成记录'});add('C 端','创作与发布','c-create-','entry result history');
add('C 端','个人与账号','c-refined-','mine my-relations profile-edit my-content drafts records favorites notifications');
labels['login-mobile']='登录弹层';add('C 端','个人与账号','c-refined-','login-mobile');
add('C 端','活动与积分商城','c-refined-','activities activity submissions points checkin invite shop shop-records');
for(const [id,title] of Object.entries({'home-pc':'PC · 首页','create-pc':'PC · 生成工作台','mine-pc':'PC · 我的','post-edit-pc':'PC · 内容编辑','login-pc':'PC · 登录弹层','resource-pc':'PC · 资源详情','work-pc':'PC · 作品详情','activity-pc':'PC · 活动详情','shop-pc':'PC · 商城','shop-records-pc':'PC · 兑换记录'}))labels[id]=title;
add('C 端','PC 样本','c-refined-','home-pc create-pc mine-pc post-edit-pc login-pc resource-pc work-pc activity-pc shop-pc shop-records-pc');
for(const [id,title] of Object.entries({works:'作品管理',posts:'帖子管理',tutorials:'教程管理',apps:'AI 应用管理',resources:'资源管理','work-edit':'作品编辑','post-edit':'帖子编辑','tutorial-edit':'教程编辑','app-edit':'应用编辑','resource-edit':'资源编辑',preview:'内容预览',reviews:'审核任务',review:'审核详情',release:'发布确认',verify:'能力核验',references:'引用与影响',transfer:'维护交接',history:'操作记录'}))labels[id]=title;
add('B 端','内容管理','b-refined-','works posts tutorials apps resources work-edit post-edit tutorial-edit app-edit resource-edit');
add('B 端','审核、发布与维护','b-refined-','preview reviews review release verify references transfer history');
labels['content-leave-dialog']='未保存修改离开确认';add('B 端','审核、发布与维护','b-refined-','content-leave-dialog');
const op=fs.readFileSync(path.join(root,'app/community-options/b-prototype/operations.tsx'),'utf8');for(const m of op.matchAll(/id:\s*"([^"]+)",\s*title:\s*"([^"]+)"/g))labels[m[1]]=m[2];
add('B 端','内容运营','b-refined-','op-topics op-topic-edit op-circles op-circle-edit op-taxonomy op-features op-slots');
add('B 端','活动与账户服务','b-refined-','op-events op-event-edit op-submissions op-points op-shop op-permissions');
add('跨产品','分享与复用','x-refined-','project share version copy library editor derivative');
add('跨产品','成果回流','x-refined-','results link return return-status');
add('跨产品','工作流与作者维护','x-refined-','workflow workflow-import maintain maintain-tutorial maintain-resource maintain-status');
for (const item of items) {
 const stats = await sharp(path.join(out,item.file)).stats();
 if (Math.max(...stats.channels.slice(0,3).map(channel=>channel.stdev)) < 3) throw new Error('Blank screenshot: '+item.file);
}
const status=JSON.parse(fs.readFileSync(path.join(root,'app/community-options/prototype-review/handoff-status.json'),'utf8'));
for(const item of items){
 const id=item.file.replace(/^c-refined-/, '').replace(/-pc\.png$/, '').replace(/\.png$/, '');
 item.status=item.section==='C 端'&&status.completed.includes(id)?status.labels.completed:item.section==='C 端'&&!item.file.endsWith('-pc.png')&&status.structureMobile.includes(id)?status.labels.structure:item.section==='C 端'&&(status.refined.includes(id)||['c-create-result.png','c-create-history.png'].includes(item.file))?status.labels.refined:status.labels.pending;
}
const data=JSON.stringify(items).replaceAll('<','\\u003c');
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>多元拾光 · 原型截图</title><style>*{box-sizing:border-box}body{margin:0;background:#f5f5f5;color:#222;font:15px/1.5 system-ui,sans-serif}header,main{max-width:1160px;margin:auto;padding:20px 16px}h1{font-size:22px;margin:0}header p{font-size:12px;color:#888;margin:5px 0 18px}.controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center}button,select{font:inherit;border:1px solid #ddd;border-radius:4px;background:white;padding:8px 14px;color:#333}button[aria-pressed=true]{background:#222;color:#fff;border-color:#222}select{width:100%;margin-top:12px;max-width:420px}main{padding-top:0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}.wide{grid-template-columns:1fr}figure{margin:0;min-width:0}figcaption{font-size:15px;font-weight:600;padding:12px 0}img{width:100%;height:auto;display:block;border-radius:4px;background:#fff}figure.mobile{max-width:430px}a{color:inherit}footer{padding:24px 0;font-size:12px;color:#888}#count{color:#888;font-size:12px;margin:12px 0}@media(max-width:600px){header,main{padding-left:12px;padding-right:12px}.grid{display:block}figure{margin-bottom:24px}button{flex:1}h1{font-size:20px}}</style></head><body><header><h1>多元拾光 · 原型截图</h1><p>2026 年 9 月 28 日 · 页面完成度标记 · 演示内容</p><p>已完成仅表示产品原型确认；首页已完成，其他页面按标记评审。</p><div class="controls" id="sections"></div><label><select id="module" aria-label="选择模块"></select></label><div id="count"></div></header><main><div class="grid" id="gallery"></div><footer>点击截图可查看原图。这里只展示原型，不执行真实业务。</footer></main><script>const items=${data};let section='C 端';const sections=document.querySelector('#sections'),modules=document.querySelector('#module'),gallery=document.querySelector('#gallery');function render(){const shown=items.filter(x=>x.section===section&&(modules.value==='全部'||x.module===modules.value));gallery.className='grid'+(section==='C 端'&&modules.value!=='PC 样本'?'':' wide');gallery.replaceChildren();for(const item of shown){const f=document.createElement('figure');if(section==='C 端'&&!item.file.endsWith('-pc.png'))f.className='mobile';const c=document.createElement('figcaption');c.textContent=item.title+' · '+item.status;const a=document.createElement('a');a.href=item.file+'?v=20260928-handoff';a.target='_blank';a.rel='noopener';const img=document.createElement('img');img.src=item.file+'?v=20260928-handoff';img.alt=item.title;img.loading='lazy';a.append(img);f.append(c,a);gallery.append(f)}document.querySelector('#count').textContent=section+' · '+modules.value+' · '+shown.length+' 张';}function select(name){section=name;for(const b of sections.children)b.setAttribute('aria-pressed',String(b.textContent===name));modules.replaceChildren();for(const name of [...new Set(items.filter(x=>x.section===section).map(x=>x.module)),'全部']){const o=document.createElement('option');o.value=name;o.textContent=name;modules.append(o)}render()}for(const name of ['C 端','B 端','跨产品']){const b=document.createElement('button');b.textContent=name;b.onclick=()=>select(name);sections.append(b)}modules.onchange=render;select(section);</script></body></html>`;
fs.writeFileSync(path.join(out,'index.html'),html);fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({date:'2026-09-28',items},null,2));
console.log(JSON.stringify({screenshots:items.length,sections:Object.fromEntries(['C 端','B 端','跨产品'].map(s=>[s,items.filter(x=>x.section===s).length])),output:out}));
