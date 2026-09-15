import {useState} from 'react';
import data from '@/lib/liblib-supply-multiaxis.json';
import './liblib-visuals.css';
const Evidence=({id,label}:{id:string;label:string})=><a className="visual-evidence" href={'/liblib-evidence?section='+id} target="_blank" rel="noopener noreferrer">{label} ↗</a>;
export function SupplyVisuals(){
 const [axis,setAxis]=useState<'topics'|'scenarios'>('topics');
 const [all,setAll]=useState(false);
 const rows=data.summary[axis].counts;
 const max=Math.max(...rows.map(r=>r.count));
 const unknown=data.summary[axis].statusCounts.find(r=>r.name.includes('未'))!.count;
 return <figure className="liblib-visual supply-axes"><figcaption><strong>目录里有哪些主题与用途？</strong><span>图片模型目录 · {data.summary.denominator} 条去重资源</span></figcaption>
 <div className="visual-switch" role="group" aria-label="选择统计维度"><button aria-pressed={axis==='topics'} onClick={()=>{setAxis('topics');setAll(false);}}>内容主题</button><button aria-pressed={axis==='scenarios'} onClick={()=>{setAxis('scenarios');setAll(false);}}>交付用途</button></div>
 <div className="coding-coverage"><div><span style={{width:((data.summary.denominator-unknown)/data.summary.denominator*100)+'%'}}/></div><small>已识别 {data.summary.denominator-unknown} 条 · 未确认 {unknown} 条</small></div>
 <div className="axis-bars">{(all?rows:rows.slice(0,6)).map(r=><div className="axis-row" key={r.name}><span>{r.name}</span><div><i style={{width:(r.count/max*100)+'%'}}/></div><strong>{r.count}<small> 条</small></strong></div>)}</div>
 <button className="visual-more" onClick={()=>setAll(!all)} aria-expanded={all}>{all?'收起长尾类别':`查看全部 ${rows.length} 类`}</button>
 <p className="visual-note">单位：条；支持多标签归类。</p>
 <Evidence id="liblib-supply-evidence" label="编码口径与样本明细"/>
 </figure>;
}
export function DistributionVisual(){return <figure className="liblib-visual"><figcaption><strong>分类入口承担不同选择</strong><span>入口、用途与筛选并非互斥行业分类</span></figcaption><div className="visual-columns">{[
 ['内容对象','图片模型 · 视频特效','发现灵感 · 工作流','决定先看哪一种内容'],
 ['用途与专题','摄影写真 · 电商营销','建筑室内 · 节日专题','按任务或主题缩小范围'],
 ['使用条件','资源类型 · 底模','许可 · 排序','判断能否使用、怎样选择'],
 ].map(([title,a,b,why])=><div key={title}><h3>{title}</h3><p>{a}<br/>{b}</p><strong>{why}</strong></div>)}</div><div className="visual-path"><span>卡片：效果、作者、类型</span><b aria-hidden="true">→</b><span>详情：参数、版本、许可、讨论</span><b aria-hidden="true">→</b><span>配置页：检查带入内容</span></div><Evidence id="liblib-function-1" label="分类、搜索和卡片证据"/></figure>;}
export function OperationVisual(){return <figure className="liblib-visual"><figcaption><strong>作者、平台与使用者的分工</strong></figcaption><div className="visual-columns">{[
 ['作者','效果与方法','发布资源、说明输入、更新版本、回答问题'],
 ['平台','发现与激励','精选、专题和活动组织内容；作者计划关联使用或付费贡献'],
 ['使用者','尝试与反馈','按资源要求制作，评价效果，提出兼容或结果问题'],
 ].map(([role,goal,text])=><div key={role}><h3>{role}</h3><strong>{goal}</strong><p>{text}</p></div>)}</div><Evidence id="liblib-function-13" label="作者激励规则"/></figure>;}
export function OutcomeVisual(){return <figure className="liblib-visual"><figcaption><strong>问题出现之后，证据走到了哪一步？</strong><span>选取不同结果的案例，不统计解决率</span></figcaption><div className="outcome-rows">
 <div><strong>节点问题</strong><span>提问 → 排查 → 提问者反馈</span><b className="outcome-confirmed">反馈运行成功</b></div>
 <div><strong>材质与色调</strong><span>问题反馈 → 答复或建议</span><b>未确认修复结果</b></div>
 <div><strong>布料、箱包精修</strong><span>找到相关工具与适用说明</span><b>未核验任务验收</b></div>
 </div><Evidence id="liblib-demand-appendix" label="原始问题、回复与替代工具"/> <Evidence id="liblib-function-1" label="色调问题与作者回复"/></figure>;}
export function UsePathVisual(){return <figure className="liblib-visual"><figcaption><strong>五条使用路径，完成范围不同</strong></figcaption><div className="use-paths">{[
 ['作品','另一件作品','已沿作者继续浏览；作者页需切到图片，详情箭头只切同一作品内图片。','liblib-function-2'],
 ['作品／资源','生成配置','已到配置页；同款样本的画幅、张数与作品不同，输入恢复范围需分别核对。','liblib-function-3'],
 ['工作流','AI 应用','节点与简化表单可打开；依赖、输入和运行状态仍影响结果。','liblib-function-3'],
 ['单张生成','收藏、找回、编辑','操作样本完成了生成、收藏与接续编辑。','liblib-function-4'],
 ['LibTV 成片','个人项目','已复制、改名并刷新重开；整套运行、导出及素材授权未验证。','liblib-function-5'],
 ].map(([start,end,note,id])=><div className="use-path-row" key={start}><div><strong>{start}</strong><span aria-hidden="true">→</span><strong>{end}</strong></div><p>{note}</p><Evidence id={id} label="操作证据"/></div>)}</div></figure>;}
