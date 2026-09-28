'use client';
/* oxlint-disable react/react-compiler -- Restore browser URL after server hydration. */
import { useEffect, useState, useCallback } from 'react';
import { commonGroups, isCoveredCommonState } from '../common-states/catalog';
import { allPages } from '../c-prototype/page';
import { bPages } from '../b-prototype/page';
import { crossPages } from '../cross-prototype/data';
import './review.css';
import {ReviewWorkspace} from './review-workspace';
import {ProductPlan} from './product-plan';
import {handoffStatus} from './handoff-status';
import {PageRequirements,ModuleFlow} from './contracts';
import {TrackedFrame} from './tracked-frame';
import {
  AnnotatedApp,
  AppRequirements,
  appReviewPages,
  appReviewIds,
} from './app-review';
const sections = [
  { id: 'c', name: 'C 端', route: 'c-prototype', pages: allPages },
  { id: 'b', name: 'B 端', route: 'b-prototype', pages: bPages },
  { id: 'cross', name: '跨产品', route: 'cross-prototype', pages: crossPages },
];
// Reader ownership is independent of product navigation and page implementation modules.
const readerModule = (section: string, page: {id: string; module: string}) => {
  if(section !== 'c') return page.module;
  if(['community','post','circles','circle','tutorials','tutorial'].includes(page.id)) return '社区';
  if(['个人管理','账号与通知','积分与任务'].includes(page.module)) return '我的';
  if(['作品详情','搜索与作者','资源与跨端'].includes(page.module)) return '共用页面';
  return page.module;
};
const communityGroups = [
  {title:'社区首页', entries:[['community','作品','works'],['community','交流','talk'],['community','官方教程','tutorials']]},
  {title:'帖子', entries:[['post','帖子详情','']]},
  {title:'圈子', entries:[['circles','圈子发现',''],['circle','圈子详情','']]},
  {title:'教程', entries:[['tutorial','教程详情','']]},
];
const stateLabels: Record<string, string> = {
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
  const [ready,setReady]=useState(false);
  const [notesOpen,setNotesOpen]=useState(false),[notesTab,setNotesTab]=useState('requirements'),[multi,setMulti]=useState(false),[selectedState,setSelectedState]=useState('normal');
  const [inspected,setInspected]=useState<{id:string;section:string;state:string;card?:string}|null>(null);
  const readMode=(mode:string)=>{if(mode==='requirements'||mode==='flow'){setReading('prototype');setNotesTab(mode);setNotesOpen(true);}else setReading(mode);};
  const [section, setSection] = useState('c'),
    [module, setModule] = useState('首页'),
    [pageId, setPageId] = useState('home'),
    [flat, setFlat] = useState(false),
    [common, setCommon] = useState(false),
    [commonGroup, setCommonGroup] = useState('loading'),
    [restart, setRestart] = useState(0),
    [device, setDevice] = useState('mobile'),
    [reading, setReading] = useState('plan'),
    [annotations, setAnnotations] = useState(false),
    [zoom, setZoom] = useState('fit'),
    [context, setContext] = useState('');
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setCommon(q.get('view') === 'common');
    setReady(true);
    const mode=q.get('reading');
    setReading(mode==='plan'?'plan':mode?'prototype':'plan');
    if(mode==='requirements'||mode==='flow'){setNotesTab(mode);setNotesOpen(true);}else if(q.get('notes')){setNotesTab(q.get('notes')==='flow'?'flow':'requirements');setNotesOpen(true);}
    setFlat(q.get('display')==='states');setMulti(q.get('display')==='pages');
    setDevice(q.get('device')==='pc'?'pc':'mobile');
    setContext(q.get('context') || (q.get('view')==='community'?'tab=works':''));
    const group =
        sections.find((s) => s.id === q.get('section')) || sections[0],
      p = group.pages.find((p) => p.id === q.get('view'));
    setSection(group.id);
    if (p) {
      setModule(readerModule(group.id,p));
      setPageId(p.id==='tutorials'&&group.id==='c'?'community':p.id);
      if(p.id==='tutorials'&&group.id==='c'){const legacy=new URLSearchParams(q.get('context')||'');legacy.set('tab','tutorials');setContext(legacy.toString());}
    }
  }, []);
  const group = sections.find((s) => s.id === section)!,
    modules = [...new Set(group.pages.map((p) => readerModule(section,p)))].sort((a,b)=>section==='c'?['首页','社区','专题','AI应用','创作与发布','活动','AI 商城','我的','共用页面'].indexOf(a)-['首页','社区','专题','AI应用','创作与发布','活动','AI 商城','我的','共用页面'].indexOf(b):0),
    pages = group.pages.filter((p) => readerModule(section,p) === module && !(section==='c'&&p.id==='tutorials')),
    page = pages.find((p) => p.id === pageId) || pages[0] || group.pages[0],
    index = pages.findIndex((p) => p.id === page.id);
  const pageStates = page.states.filter(s=>!isCoveredCommonState(page.id,s,section));
  const hasBusinessStates=pageStates.some(s=>s!=='normal');
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
    (context ? '&' + context : '');
  const select = (s: string, _m: string, id: string, query = '') => {
    setCommon(false);
    setFlat(false);setMulti(false);setInspected(null);setSelectedState('normal');
    setAnnotations(false);
    setSection(s);
    setModule(readerModule(s,sections.find(g=>g.id===s)!.pages.find(p=>p.id===id)!));
    setPageId(s==='c'&&id==='tutorials'?'community':id);
    const selectionQuery=new URLSearchParams(query || (id==='community'?'tab=works':''));
    if(s==='c'&&id==='tutorials')selectionQuery.set('tab','tutorials');
    setContext(selectionQuery.toString());
    setRestart((n) => n + 1);

  };
  const openTarget = (target: string, sourcePage?: string) => {
    setNotesOpen(false);
    const targetSection = target.startsWith('cross:') ? 'cross' : target.startsWith('b:')?'b':'c';
    const [id,targetQuery=''] = target.replace(/^(cross|b):/, '').split('?');
    const g = sections.find((s) => s.id === targetSection)!;
    const p = g.pages.find((p) => p.id === id);
    if (p) {
      select(g.id, p.module, p.id);
      setReading('prototype');
      const q = new URLSearchParams(targetQuery);
      if(g.id==='c'&&id==='tutorials')q.set('tab','tutorials');
      const defaults:Record<string,[string,string]>={post:['item','restore'],circle:['item','image'],work:['item','restore'],app:['item','copy'],author:['name','林间']};
      if(defaults[id]&&!q.has(defaults[id][0]))q.set(defaults[id][0],defaults[id][1]);
      if(id==='pc-handoff')q.set('item','video');
      if (target === 'cross:project') {
        const fromResource=sourcePage==='resource';
        q.set('source', fromResource?'resource':'app');
        q.set('return', fromResource?'/community-options/c-prototype?page=resource':'/community-options/c-prototype?page=app&item=video');
      }
      setContext(q.toString());
    }
  };
  const syncPage = useCallback(
    (id: string, search: string, targetSection = 'c') => {
      const p = sections
        .find((s) => s.id === targetSection)
        ?.pages.find((p) => p.id === id);
      if (p) {
        setSection(targetSection);
        setModule(readerModule(targetSection,p));
        setPageId(targetSection==='c'&&id==='tutorials'?'community':id);
        const q = new URLSearchParams(search);
        setSelectedState(q.get('state')||'normal');
        q.delete('page');q.delete('device');q.delete('state');q.delete('embed');
        if(targetSection==='c'&&id==='tutorials')q.set('tab','tutorials');
        setContext(q.toString());

      }
    },
    [],
  );
  useEffect(()=>{
    if(!ready)return;
    const q=new URLSearchParams({section,view:common?'common':pageId,device,reading});
    if(context&&!common)q.set('context',context);
    if(notesOpen)q.set('notes',notesTab);
    if(flat||multi)q.set('display',multi?'pages':'states');
    history.replaceState(null,'','?'+q.toString());
  },[ready,section,pageId,device,context,common,reading,notesOpen,notesTab,flat,multi]);
  const noteSection=inspected?.section||section;
  const notePage=sections.find(g=>g.id===noteSection)?.pages.find(p=>p.id===(inspected?.id||page.id))||page;
  const noteState=inspected?.state||(flat?pageStates.find(s=>s!=='normal')||'normal':selectedState);
  const notePages=sections.find(g=>g.id===noteSection)!.pages.filter(p=>readerModule(noteSection,p)===readerModule(noteSection,notePage));
  const noteContent=notesTab==='flow'?<ModuleFlow section={noteSection} pages={notePages} currentId={notePage.id} open={openTarget}/>:<>{noteState!=='normal'&&<p className="rv-selected-state">业务状态：{stateLabels[noteState]||noteState}</p>}{noteSection==='c'&&appReviewPages.includes(notePage.id)?<AppRequirements key={notePage.id} page={notePage.id}/>:<PageRequirements section={noteSection} page={notePage}/>}</>;
  const inspect=(id:string,state:string,group=section,card=id+state)=>setInspected({id,state,section:group,card});
  const activeTab=new URLSearchParams(context).get('tab')||'works';
  if(!ready)return <main className="rv-main" aria-busy="true"/>;
  return (
    <div
      className={'rv-shell' + (homeSample && !common ? ' rv-home-sample' : '')}
    >
      <aside className="rv-sidebar">
        <h1>多元拾光</h1>
        <p>原型阅读台</p>
        <div className="rv-sections">
          {sections.map((s) => (
            <button
              key={s.id}
              aria-pressed={section === s.id}
              onClick={() => select(s.id, s.pages[0].module, s.pages[0].id)}
            >
              {s.name}
            </button>
          ))}
        </div>
        <nav aria-label="评审模块">
          {(
            <button
              aria-current={common ? 'step' : undefined}
              onClick={() => {
                setCommon(true);
                history.replaceState(null, '', '?section='+section+'&view=common');
              }}
            >
              <span>◇</span>
              <strong>通用状态</strong>
              <small>
                {commonGroups.reduce((n, g) => n + g.samples.length, 0)} 项
              </small>
            </button>
          )}
          {modules.map((m, i) => (
            <div key={m}>
              <button
                aria-current={!common && module === m ? 'step' : undefined}
                onClick={() => {
                  const p = group.pages.find((p) => readerModule(section,p) === m)!;
                  select(section, m, p.id);
                }}
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                <strong>{m}</strong>
                <small>
                  {group.pages.filter((p) => readerModule(section,p) === m && !(section==='c'&&p.id==='tutorials')).length + '页'}
                </small>
              </button>
              {!common && module === m && (
                <div className="rv-page-tree">
                  {section==='c'&&m==='社区' ? communityGroups.map(branch=><div className="rv-nav-branch" key={branch.title}>
                    <div className="rv-nav-label">{branch.title}</div>
                    {branch.entries.map(([id,label,tab])=><button key={id+tab}
                      aria-current={(page.id===id&&(id!=='community'||activeTab===tab))||(page.id==='tutorials'&&tab==='tutorials')?'page':undefined}
                      onClick={()=>select(section,m,id,tab?'tab='+tab:'')}>{label}</button>)}
                  </div>) : group.pages
                    .filter((p) => readerModule(section,p) === m)
                    .map((p) => (
                      <button key={p.id} aria-current={page.id === p.id ? 'page' : undefined}
                        onClick={() => select(section, m, p.id)}>{p.title}{section==='c'&&p.id==='home'&&<small className="rv-completion done">已完成</small>}</button>
                    ))}

                </div>
              )}
            </div>
          ))}
        </nav>

      </aside>
      <main className="rv-main">
        {!common && (
          <>
            <header className="rv-heading">
              <div>
                <small>
                  {group.name} / {module}
                </small>
                <h2>
                  {section==='c'&&page.id==='community'?'社区 · '+({works:'作品',talk:'交流',tutorials:'官方教程'}[activeTab]||'作品'):page.title}{' '}
                  {appSample && <small>{appReviewIds[page.id]}</small>}
                </h2>
              </div>
              <span className={'rv-completion '+handoffStatus(section,page.id,device).tone}>{handoffStatus(section,page.id,device).label}</span>
            </header>
            {(
              <div className="rv-workspace-tools">
                {section==='c'&&<nav aria-label="设备">
                  <button
                    aria-pressed={device === 'mobile'}
                    onClick={() => setDevice('mobile')}
                  >
                    移动端
                  </button>
                  <button
                    aria-pressed={device === 'pc'}
                    onClick={() => setDevice('pc')}
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
              <><div className="rv-notes-launch"><button onClick={()=>readMode('requirements')}>页面需求</button><button onClick={()=>readMode('flow')}>模块流程</button></div><div className="rv-controls">
                <div>
                  <button
                    aria-pressed={!flat && !multi && !common}
                    onClick={() => {
                      setFlat(false);setMulti(false);setInspected(null);setSelectedState('normal');
                      setCommon(false);
                    }}
                  >
                    正常页面
                  </button>
                  {hasBusinessStates && <button
                    aria-pressed={flat && !multi && !common}
                    onClick={() => {
                      setFlat(true);setMulti(false);setInspected({id:page.id,section,state:pageStates.find(s=>s!=='normal')||'normal'});
                      setCommon(false);
                    }}
                  >
                    业务状态（{pageStates.filter((s) => s !== 'normal').length}
                    ）
                  </button>}
                  <button aria-pressed={multi} onClick={()=>{setMulti(true);setFlat(false);setInspected(null);}}>模块页面（{pages.length}）</button>
                  {appSample && device === 'mobile' && !flat && !multi && (
                    <button
                      aria-pressed={annotations}
                      onClick={() => setAnnotations(!annotations)}
                    >
                      入口标注
                    </button>
                  )}
                </div>
              </div></>
            )}
          </>
        )}
        {common ? (
          <>
            <header className="rv-heading">
              <div>
                <small>C 端 / 通用规范</small>
                <h2>通用状态</h2>
              </div>
            </header>

            <nav className="rv-pages" aria-label="通用状态分类">
              {commonGroups.map((g) => (
                <button
                  key={g.id}
                  aria-pressed={commonGroup === g.id}
                  onClick={() => setCommonGroup(g.id)}
                >
                  {g.title}（{g.samples.length}）
                </button>
              ))}
            </nav>
            <div className="rv-flat mobile">
              {commonGroups
                .find((g) => g.id === commonGroup)!
                .samples.map((sample) => (
                  <section key={sample.id}>
                    <h3>{sample.title}</h3>
                    <p className="rv-sample-use">适用：{sample.applies}</p>
                    <iframe
                      loading="lazy"
                      title={`通用 ${sample.id}`}
                      src={sample.url}
                      sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"
                    />
                  </section>
                ))}
            </div>
          </>
        ) : reading === 'plan' ? (
          <ProductPlan section={section} page={page} device={device} onRead={readMode}/>
        ) : (<ReviewWorkspace mobile={section==='c'&&device==='mobile'} open={notesOpen} onClose={()=>setNotesOpen(false)} title={notePage.title+' · '+(stateLabels[noteState]||noteState)} tab={notesTab} onTab={setNotesTab} notes={noteContent}>
          {(multi||flat)?<div className={'rv-review-cards '+(section==='c'&&device==='mobile'?'mobile':'desktop')}>
            {(multi?pages.map(p=>({p,state:'normal'})):pageStates.filter(state=>state!=='normal').map(state=>({p:page,state}))).map(({p,state})=>{
              const cardUrl='/community-options/'+group.route+'?page='+p.id+'&device='+device+'&state='+state+'&embed=1';
              const active=inspected?.card?inspected.card===p.id+state:notePage.id===p.id&&noteState===state;
              return <section key={section+p.id+state+device} className={active?'selected':''}><button className="rv-card-select" aria-pressed={active} onClick={()=>inspect(p.id,state)}>{p.title} · {stateLabels[state]||state}</button><TrackedFrame title={p.title+' '+state} src={cardUrl} onNavigate={()=>{}} onActivate={(id,search,g)=>{if(id!==p.id||g!==section){setMulti(false);setFlat(false);setInspected(null);syncPage(id,search,g);setRestart(n=>n+1);}else inspect(id,new URLSearchParams(search).get('state')||'normal',g,p.id+state);}} /></section>;
            })}
          </div>: section === 'c' && device === 'pc' ? (
          <section className="rv-pc-preview">
            <label>预览比例 <select value={zoom} onChange={e=>setZoom(e.target.value)}><option value="fit">适应宽度</option><option value="1">100%</option></select></label>
            {(flat?pageStates.filter(s=>s!=='normal'):['normal']).map(s=><div key={String(restart)+s}><h3>{flat?(stateLabels[s]||s):''}</h3><div className={'rv-pc-scroll '+(zoom==='fit'?'fit':'')}><TrackedFrame key={String(restart)+s} onNavigate={flat?()=>{}:syncPage} title={`PC原型：${page.title} ${s}`} src={homeSample&&s==='normal'?'/community-options/home-prototype':url+'&device=pc&state='+s+(flat?'&embed=1':'')}/></div></div>)}
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
                    title={`${page.title} ${s}`}
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
              onClick={() => select(section, module, pages[index - 1].id)}
            >
              上一页
            </button>
            <span>
              {index + 1} / {pages.length} · {page.title}
            </span>
            {index < pages.length - 1 ? (
              <button
                onClick={() => select(section, module, pages[index + 1].id)}
              >
                下一页：{pages[index + 1].title}
              </button>
            ) : (
              <button
                disabled={modules.indexOf(module) === modules.length - 1}
                onClick={() => {
                  const m = modules[modules.indexOf(module) + 1],
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
