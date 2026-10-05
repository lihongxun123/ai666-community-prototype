"""Export review source and original prototype media; no credentials or logs."""
from pathlib import Path
import hashlib
import json
import re
import zipfile

root = Path(__file__).resolve().parent.parent
out = root / 'public/downloads'
out.mkdir(parents=True, exist_ok=True)
local_assets = root/'.cache/prototype-original-assets-20261005'
local_assets.mkdir(parents=True, exist_ok=True)
stamp = '2026-10-05'
readme = '''# 多元拾光原型交付包 · 2026-10-05

这是当前评审中的 React / TypeScript 原型源码，不是 Figma 设计文件，也不是已经接入后端的生产系统。

## 打开方式
1. 下载源码包并解压。
2. 安装 Node.js 22.13 或更新版本，在包含 package.json 的目录执行 npm ci。
3. 执行 node scripts/restore-prototype-assets.mjs 补齐素材（需要联网），再执行 npm run dev，打开 http://127.0.0.1:3000/community-options/prototype-review 。
4. 不需要账号、生产 API Key 或线上数据。交互采用浏览器本地演示状态。

## 设计与研发入口
- app/community-options/prototype-review/：页面目录、需求、流程、评审状态。
- app/community-options/c-prototype/：C 端组件与 CSS。
- app/community-options/b-prototype/：B 端组件与演示配置。
- app/community-options/cross-prototype/：MakeNow 等跨产品承接演示。
- app/community-options/mobile-home/、home-prototype/：移动与 PC 首页。
- design-notes/page-requirements-*.json：页面需求源；design-notes/c-requirements-20261005/：C 端通用规则、业务决定和设计研发需求。
- public/：图片、视频和图标。脚本从本次发布的无损素材恢复原型路径，不裁切、不降低尺寸或像素质量；重新编码后的图片不承诺与原始文件字节相同。

轻创作保留在社区；AI 应用提供发现与介绍，由 MakeNow 承接使用。账户已互通；深度互通方案与开发尚未完成，原型中的继续创作入口不代表参数、素材或任务已经跨产品同步。
本包以 C/B/跨产品原型为交付范围；为保留编译依赖附带研究站源代码，但历史研究报告的图片、附件与旧方案素材不全量打包。请从上述原型评审入口开始。
版本仍在评审，界面内的“已完成/待确认/待评审”状态保留，不代表全量产品定稿。
'''
source = []
for folder in ['app', 'components', 'hooks', 'lib']:
    source.extend(p for p in (root/folder).rglob('*') if p.is_file() and p.suffix in {'.ts','.tsx','.js','.json','.css','.md','.mjs'})
for name in ['package.json','package-lock.json','tsconfig.json','next-env.d.ts','next.config.ts','vite.config.ts','proxy.ts','components.json','.oxlintrc.json','.oxfmtrc.json','.openai/hosting.json']:
    if (root/name).is_file(): source.append(root/name)
source.extend(p for p in (root/'scripts').glob('*.mjs') if p.name != 'site-workflow.mjs')
source.extend((root/'design-notes').glob('requirements-*.md'))
source.extend((root/'design-notes').glob('page-requirements-*.json'))
source.extend(p for p in (root/'design-notes/c-requirements-20261005').iterdir() if p.suffix in {'.md','.json','.mjs'})
source.append(root/'design-notes/ui-design-handoff.md')

files = []
def archive(name, paths, include_readme=False):
    dest = (local_assets if "assets-" in name else out)/name
    with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        if include_readme: z.writestr('START-HERE.md', readme)
        for p in sorted(set(paths)):
            z.write(p,p.relative_to(root).as_posix())
    with zipfile.ZipFile(dest) as z:
        assert z.testzip() is None
        assert not any(any(x in n.split('/') for x in ['.git','node_modules','.wrangler']) or n.endswith('.log') for n in z.namelist())
    assert dest.stat().st_size < 24*1024*1024, name
    if dest.parent == out: files.append({'name':name,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})


media = set()
for folder in ['home-prototype','community-design','retained','brand']:
    media.update(p for p in (root/'public'/folder).rglob('*') if p.is_file())
for p in (root/'app/community-options').rglob('*'):
    if p.suffix not in {'.ts','.tsx','.css','.json'}: continue
    for match in re.findall(r'/[\w/-]+\.(?:png|jpg|jpeg|webp|svg|mp4|vtt)',p.read_text(encoding='utf-8')):
        candidate = root/'public'/match.lstrip('/')
        if candidate.is_file(): media.add(candidate)
# Independently extractable ZIP volumes: each includes its original public path.
batch=[]; size=0; index=1
for p in sorted(media):
    if batch and size+p.stat().st_size > 19*1024*1024:
        archive(f'prototype-assets-{index:02d}-{stamp}.zip',batch); batch=[];size=0;index+=1
    batch.append(p);size+=p.stat().st_size
if batch: archive(f'prototype-assets-{index:02d}-{stamp}.zip',batch)
# Recover the published lossless assets into their original source paths.
cleanup=json.loads((root/'dist/.openai/image-cleanup.json').read_text(encoding='utf-8'))
aliases={m['from']:m['to'] for key in ['mappings','attachments','conversions'] for m in cleanup[key]}
assets=[]
for p in sorted(media):
    original=p.relative_to(root/'public').as_posix(); deployed=original
    seen=set()
    while deployed in aliases and deployed not in seen:
        seen.add(deployed);deployed=aliases[deployed]
    file=root/'dist/client'/deployed
    if not file.is_file(): raise RuntimeError('Missing deploy asset: '+original)
    assets.append({'path':original,'url':deployed,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
restore = """import fs from 'node:fs/promises';
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
"""
(root/'scripts/restore-prototype-assets.mjs').write_text(restore,encoding='utf-8')
(root/'scripts/prototype-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2),encoding='utf-8')
source.extend([root/'scripts/restore-prototype-assets.mjs',root/'scripts/prototype-assets.json'])
archive('prototype-source-'+stamp+'.zip',source,True)
(out/'manifest.json').write_text(json.dumps({'date':stamp,'scope':'C/B/cross-product review prototype','files':files},ensure_ascii=False,indent=2),encoding='utf-8')
links=''.join(f'<li><a download href="{f["name"]}">{"源码与需求说明" if "source" in f["name"] else "原始素材包 "+f["name"].split("-")[2]} · {f["bytes"]/1024/1024:.1f} MB</a></li>' for f in files)
(out/'index.html').write_text('''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>原型源码下载 · 多元拾光</title><style>body{font:16px/1.8 system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 22px;color:#25272b}h1{font-size:26px}a{color:#2758a5}li{margin:16px 0}small{color:#777}code{background:#f4f4f4;padding:3px 6px}</style><h1>原型源码与素材恢复</h1><small>2026-10-05 · 当前评审版本</small><p>包含 C 端、B 端和跨产品承接的可编辑 React 源码与需求，附联网素材恢复脚本。不是 Figma 文件，也不是已经接入后端的生产系统。</p><ul>'''+links+'''</ul><h2>本地打开</h2><p>下载源码包并解压。安装 Node.js 22.13 或更新版本，依次执行 <code>npm ci</code>、<code>node scripts/restore-prototype-assets.mjs</code> 和 <code>npm run dev</code>。详细目录说明见源码包内 START-HERE.md。</p><p>素材还原脚本需要联网，会自动补齐图片、视频和图标，并核验版本。图片保留原尺寸与像素质量，编码后的文件不保证与原始文件字节相同；历史研究报告附件不在本次交付范围内。</p><p><a href="/community-options/prototype-review?section=c&amp;view=home&amp;device=mobile&amp;reading=prototype">返回在线原型评审</a> · <a href="manifest.json">文件校验清单</a></p></html>''',encoding='utf-8')
print(json.dumps({'files':files,'sourceFiles':len(source),'mediaFiles':len(media)},ensure_ascii=False))
