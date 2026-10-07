const fs=require('fs');const base='design-notes/b-end-20261006/';const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const clean=s=>s.replaceAll('20/50/100条分页','固定20条分页，支持输入页码跳转，不提供每页条数切换').replaceAll('表格默认20条，支持50/100条','表格固定20条，支持输入页码跳转，不提供每页条数切换');
for(const f of ['platform-management-requirements.json','operations-management-requirements.json']){let text=fs.readFileSync(base+f,'utf8').replace(/^\uFEFF/,'');fs.writeFileSync(base+f,clean(text));}
let all=read('design-notes/page-requirements-b.json');Object.assign(all,read(base+'content-management-requirements.json'),read(base+'platform-management-requirements.json'));
const ui='\n\n### 列表展示规范\n\n不重复展示页面标题、列表标题及顶部总数摘要；筛选区紧凑排列。列表内操作采用无边框文字按钮；涉及用户展示头像、昵称和独立用户ID。分页支持输入页码跳转，不提供每页条数选择。走查规则通过弹层查看和关闭。';
for(const id of Object.keys(all)){if(typeof all[id]==='string'){all[id]=clean(all[id]);if(!all[id].includes('### 列表展示规范'))all[id]+=ui;}}
write('design-notes/page-requirements-b.json',all);
