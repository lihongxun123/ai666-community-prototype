const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function inline(s) {
  return esc(s).replace(/\[([^\]]+)\]\((https?:\/\/[^ )]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1 ↗</a>')
    .replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
}
function md(text,prefix='') {
  const lines=text.split(/\r?\n/); let out='',list='',table=false,index=0;
  const close=()=>{if(list){out+=`</${list}>`;list='';} if(table){out+='</tbody></table></div>';table=false;}};
  for(let i=0;i<lines.length;i++){
    const l=lines[i];
    if(!l.trim()){close();continue;}
    if(l.startsWith('|')){
      if(/^\|[\s:|-]+\|$/.test(l))continue;
      const cells=l.split('|').slice(1,-1).map(x=>inline(x.trim()));
      if(!table){close();out+='<div class="table-wrap"><table><thead><tr>'+cells.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>';table=true;}
      else out+='<tr>'+cells.map(x=>'<td>'+x+'</td>').join('')+'</tr>';
      continue;
    }
    const h=l.match(/^(#{1,4}) (.*)/);
    if(h){close();const n=h[1].length;out+=`<h${n} id="${prefix}s${++index}">${inline(h[2])}</h${n}>`;continue;}
    const li=l.match(/^(- |\d+\. )(.*)/);
    if(li){const tag=li[1]==='- '?'ul':'ol';if(list!==tag){close();out+=`<${tag}>`;list=tag;}out+='<li>'+inline(li[2])+'</li>';continue;}
    close();out+='<p>'+inline(l)+'</p>';
  }close();return out;
}
const figures=[
 ['pc-tutorial-from-list.png','教程：普通列表入口，当前变成单列通用模板'],
 ['pc-tutorial-_embed_1.png','教程：嵌入样本，使用已精调的 PC 模板'],
 ['pc-app.png','文案改写 PC：暂未开放使用'],
 ['mobile-app.png','同一应用手机：仍承诺进入 MakeNow'],
 ['pc-invite-rules.png','PC 邀请规则：包含限额与有效性'],
 ['mobile-invite-rules.png','手机邀请规则：仅保留三个阶段'],
 ['mobile-mine.png','手机管理卡片：操作仍在状态行'],
 ['pc-create-video-bottom.png','已改善：生成中卡片与结果宽度一致'],
 ['pc-circle-comments.png','已改善：圈内评论、回复与右栏常驻'],
 ['pc-common-bottom.png','已确认：通用反馈可滚动至底部']
];
for(const [f] of figures)if(!fs.existsSync(path.join(root,'screenshots',f)))throw new Error('Missing '+f);
const gallery=figures.map(([f,t])=>`<figure><a href="screenshots/${f}" target="_blank"><img loading="lazy" src="screenshots/${f}" alt="${esc(t)}"></a><figcaption>${esc(t)}</figcaption></figure>`).join('');
const main=md(fs.readFileSync(path.join(root,'audit.md'),'utf8'));
const rq=md(fs.readFileSync(path.join(root,'requirements-review.md'),'utf8'),'rq-');
const code=md(fs.readFileSync(path.join(root,'online-code-review.md'),'utf8'),'code-');
const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>C端全量审查 · 2026-10-05</title><style>
:root{color-scheme:light;--ink:#23272c;--muted:#68737a;--line:#dfe4e7;--accent:#226755}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#f3f5f4;color:var(--ink);font:15px/1.85 system-ui,"Microsoft YaHei",sans-serif}.top{position:sticky;top:0;z-index:10;background:#ffffffed;backdrop-filter:blur(14px);border-bottom:1px solid var(--line);padding:14px max(24px,calc((100vw - 1160px)/2));display:flex;gap:24px;align-items:center}.top strong{margin-right:auto}.top a{font-size:13px;white-space:nowrap}main{max-width:1160px;margin:36px auto 80px;background:white;padding:40px 52px;border:1px solid var(--line);border-radius:12px}h1{font-size:32px;letter-spacing:-1px;line-height:1.4;margin:0 0 12px}h2{font-size:23px;line-height:1.5;margin:48px 0 20px;padding-top:18px;border-top:1px solid var(--line);scroll-margin-top:80px}h3{font-size:18px;line-height:1.6;margin:30px 0 12px;color:#254f44;scroll-margin-top:80px}h4{font-size:16px}p{margin:12px 0}a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}li{margin:7px 0}code{background:#f0f3f2;border-radius:3px;padding:2px 5px;font:12px/1.6 ui-monospace,monospace;overflow-wrap:anywhere}.table-wrap{overflow-x:auto;margin:20px 0}table{border-collapse:collapse;width:100%;font-size:13px;min-width:670px}th,td{text-align:left;vertical-align:top;border-bottom:1px solid var(--line);padding:12px}th{background:#edf3f0;color:#325448}td:first-child{font-weight:600}details{margin-top:28px;border:1px solid var(--line);border-radius:8px;padding:18px 22px}summary{cursor:pointer;font-weight:700;font-size:17px}details>h1{font-size:25px;margin-top:24px}.gallery{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0;background:#f5f6f5;border:1px solid var(--line);border-radius:8px;overflow:hidden}figure img{display:block;width:100%;height:330px;object-fit:contain;background:#eaeeec}figcaption{font-size:13px;padding:12px 16px;color:#52605a}.scope{font-size:12px;color:var(--muted)}@media(max-width:760px){main{margin:16px 8px;padding:24px 18px}.top{padding:12px 16px;gap:14px}.top strong{font-size:13px}.gallery{grid-template-columns:1fr}h1{font-size:25px}h2{font-size:20px}}
</style><nav class="top"><strong>多元拾光 · C 端审查</strong><a href="#s3">问题清单</a><a href="#evidence">截图对照</a><a href="#appendix">详细证据</a><a href="audit.md">Markdown</a></nav><main>${main}<h2 id="evidence">关键截图对照</h2><p class="scope">点击查看原始尺寸。图片均为本地原型；线上个人信息未另存入报告。</p><div class="gallery">${gallery}</div><h2 id="appendix">逐项证据附录</h2><details><summary>展开：需求与信息架构独立审查（12 项问题 + 36 页索引）</summary>${rq}</details><details><summary>展开：真实源码对照、待定业务与研发边界</summary>${code}</details><p class="scope">本报告不代表生产验收，不包含修改上线授权。生成于 2026-10-05。</p></main></html>`;
fs.writeFileSync(path.join(root,'index.html'),html);
console.log(JSON.stringify({report:'index.html',figures:figures.length,bytes:Buffer.byteLength(html)}));
