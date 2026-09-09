import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { businessInsights } from './lib/business-synthesis.ts';

const root = import.meta.dirname;
const output = path.resolve(root, '../v3');
const filename = path.join(root, 'lib/business-data.json');
const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
const expected = ['liblib','runninghub','tusi','civitai','seaart','openart','nightcafe','jimeng','kling','midjourney','leonardo','runway','waytoagi','datawhale','huggingface','modelscope','linuxdo','dify'];
const errors = [];
if (JSON.stringify(data.map(p => p.id)) !== JSON.stringify(expected)) errors.push('The scope or order differs from the 18-profile report.');
const required = ['name','summary','payer','revenueModel'];
const arrays = ['commercialization','metrics','segments','funnel','economics','implications','unknowns','sources'];
for (const profile of data) {
  for (const key of required) if (typeof profile[key] !== 'string' || !profile[key].trim()) errors.push(`${profile.id}: missing ${key}`);
  for (const key of arrays) if (!Array.isArray(profile[key]) || !profile[key].length) errors.push(`${profile.id}: empty ${key}`);
  const ids = profile.sources.map(source => source.id);
  if (new Set(ids).size !== ids.length) errors.push(`${profile.id}: duplicate source IDs`);
  if (profile.sources.length < 3) errors.push(`${profile.id}: fewer than three sources`);
  for (const source of profile.sources) {
    for (const key of ['id','title','url','publisher','date','accessedAt','type','note']) if (!source[key]) errors.push(`${profile.id}: incomplete source ${source.id} / ${key}`);
    try { if (new URL(source.url).protocol !== 'https:') errors.push(`${profile.id}: non-HTTPS source`); } catch { errors.push(`${profile.id}: invalid source URL`); }
  }
  for (const item of [...profile.commercialization, ...profile.metrics, ...profile.segments]) {
    if (!Array.isArray(item.refs)) errors.push(`${profile.id}: references must be an array`);
    for (const ref of item.refs || []) if (!ids.includes(ref)) errors.push(`${profile.id}: unresolved reference ${ref}`);
  }
  for (const metric of profile.metrics) {
    for (const key of ['label','value','period','scope','kind','meaning','limitation']) if (!metric[key]) errors.push(`${profile.id}: metric missing ${key}`);
    if (metric.kind !== '资料不足' && !metric.refs.length) errors.push(`${profile.id}: unsourced metric ${metric.label}`);
  }
  const text = JSON.stringify(profile);
  if (/turn\d+(?:search|view)\d+|Bearer\s|BEGIN PRIVATE KEY|appgprj_|[?&](?:auth_token|access_token|gclid|workspace)=/.test(text)) errors.push(`${profile.id}: private or internal marker`);
}
const insights = businessInsights;
const sources = data.flatMap(profile => profile.sources.map(source => ({ profile: profile.id, ...source })));
const validation = {
  checkedAt: new Date().toISOString(), status: errors.length ? 'failed' : 'passed', scope: 'Commercialization, scale and users; extension of the existing 18 dossiers',
  profileCount: data.length, sourceRecordCount: sources.length, uniqueSourceUrls: new Set(sources.map(source => source.url)).size,
  metricCount: data.reduce((n,p) => n + p.metrics.length, 0), segmentCount: data.reduce((n,p) => n + p.segments.length, 0),
  dataSha256: crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex'),
  profiles: data.map(p => ({ id: p.id, sources: p.sources.length, metrics: p.metrics.length, segments: p.segments.length, chineseCharacters: (JSON.stringify(p).match(/[\u3400-\u9fff]/g) || []).length })),
  errors, boundary: 'Structural validation does not independently verify claims, source truth or website interaction.'
};
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'research-validation.json'), JSON.stringify(validation, null, 2) + '\n');
if (errors.length) { console.error(JSON.stringify(validation, null, 2)); process.exit(1); }
const md = ['# 多元拾光：18 个 AI 社区的商业化、规模与用户', '', '资料核验截至 2026-09-09。原第二轮页面证据与实操记录继续保留，本轮只扩展经营资料与用户分析。', ''];
for (const insight of insights) { md.push(`## ${insight.title}`, '', ...insight.paragraphs.flatMap(p => [p, ''])); for (const source of insight.refs) md.push(`[${source.title}](${source.url})`); md.push(''); }
for (const p of data) {
  const refs = ids => ids.map(id => p.sources.find(source => source.id === id)).filter(Boolean).map(source => `[${source.title}](${source.url})`).join('；');
  md.push(`## ${p.name}`, '', p.summary, '', `主要付款者：${p.payer}`, '', `收费结构：${p.revenueModel}`, '', '### 商业化路径', '');
  for (const block of p.commercialization) md.push(`#### ${block.title}`, '', block.text, '', refs(block.refs), '');
  md.push('### 规模与口径', '');
  for (const metric of p.metrics) md.push(`#### ${metric.label}：${metric.value}`, '', `${metric.period}；${metric.scope}；${metric.kind}。`, '', metric.meaning, '', `边界：${metric.limitation}`, '', refs(metric.refs), '');
  md.push('### 用户结构与付费动机', '', '除明确引用统计外，以下为基于产品、案例和规则的画像分析，不代表用户占比。', '');
  for (const s of p.segments) md.push(`#### ${s.name}`, '', `任务：${s.job}`, '', `付费触发：${s.payTrigger}`, '', `复访原因：${s.returnReason}`, '', `依据与边界：${s.evidence}`, '', refs(s.refs), '');
  for (const [title, key] of [['付费与复用路径分析','funnel'],['成本与约束','economics'],['对多元拾光的判断','implications'],['未验证问题','unknowns']]) md.push(`### ${title}`, '', ...p[key].flatMap(t => [t, '']));
  md.push('### 来源', '');
  for (const source of p.sources) md.push(`- [${source.title}](${source.url}) — ${source.publisher}；${source.type}；${source.date}；查阅 ${source.accessedAt}。${source.note}`);
  md.push('');
}
fs.writeFileSync(path.join(output, 'report-source.md'), md.join('\n'));
fs.writeFileSync(path.join(output, 'claim-source-ledger.json'), JSON.stringify({ checkedAt: validation.checkedAt, data, insights, note: 'Profile facts cite source IDs; funnels, economics and team implications are analysis with explicit uncertainty.' }, null, 2) + '\n');
console.log(JSON.stringify({ status: validation.status, profiles: data.length, sourceRecords: sources.length, uniqueSources: validation.uniqueSourceUrls, metrics: validation.metricCount, segments: validation.segmentCount }, null, 2));
