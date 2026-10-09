'use client';
/* oxlint-disable react/react-compiler -- Restore browser URL after server hydration. */
import { useEffect, useState, useCallback, useRef } from 'react';
import {deviceDestination,readerVisible,readerGroup} from '../navigation-model';
import {CommonFeedback} from './common-feedback';
import {OverlayGallery,pageOverlays} from './overlay-gallery';
import { isCoveredCommonState } from '../common-states/catalog';
import { allPages } from '../c-prototype/page';
import { bPages, backendNavigation, backendParents } from '../b-prototype/page';
import { crossPages } from '../cross-prototype/data';
import './review.css';
import {ReviewWorkspace} from './review-workspace';
import {iterations,pageIterations,IterationScope,DeepIntegration} from './iterations';
import {ProductPlan} from './product-plan';

import {PageRequirements,ModuleFlow,SharedRequirements} from './contracts';
import {TrackedFrame} from './tracked-frame';
import {
  AnnotatedApp,
  appReviewPages,
  appReviewIds,
} from './app-review';
const sections = [
  { id: 'c', name: 'C 端', route: 'c-prototype', pages: allPages },
  { id: 'b', name: 'B 端', route: 'b-prototype', pages: bPages },
  { id: 'cross', name: '跨产品', route: 'cross-prototype', pages: crossPages },
];
// Reader ownership is independent of product navigation and page implementation modules.
const communityGroups = [
  {title:'作品', entries:[['community','作品','works'],['work','作品详情','']]},
  {title:'交流', entries:[['community','交流','talk'],['post','帖子详情','']]},
  {title:'教程', entries:[['community','教程','tutorials'],['tutorial','教程详情','']]},
  {title:'圈子', entries:[['circles','圈子列表',''],['circle','圈子详情','']]},
];
const stateLabels: Record<string, string> = {
 'review-error':'审核提交失败','review-unknown':'审核结果待确认',
 'result-text':'剧本结果','result-video':'视频结果',
 'app-suite':'电商套图','app-analysis':'选品分析','app-music':'音乐翻唱','app-storyboard':'分镜一致性质检','app-website':'网页开发',
  'create-image':'图片生成','create-text':'剧本创作','create-video':'视频生成','work-image':'图片作品','work-video':'视频作品','work-text':'文本作品',
  'search-default':'默认推荐搜索','search-results':'命中结果','search-no-results':'无匹配结果',
  'exchange-confirm':'确认兑换','exchange-submitting':'兑换中','exchange-success':'兑换成功','exchange-insufficient':'积分不足','exchange-soldout':'库存不足','exchange-unavailable':'商品停止兑换','exchange-price-changed':'价格已变更','exchange-failure':'兑换失败','exchange-unknown':'兑换结果待确认',
  'account-switched':'账号已切换','action-error':'操作异常',activity:'活动投稿','activity-ended':'活动已结束',approved:'已通过','award-pending':'待发奖',awarded:'已获奖',blocked:'已阻止',cancelled:'已取消','change-failed':'变更失败',changed:'内容已变更',completed:'已完成',confirm:'待确认','content-removed':'内容已下架','copy-error':'复制失败','copy-failed':'复制失败','dependency-missing':'缺少依赖',done:'已完成',duplicate:'重复提交',edit:'编辑中',ended:'已结束',expired:'已过期',expiring:'即将过期','file-missing':'文件缺失',hold:'积分冻结','identity-changed':'身份已变更','identity-error':'身份异常',idle:'未开始',impact:'影响确认',ineligible:'不符合条件',insufficient:'积分不足',invalid:'信息无效','invalid-target':'目标无效','license-denied':'授权受限','load-failed':'加载失败','login-expired':'登录已失效','media-error':'素材加载失败',mismatch:'信息不匹配',mobile:'手机端','network-error':'网络异常','object-gone':'对象已失效',partial:'部分完成',pc:'电脑端',pending:'待处理',permission:'权限受限','permission-revoked':'权限已撤销',post:'帖子',private:'私密',public:'公开','publish-failed':'发布失败',records:'记录','reference-invalid':'引用无效',rejected:'未通过',release:'积分释放',restricted:'受限制',return:'返回',reviewing:'审核中',revision:'修订中',revoked:'已撤销',running:'生成中','save-error':'保存失败','save-failed':'保存失败',single:'单项','source-withdrawn':'来源已撤回',stale:'信息已过时','submit-error':'提交失败','submit-failed':'提交失败',submitted:'已提交','target-removed':'目标已下架',text:'文字',unauthorized:'未授权',uncertain:'待确认',unknown:'未知状态',unpublished:'未发布',unqualified:'不符合资格',unsupported:'暂不支持',unverified:'未验证','update-error':'更新失败','upload-failed':'上传失败',uploading:'上传中','upstream-blocked':'上游受阻',validation:'信息校验',video:'视频',withdrawn:'已撤回',
  normal: '正常',
  loading: '加载中',
  empty: '暂无内容',
  error: '加载失败',
  failure: '操作失败',
  failed: '失败',
  removed: '已下架',
  closed: '已关闭',
  guest: '未登录',
  forbidden: '无权限',
  paused: '暂停',
  unavailable: '不可用',
  review: '审核中',
  returned: '已退回',
  incomplete: '信息不完整',
  conflict: '编辑冲突',
  published: '已发布',
  'more-error': '更多加载失败',
  'no-permission': '无权限',
  'permission-denied': '无权限',
  'view-only': '仅查看',
  'outcome-only': '仅成果',
  'source-removed': '来源已下架',
  'image-error': '图片加载失败',
};
export default function Review() {
  const sharedDialog=useRef<HTMLDialogElement>(null);
  const [iteration,setIteration]=useState(1),[chain,setChain]=useState('makenow-app'),[deepMode,setDeepMode]=useState('plan');
  const [ready,setReady]=useState(false);
  const [overlays,setOverlays]=useState(false),[overlaySelection,setOverlaySelection]=useState('');
  const [notesOpen,setNotesOpen]=useState(false),[notesTab,setNotesTab]=useState('requirements'),[selectedState,setSelectedState]=useState('normal');
  const [inspected,setInspected]=useState<{id:string;section:string;state:string;card?:string}|null>(null);
  const readMode=(mode:string)=>{if(mode==='requirements'||mode==='flow'){setReading('prototype');setNotesTab(mode);setNotesOpen(true);}else setReading(mode);};
  const [section, setSection] = useState('c'),
    [pageId, setPageId] = useState('home'),
    [flat, setFlat] = useState(false),
    [common, setCommon] = useState(false),
    [restart, setRestart] = useState(0),
    [device, setDevice] = useState('mobile'),
    [reading, setReading] = useState('plan'),
    [annotations, setAnnotations] = useState(false),
    [zoom, setZoom] = useState('fit'),
    [context, setContext] = useState('');
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setCommon(q.get('view') === 'common' && q.get('section') !== 'b');
    setReady(true);
    const mode=q.get('reading');
    setReading(mode==='plan'?'plan':mode||q.get('display')==='overlays'?'prototype':'plan');
    if(mode==='requirements'||mode==='flow'){setNotesTab(mode);setNotesOpen(true);}else if(q.get('notes')){setNotesTab(q.get('notes')==='flow'?'flow':'requirements');setNotesOpen(true);}
    setFlat(q.get('display')==='states');
    setOverlays(q.get('display')==='overlays');setOverlaySelection(q.get('overlay')||'');
    setDevice(q.get('device')==='pc'?'pc':'mobile');
    setContext(q.get('context') || (q.get('view')==='community'?'tab=works':''));
    const group =
        sections.find((s) => s.id === q.get('section')) || sections[0],
      initialDestination=deviceDestination(q.get('view')||'home',q.get('context')||'',q.get('device')||'mobile'),
      p = group.pages.find((p) => p.id === (group.id==='c'?initialDestination.id:(q.get('view')==='analytics-channels'?'analytics-growth':q.get('view')==='analytics-incentives'?'analytics-activity':q.get('view')==='op-submissions'?'op-events':q.get('view')==='op-redemptions'?'op-shop':q.get('view'))));
    setSection(group.id);
    const rawIteration=Number(q.get('iteration'));const requested=q.get('iterationPlan')==='2'?(rawIteration===2?2:1):(rawIteration===3?2:1);const memberships=pageIterations(group.id,p?.id||'home');setIteration(group.id==='cross'?2:[1,2].includes(requested)&&(requested===2||memberships.includes(requested))?requested:memberships[0]||1);setChain(q.get('chain')==='makenow-result'||(!q.has('chain')&&q.get('view')==='create-result')?'makenow-result':'makenow-app');setDeepMode(q.get('deepMode')||'plan');
    if (p) {
      const dest=initialDestination;
      setPageId(group.id==='c'?dest.id:p.id);if(group.id==='c')setContext(dest.query);
      if(p.id==='tutorials'&&group.id==='c'&&q.get('device')!=='pc'){const legacy=new URLSearchParams(q.get('context')||'');legacy.set('tab','tutorials');setContext(legacy.toString());}
    }
  }, []);
  const readerModule=useCallback((s:string,p:{id:string;module:string})=>s==='b'?(backendNavigation.find(g=>g.items.includes(backendParents[p.id]||p.id))?.title||p.module):readerGroup(s,p,device),[device]);
  const selectedGroup=sections.find(s=>s.id===section)!;
  const group={...selectedGroup,pages:selectedGroup.pages.map(p=>section==='c'&&device==='pc'&&p.id==='circles'?{...p,title:'圈子首页'}:p).filter(p=>(section==='cross'||iteration===2||pageIterations(section,p.id).includes(iteration))&&(section!=='c'||readerVisible(p.id,device))).sort((a,b)=>section==='c'&&device==='pc'?['circles','discover-circles','discussion','circle','post','tutorials','tutorial'].indexOf(a.id)-['circles','discover-circles','discussion','circle','post','tutorials','tutorial'].indexOf(b.id):0)},
    currentModule=readerModule(section,group.pages.find(p=>p.id===pageId)||group.pages[0]),
    modules = [...new Set(group.pages.map((p) => readerModule(section,p)))].sort((a,b)=>section==='c'?['首页','AIGC','社区','专题','AI应用','教程','圈子','创作与发布','活动','AI 商城','我的','登录','共用页面'].indexOf(a)-['首页','AIGC','社区','专题','AI应用','教程','圈子','创作与发布','活动','AI 商城','我的','登录','共用页面'].indexOf(b):section==='b'?[...backendNavigation.map(g=>g.title),'通用页面'].indexOf(a)-[...backendNavigation.map(g=>g.title),'通用页面'].indexOf(b):0),
    pages = group.pages.filter((p) => readerModule(section,p) === currentModule ).sort((a,b)=>section==='c'&&device==='mobile'&&currentModule==='社区'?['community','work','post','circles','circle','tutorial'].indexOf(a.id)-['community','work','post','circles','circle','tutorial'].indexOf(b.id):0),
    page = pages.find((p) => p.id === pageId) || pages[0] || group.pages[0],
    index = pages.findIndex((p) => p.id === page.id);
  const pageStates = (section==='c'&&device==='pc'&&page.id==='create'?['normal','create-image','create-text','create-video']:section==='c'&&device==='pc'&&page.id==='app'?['normal','app-suite','app-analysis','app-music','app-storyboard','app-website']:page.states).filter(s=>!isCoveredCommonState(page.id,s,section));
  const overlayCount=section==='c'?pageOverlays(page.id,device).length:0;
  const showOverlays=overlays&&overlayCount>0;
  const businessStateCount=pageStates.filter(s=>s!=='normal').length;
  const hasBusinessStates=businessStateCount>0;
  useEffect(()=>{if(!hasBusinessStates)setFlat(false);},[hasBusinessStates]);
  const inlineSingleState=businessStateCount===1;
  useEffect(()=>{
    if(ready&&flat&&!hasBusinessStates){setFlat(false);setInspected(null);setSelectedState('normal');}
  },[ready,flat,hasBusinessStates]);
  const appSample = section === 'c' && appReviewPages.includes(page.id);
  const homeSample = section === 'c' && page.id === 'home';
  const url =
    '/community-options/' +
    group.route +
    '?page=' +
    page.id +
    (context ? '&' + context : section==='c'&&page.id==='activity'?'&item=guoqing_qitianle_20261001':section==='c'&&page.id==='search'?'&q=':'');
  const select = (s: string, _m: string, id: string, query = '') => {
    setOverlays(false);setOverlaySelection('');
    setCommon(false);
    setFlat(false);setInspected(null);setSelectedState('normal');
    setAnnotations(false);
    setSection(s);
    const member=pageIterations(s,id);if(s==='cross')setIteration(2);else if(!member.includes(iteration))setIteration(member[0]||1);
    const dest=deviceDestination(id,query,device);
    setPageId(s==='c'?dest.id:id);
    const selectionQuery=new URLSearchParams(s==='c'?dest.query:query);
    if(s==='c'&&id==='tutorials'&&device!=='pc')selectionQuery.set('tab','tutorials');
    setContext(selectionQuery.toString());
    setRestart((n) => n + 1);

  };
  const openTarget = (target: string, sourcePage?: string) => {
    setNotesOpen(false);
    const targetSection = target.startsWith('cross:') ? 'cross' : target.startsWith('b:')?'b':'c';
    const [rawTarget,targetQueryRaw=''] = target.replace(/^(cross|b):/, '').split('?');
    const resolvedTarget=targetSection==='c'?deviceDestination(rawTarget,targetQueryRaw,device):{id:rawTarget,query:targetQueryRaw};
    const id=resolvedTarget.id,targetQuery=resolvedTarget.query;
    const g = sections.find((s) => s.id === targetSection)!;
    const p = g.pages.find((p) => p.id === id);
    if (p) {
      select(g.id, p.module, p.id);
      setReading('prototype');
      const q = new URLSearchParams(targetQuery);
      if(g.id==='c'&&id==='tutorials'&&device!=='pc')q.set('tab','tutorials');
      const defaults:Record<string,[string,string]>={post:['item','restore'],circle:['item','image'],work:['item','restore'],app:['item','copy'],author:['name','林间']};
      if(defaults[id]&&!q.has(defaults[id][0]))q.set(defaults[id][0],defaults[id][1]);
      if(id==='pc-handoff')q.set('item','video');
      if (target === 'cross:project') {
        const fromResource=sourcePage==='resource';
        q.set('source', fromResource?'resource':'app');
        q.set('return', fromResource?'/community-options/c-prototype?page=resource':'/community-options/c-prototype?page=app&item=video');
      }
      const dest=deviceDestination(id,q.toString(),device);
      setPageId(g.id==='c'?dest.id:id);setContext(g.id==='c'?dest.query:q.toString());
    }
  };
  const syncPage = useCallback(
    (id: string, search: string, targetSection = 'c') => {
      const p = sections
        .find((s) => s.id === targetSection)
        ?.pages.find((p) => p.id === id);
      if (p) {
        setSection(targetSection);
        const member=pageIterations(targetSection,id);if(targetSection==='cross')setIteration(2);else if(!member.includes(iteration))setIteration(member[0]||1);
        const dest=deviceDestination(id,search,device);
        setPageId(targetSection==='c'?dest.id:id);
        const q = new URLSearchParams(search);
        setSelectedState(q.get('state')||'normal');
        q.delete('page');q.delete('device');q.delete('state');q.delete('embed');
        if(targetSection==='c'&&id==='tutorials'&&device!=='pc')q.set('tab','tutorials');
        setContext(q.toString());

      }
    },
    [device,iteration],
  );
  useEffect(()=>{
  if(!ready)return;
    const q=new URLSearchParams({section,view:common?'common':pageId,device,reading,iteration:String(iteration),iterationPlan:'2'});if(iteration===2&&section!=='cross'){q.set('chain',chain);q.set('deepMode',deepMode);}
    if(context&&!common)q.set('context',context);
    if(notesOpen)q.set('notes',notesTab);
    if(flat)q.set('display','states');
    if(showOverlays&&!common){q.set('display','overlays');if(overlaySelection)q.set('overlay',overlaySelection);}
    history.replaceState(null,'','?'+q.toString());
  },[ready,section,pageId,device,context,common,reading,notesOpen,notesTab,flat,showOverlays,overlaySelection,iteration,chain,deepMode]);
  const noteSection=inspected?.section||section;
  const notePage=sections.find(g=>g.id===noteSection)?.pages.find(p=>p.id===(inspected?.id||page.id))||page;
  const noteState=inspected?.state||(flat?pageStates.find(s=>s!=='normal')||'normal':selectedState);
  const notePages=sections.find(g=>g.id===noteSection)!.pages.filter(p=>(noteSection!=='c'||readerVisible(p.id,device))&&readerModule(noteSection,p)===readerModule(noteSection,notePage));
  const noteBody=notesTab==='flow'?<ModuleFlow section={noteSection} pages={notePages} currentId={notePage.id} open={openTarget} device={device}/>:<PageRequirements section={noteSection} page={notePage}/>;
  const noteContent=<><IterationScope iteration={iteration} section={noteSection} page={notePage.id}/>{noteBody}</>;
  const inspect=(id:string,state:string,group=section,card=id+state)=>setInspected({id,state,section:group,card});
  const changeDevice=(value:string)=>{const deviceQuery=new URLSearchParams(context);if(section==='c'&&page.id==='create-result')deviceQuery.set('state',noteState);const dest=deviceDestination(page.id,deviceQuery.toString(),value);setDevice(value);if(section==='c'){setPageId(dest.id);setContext(dest.query);}setFlat(false);setInspected(null);setAnnotations(false);setRestart(n=>n+1);};
  const activeTab=new URLSearchParams(context).get('tab')||'works';
    const chooseIteration=(value:number)=>{setIteration(value);setCommon(false);setNotesOpen(false);setFlat(false);setOverlays(false);setInspected(null);if(value===2){setSection('c');setPageId('app');setContext('');return;}const sec=section==='cross'?'c':section;const candidates=sections.find(s=>s.id===sec)!.pages.filter(p=>pageIterations(sec,p.id).includes(value)&&(sec!=='c'||readerVisible(p.id,device)));setSection(sec);if(!candidates.some(p=>p.id===pageId)){setPageId(candidates[0].id);setContext('');}};
  const iterationNav=<nav className="rv-iterations" aria-label="迭代分组">{iterations.map(i=><button key={i.id} aria-pressed={iteration===i.id} onClick={()=>chooseIteration(i.id)}><strong>{i.id}. {i.title}</strong><small>{i.status}</small></button>)}</nav>;
  if(!ready)return <main className="rv-main" aria-busy="true"/>;
  const sharedPanel=<dialog ref={sharedDialog} className="rv-shared-dialog"><header><strong>公共说明</strong><button onClick={()=>sharedDialog.current?.close()} aria-label="关闭公共说明">关闭</button></header><SharedRequirements/></dialog>;
  if(iteration===2&&section!=='cross')return <div className="rv-shell"><aside className="rv-sidebar"><a href="/">← 返回研究室</a><h1>多元拾光</h1><p>原型阅读台</p>{iterationNav}<button className="rv-shared-entry" onClick={()=>sharedDialog.current?.showModal()}>公共说明</button><nav aria-label="互通链路">{[['makenow-app','AI应用'],['makenow-result','AIGC继续创作']].map(([id,label])=><button key={id} aria-current={chain===id?'page':undefined} onClick={()=>setChain(id)}>{label}</button>)}</nav></aside>{sharedPanel}<main className="rv-main"><div className="rv-toolbar"><h2>MakeNow 互通 · 进行中</h2><nav>{[['plan','产品方案'],['prototype','页面原型'],['requirements','页面需求'],['flow','模块流程']].map(([id,label])=><button key={id} aria-pressed={deepMode===id} onClick={()=>setDeepMode(id)}>{label}</button>)}</nav></div><DeepIntegration chain={chain} mode={deepMode}/></main></div>;
  return (
    <div
      className={'rv-shell' + (homeSample && !common ? ' rv-home-sample' : '')}
    >
      <aside className="rv-sidebar">
        <a className="rv-research-link" href="/">← 返回研究室</a>
        <h1>多元拾光</h1>
        <p>原型阅读台</p>
        {iterationNav}
        <div className="rv-sections">
          {sections.filter(s=>s.id!=='cross').map((s) => (
            <button
              key={s.id}
              aria-pressed={section === s.id}
              onClick={() => select(s.id, s.pages[0].module, s.pages.find(p=>pageIterations(s.id,p.id).includes(iteration))?.id||s.pages[0].id)}
            >
              {s.name}
            </button>
          ))}
        </div>
        <button className="rv-shared-entry" onClick={()=>sharedDialog.current?.showModal()}>公共说明</button><nav aria-label="评审模块">
          {modules.map((m, i) => (
            <div key={m}>
              <button
                aria-current={!common && currentModule === m ? 'step' : undefined}
                onClick={() => {
                  const p = group.pages.find((p) => readerModule(section,p) === m)!;
                  select(section, m, p.id);
                }}
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                <strong>{m}</strong>
                <small>
                  {group.pages.filter((p) => readerModule(section,p) === m ).length + '页'}
                </small>
              </button>
              {!common && currentModule === m && (
                <div className="rv-page-tree">
                  {section==='b'? (backendNavigation.find(g=>g.title===m)?.items||group.pages.filter(p=>readerModule(section,p)===m).map(p=>p.id)).map(id=><div className="rv-nav-branch" key={id}>{group.pages.filter(p=>p.id===id||backendParents[p.id]===id).sort((a,b)=>a.id===id?-1:b.id===id?1:0).map(p=><button key={p.id} className={p.id===id?'rv-nav-parent':'rv-nav-child'} aria-current={page.id===p.id?'page':undefined} onClick={()=>select(section,m,p.id)}>{p.title}</button>)}</div>):section==='c'&&device==='mobile'&&m==='社区' ? <><button aria-current={page.id==='community'&&!new URLSearchParams(context).has('tab')?'page':undefined} onClick={()=>select(section,m,'community')}>社区首页</button>{communityGroups.filter(branch=>branch.entries.some(([id])=>pageIterations(section,id).includes(iteration))).map(branch=><div className="rv-nav-branch" key={branch.title}>

                    {branch.entries.filter(([id])=>pageIterations(section,id).includes(iteration)).map(([id,label,tab],index)=><button key={id+tab} className={index===0?'rv-nav-parent':'rv-nav-child'}
                      aria-current={(page.id===id&&(id!=='community'||new URLSearchParams(context).get('tab')===tab))||(page.id==='tutorials'&&tab==='tutorials')?'page':undefined}
                      onClick={()=>select(section,m,id,tab?'tab='+tab:'')}>{label}</button>)}
                  </div>)}</> : group.pages
                    .filter((p) => readerModule(section,p) === m)
                    .map((p) => (
                      <button key={p.id} aria-current={page.id === p.id ? 'page' : undefined}
                        onClick={() => select(section, m, p.id)}>{p.title}</button>
                    ))}

                </div>
              )}
            </div>
          ))}
          {section!=='b'&&(
            <button
              aria-current={common ? 'step' : undefined}
              onClick={() => {
                setCommon(true);
                history.replaceState(null, '', '?section='+section+'&view=common');
              }}
            >
              <span>◇</span>
              <strong>通用反馈</strong>
            </button>
          )}
        </nav>

      </aside>
      {sharedPanel}<main className="rv-main">

        {!common && (
          <div className="rv-toolbar">
            <header className="rv-heading">
              <div>
                <small>
                  {group.name} / {currentModule}
                </small>
                <h2>
                  {section==='c'&&page.id==='community'?(new URLSearchParams(context).has('tab')?'社区 · '+({works:'作品',talk:'交流',tutorials:'教程'}[activeTab]||'作品'):'社区首页'):page.title}{' '}
                  {appSample && <small>{appReviewIds[page.id]}</small>}
                </h2>
              </div>

            </header>
            {(
              <div className="rv-workspace-tools">
                <a href={`/community-options/prototype-gallery?section=${section === 'b' ? 'b' : 'c'}&device=${device}`} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'inherit',textDecoration:'none',padding:'6px 10px',border:'1px solid #d9dde3',borderRadius:5,background:'#fff'}}>纯享版 ↗</a>

                {section==='c'&&<nav aria-label="设备">
                  <button
                    aria-pressed={device === 'mobile'}
                    onClick={() => changeDevice('mobile')}
                  >
                    移动端
                  </button>
                  <button
                    aria-pressed={device === 'pc'}
                    onClick={() => changeDevice('pc')}
                  >
                    PC端
                  </button>
                </nav>}
                {(
                  <nav aria-label="阅读方式">
                    {[
                      ['plan', '产品方案'],
                      ['prototype', '页面原型'],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        aria-pressed={reading === key}
                        onClick={() => readMode(key)}
                      >
                        {label}
                      </button>
                    ))}
                  </nav>
                )}
              </div>
            )}
            {(reading === 'prototype') && (
              <>{overlayCount>0&&<nav aria-label="页面与弹层" className="rv-overlay-variants"><button aria-pressed={!showOverlays} onClick={()=>setOverlays(false)}>页面</button><button aria-pressed={showOverlays} onClick={()=>{setOverlays(true);setFlat(false);}}>弹层与提示（{overlayCount}）</button></nav>}<div className="rv-notes-launch"><button onClick={()=>{setOverlays(false);readMode('requirements');}}>页面需求</button><button onClick={()=>{setOverlays(false);readMode('flow');}}>模块流程</button></div>{!showOverlays&&(businessStateCount>1||(appSample&&device==='mobile'&&!flat&&!inlineSingleState))&&<div className="rv-controls">
                <div>
                  {businessStateCount>1&&<button
                    aria-pressed={!flat && !common}
                    onClick={() => {
                      setFlat(false);setInspected(null);setSelectedState('normal');
                      setCommon(false);setRestart(n=>n+1);
                    }}
                  >
                    正常页面
                  </button>}
                  {businessStateCount>1 && <button
                    aria-pressed={flat && !common}
                    onClick={() => {
                      setFlat(true);setInspected({id:page.id,section,state:pageStates.find(s=>s!=='normal')||'normal'});
                      setCommon(false);
                    }}
                  >
                    {page.id==='create'&&device==='pc'?'创作类型':page.id==='work'?'内容类型':page.id==='app'&&device==='pc'?'应用样本':'业务状态'}（{pageStates.filter((s) => s !== 'normal').length}
                    ）
                  </button>}
                  {appSample && device === 'mobile' && !flat && !inlineSingleState && (
                    <button
                      aria-pressed={annotations}
                      onClick={() => setAnnotations(!annotations)}
                    >
                      入口标注
                    </button>
                  )}
                </div>
              </div>}</>
            )}
          </div>
        )}
        {common ? (
          <CommonFeedback section={section}/>
        ) : reading === 'plan' ? (
          <ProductPlan section={section} page={page} device={device} onRead={readMode}/>
        ) : showOverlays ? <OverlayGallery page={page.id} device={device} selection={overlaySelection} onSelect={setOverlaySelection}/> : (<ReviewWorkspace states={flat?pageStates.filter(s=>s!=='normal').map(s=>({id:s,title:stateLabels[s]||s,active:noteState===s})):[]} onStateSelect={s=>inspect(page.id,s)} mobile={section==='c'&&device==='mobile'} open={notesOpen} onClose={()=>setNotesOpen(false)} title={notePage.title+(noteState==='normal'&&!hasBusinessStates?'':' · '+(stateLabels[noteState]||noteState))} tab={notesTab} onTab={setNotesTab} notes={noteContent}>
          {((flat&&hasBusinessStates)||inlineSingleState)?<div className={'rv-review-cards '+(section==='c'&&device==='mobile'?'mobile':'desktop')}>
            {pageStates.filter(state=>inlineSingleState||state!=='normal').map(state=>({p:page,state})).map(({p,state})=>{
              const sampleContext=new URLSearchParams(context);
              const appItems:Record<string,string>={'app-suite':'sample-suite','app-analysis':'sample-analysis','app-music':'sample-music','app-storyboard':'sample-storyboard','app-website':'sample-website'};
              if(section==='c'&&device==='pc'&&p.id==='app'&&appItems[state]){sampleContext.set('item',appItems[state]);sampleContext.delete('id');}
              const cardUrl='/community-options/'+group.route+'?page='+p.id+(sampleContext.size?'&'+sampleContext.toString():'')+'&device='+device+'&state='+state+'&embed=1';
              const active=inspected?.card?inspected.card===p.id+state:notePage.id===p.id&&noteState===state;
              return <section data-review-state={state} key={section+p.id+state+device} className={active?'selected':''}><button className="rv-card-select" aria-pressed={active} onClick={()=>inspect(p.id,state)}>{p.title} · {stateLabels[state]||state}</button><TrackedFrame mobileBrowser={section==='c'&&device==='mobile'} title={p.title+' '+(stateLabels[state]||'未知状态')} src={cardUrl} onNavigate={()=>{}} onActivate={(id,search,g)=>{if(id!==p.id||g!==section){setFlat(false);setInspected(null);syncPage(id,search,g);setRestart(n=>n+1);}else inspect(id,new URLSearchParams(search).get('state')||'normal',g,p.id+state);}} /></section>;
            })}
          </div>: section === 'c' && device === 'pc' ? (
          <section className="rv-pc-preview">
            <label>预览比例 <select value={zoom} onChange={e=>setZoom(e.target.value)}><option value="fit">适应宽度</option><option value="1">100%</option></select></label>
            {(flat?pageStates.filter(s=>s!=='normal'):['normal']).map(s=><div key={String(restart)+s}><h3>{flat?(stateLabels[s]||s):''}</h3><div className={'rv-pc-scroll '+(zoom==='fit'?'fit':'')}><TrackedFrame key={String(restart)+s} onNavigate={flat?()=>{}:syncPage} title={`PC原型：${page.title} ${stateLabels[s] || '未知状态'}`} src={homeSample&&s==='normal'?'/community-options/home-prototype':url+'&device=pc&state='+s+(flat?'&embed=1':'')}/></div></div>)}
          </section>
        ) : appSample && !flat && annotations ? (
          <AnnotatedApp
            key={restart}
            page={page.id}
            url={url}
            annotations={annotations}
            open={openTarget}
            onNavigate={syncPage}
          />
        ) : !flat ? (
          <>
            <div
              className={'rv-stage ' + (section === 'c' ? 'mobile' : 'desktop')}
            >
              <TrackedFrame
                mobileBrowser={section==='c'}
                key={String(restart)+device}
                onNavigate={syncPage}
                title={`交互原型：${page.title}`}
                src={url}
              />
            </div>
          </>
        ) : (
          <div
            className={'rv-flat ' + (section === 'c' ? 'mobile' : 'desktop')}
          >
            {pageStates
              .filter((s) => s !== 'normal')
              .map((s) => (
                <section key={url + s}>
                  <h3>{stateLabels[s] || s}</h3>
                  <iframe
                    title={`${page.title} ${stateLabels[s] || '未知状态'}`}
                    src={url + '&state=' + s + '&embed=1'}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"
                  />
                </section>
              ))}
          </div>
        )}</ReviewWorkspace>)}
        {!common && (reading === 'prototype') && (
          <footer className="rv-next">
            <button
              disabled={index === 0}
              onClick={() => select(section, currentModule, pages[index - 1].id)}
            >
              上一页
            </button>
            <span>
              {index + 1} / {pages.length} · {page.title}
            </span>
            {index < pages.length - 1 ? (
              <button
                onClick={() => select(section, currentModule, pages[index + 1].id)}
              >
                下一页：{pages[index + 1].title}
              </button>
            ) : (
              <button
                disabled={modules.indexOf(currentModule) === modules.length - 1}
                onClick={() => {
                  const m = modules[modules.indexOf(currentModule) + 1],
                    p = group.pages.find((p) => readerModule(section,p) === m)!;
                  select(section, m, p.id);
                }}
              >
                下一组
              </button>
            )}
          </footer>
        )}
      </main>
    </div>
  );
}
