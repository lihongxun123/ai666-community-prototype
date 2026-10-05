/* oxlint-disable next/no-img-element -- Existing local prototype media. */
'use client';
import {useEffect,useRef,useState} from 'react';
import {prototypeStore as store} from './storage';
import {samplePosts,sampleCircles,postTarget,circleTarget} from './content-data';
import {useB} from '../b-prototype/store';
import {useFeatured} from './featured';
import './community-landing.css';
import {communityTab} from './community-navigation';
import {ActionBar} from './content-actions';
import {WorkFeed} from './work-feed';
import {contentCategories,mobileContentCategories,normalizeContentCategory,sampleWorkCategories} from './content-categories';
type Go=(target:string)=>void;
const pic=(id:string)=>'/home-prototype/'+id+'.png';
const Icon=({name}:{name:string})=><img className="cl-icon" src={'/home-prototype/icons/'+name+'-line.svg'} alt=""/>;
export const communityTutorials=[
{"id":"repair-color","title":"照片修复：如何检查肤色与明暗","cover":"portrait","topic":"影像处理","views":28,"sections":[["准备对照","保存原图与修复版本，以相同缩放比例对比。"],["检查细节","依次检查明暗、纹理和边缘，只修改不符合目标的部分。"],["确认结果","保存本轮结果与参数，避免覆盖原始素材。"]]},
{"id":"repair-texture","title":"人像修复：保留纹理的检查步骤","cover":"restore","topic":"影像处理","views":28,"sections":[["准备对照","保存原图与修复版本，以相同缩放比例对比。"],["检查细节","依次检查明暗、纹理和边缘，只修改不符合目标的部分。"],["确认结果","保存本轮结果与参数，避免覆盖原始素材。"]]},
{"id":"repair-background","title":"照片修复：处理背景与人物边缘","cover":"interior","topic":"影像处理","views":28,"sections":[["准备对照","保存原图与修复版本，以相同缩放比例对比。"],["检查细节","依次检查明暗、纹理和边缘，只修改不符合目标的部分。"],["确认结果","保存本轮结果与参数，避免覆盖原始素材。"]]},
 {id:'context',title:'多轮对话越改越偏？发一段“当前版本说明”把任务拉回来',cover:'interior',topic:'文字创作',views:66,sections:[['整理当前版本','把已经确认的目标、保留内容和本轮要修改的部分写清楚，避免把旧意见和新要求混在一起。'],['发起下一轮修改','将当前稿件与本轮要求一起提供，明确只修改哪些部分。'],['检查结果','对照本轮要求检查输出；不符合的部分具体指出，再继续调整。']]},
 {id:'format',title:'AI 总是不按格式交付？把格式要求写成一份“输出合同”',cover:'writing',topic:'文字创作',views:26,sections:[['明确交付格式','列出必须包含的字段、顺序和长度，准备一段简短示例。'],['检查第一份结果','先检查一份结果是否遵守格式，再继续处理同类内容。']]},
 {id:'facts',title:'长资料交给 AI 后总会漏重点？先做“事实清单”，再让它压缩',cover:'interior',topic:'文字创作',views:13,sections:[['提取事实','先列出关键结论、数字、限制和来源位置，不急着写摘要。'],['核对再压缩','核对清单后再生成摘要，保留影响结论的重要条件。']]},
 {id:'variable',title:'AI 生图总像抽卡？用单变量测试找到稳定结果',cover:'cup',topic:'影像处理',views:26,sections:[['保留对照','先保存一张基准结果及其生成条件。'],['一次只改一个条件','固定其他条件，只改变光线、构图或提示词中的一个因素，对比效果。']]},
 {id:'restore',title:'旧照片修复：从判断破损到复查',cover:'restore',topic:'影像处理',views:32,sections:[]},
 {id:'product',title:'产品背景与光线的搭配',cover:'perfume',topic:'视觉设计',views:20,sections:[]},
];
const workCategories=mobileContentCategories;
const desktopCategories=contentCategories;
const works=[
 {id:'girl',title:'夏日的转角',author:'周与斯',type:'图片',likes:24},
 {id:'anime',title:'风从蓝色花间经过',author:'Tide',type:'图片',likes:18},
 {id:'sea',title:'日落之前',author:'陈屿',type:'视频',likes:32},
 {id:'letter',title:'写给夏天的一封信',author:'林间',type:'文字',likes:12},
 {id:'cat',title:'西瓜味的夏天',author:'小鹿',type:'图片',likes:28},
 {id:'interior',title:'在海边住一下午',author:'林间',type:'图片',likes:16},
 {id:'perfume',title:'一瓶夏日晴光',author:'鹿与光',type:'图片',likes:21},
 {id:'underwater',title:'沉入一场蓝色的梦',author:'拾光',type:'图片',likes:36},
 {id:'portrait',title:'把阳光留在眼睛里',author:'夏目川',type:'图片',likes:22},
 {id:'restore',title:'旧照修复练习',author:'林间',type:'图片',likes:8},
];
export function CommunityLanding({state,go,initialTab,desktop=false}:{state:string;go:Go;initialTab?:string;desktop?:boolean}){
 const db=useB(),featured=useFeatured();
 const categoriesRef=useRef<HTMLElement>(null);

 const [tab]=useState(desktop?initialTab||'works':initialTab||communityTab(typeof window==='undefined'?'':location.search));
 const [category,setCategory]=useState(store.getItem(desktop?'cl-pc-work-category':'cl-work-category')||'全部');
 const [filter,setFilter]=useState(store.getItem('cl-work-type')||'全部');
 const [topic,setTopic]=useState(store.getItem('cl-topic')||'全部');
 const [circle,setCircle]=useState(store.getItem('cl-circle')||'全部');
 const [sort,setSort]=useState(desktop?(store.getItem('cp-community-sort')||'推荐'):'最新');
 const [menu,setMenu]=useState(false),[recovered,setRecovered]=useState(false),[more,setMore]=useState(false);
 const key=tab+':'+(tab==='works'?filter+':'+category:tab==='talk'?circle+':'+sort:topic);
 useEffect(()=>{const y=Number(store.getItem('cl-scroll:'+key)||0);requestAnimationFrame(()=>window.scrollTo(0,y));},[key]);
 useEffect(()=>{if(!menu)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[menu]);
 useEffect(()=>{if(desktop||tab!=='works')return;const nav=categoriesRef.current;const selected=nav?.querySelector<HTMLElement>('[aria-pressed=true]');if(nav&&selected){const left=selected.offsetLeft-nav.offsetLeft;nav.scrollTo({left:Math.max(0,left-(nav.clientWidth-selected.offsetWidth)/2),behavior:'smooth'});}},[category,desktop,tab]);
 const chooseCategory=(value:string)=>{setCategory(value);store.setItem(desktop?'cl-pc-work-category':'cl-work-category',value);setMenu(false)};
 const open=(target:string)=>{store.setItem('cl-tab',tab);store.setItem('cl-scroll:'+key,String(window.scrollY));go(target)};
 const choose=(value:string)=>{if(tab==='works'){setFilter(value);store.setItem('cl-work-type',value)}else{setTopic(value);store.setItem('cl-topic',value)}setMenu(false)};
 const visible=(kind:string,id:string)=>(!db.records.find(r=>r.id===kind+'-'+(id==='restore'?'1':id))||db.records.find(r=>r.id===kind+'-'+(id==='restore'?'1':id))?.publicStatus==='公开');
 let closed:string[]=[];try{closed=(JSON.parse(store.getItem('bp-op-circles')||'[]') as {id:string;status:string}[]).filter(c=>c.status==='已关闭').map(c=>c.id.replace('ci-',''));}catch{/* retain local examples */}
 const circles=sampleCircles.filter(c=>!closed.includes(c.id));
 const postRows=samplePosts.filter(p=>visible('post',p.id)&&(circle==='全部'||p.circle===circle)&&(sort==='最新'||(p.recommended&&(p.id!=='restore'||(!featured||featured.posts.includes('post-1')))&& (p.id!=='restore'||db.records.find(r=>r.id==='post-1')?.recommended)))).sort((a,b)=>sort==='最新'?(Number(b.date.split('月')[0])*100+Number(b.date.split('月')[1].replace('日','')))-(Number(a.date.split('月')[0])*100+Number(a.date.split('月')[1].replace('日',''))):0);
 const workRows=works.map(w=>{const r=db.records.find(r=>r.id==='work-'+(w.id==='restore'?'1':w.id));return r?.public?{...w,title:r.public.title,author:r.public.author}:w}).filter(w=>(desktop||filter==='全部'||w.type===filter)&&(category==='全部'||sampleWorkCategories[w.id]===normalizeContentCategory(category))&&visible('work',w.id));
 const tutorialRows=communityTutorials.map(t=>{const r=db.records.find(r=>r.id==='tutorial-'+(t.id==='restore'?'1':t.id));return r?.public?{...t,title:r.public.title}:t}).filter(t=>(topic==='全部'||t.topic===topic)&&visible('tutorial',t.id));
 const empty=state==='empty'&&!recovered||(tab==='works'?workRows:tab==='talk'?postRows:tutorialRows).length===0;
 const publish=()=>{store.removeItem('cp-circle');store.setItem('cp-post-kind','post');if(store.getItem('cp-auth')!=='1'){store.setItem('cp-return','post-publish');open('login')}else open('post-publish')};
 return <section className="cl-community" aria-label={desktop?(tab==='works'?'AIGC作品':tab==='talk'?'交流':'教程'):'社区内容'}>
  <div className="cl-secondary-row">
   <nav ref={categoriesRef} className="cl-secondary-options" aria-label={tab==='works'?'作品分类':tab==='talk'?'圈子选择':'教程分类'}>
    {(tab==='works'?(desktop?desktopCategories:workCategories):tab==='talk'?['全部',...circles.map(c=>c.name)]:['全部','文字创作','影像处理','视觉设计','视频创作']).map(value=><button key={value} aria-pressed={(tab==='works'?category:tab==='talk'?circle:topic)===value} onClick={()=>{if(tab==='works'){chooseCategory(value)}else if(tab==='talk'){setCircle(value);store.setItem('cl-circle',value)}else choose(value)}}>{value}</button>)}
   </nav>
   {tab==='works'&&!desktop&&<div className="cl-filter"><button className="cl-filter-trigger" aria-label="筛选作品" aria-expanded={menu} onClick={()=>setMenu(!menu)}><Icon name="filter-3"/>{filter!=='全部'&&<span>{filter}</span>}</button>{menu&&<><button className="cl-menu-dismiss" aria-label="关闭筛选" onClick={()=>setMenu(false)}/><div className="cl-filter-menu"><fieldset aria-label="内容类型"><legend>内容类型</legend><div className="cl-filter-options">{['全部','图片','视频','文字'].map(t=><button key={t} aria-pressed={filter===t} onClick={()=>choose(t)}>{t}</button>)}</div></fieldset><fieldset aria-label="作品分类"><legend>作品分类</legend><div className="cl-filter-options">{workCategories.map(value=><button key={value} aria-pressed={category===value} onClick={()=>chooseCategory(value)}>{value}</button>)}</div></fieldset></div></>}</div>}
   {tab==='talk'&&<button className="cl-find-circle" onClick={()=>open('circles')}>找圈子<Icon name="arrow-right-s"/></button>}
  </div>
  {tab==='talk'&&desktop&&<div className="cl-talk-actions">{desktop&&['推荐','最新'].map(s=><button key={s} aria-pressed={sort===s} onClick={()=>{setSort(s);store.setItem('cp-community-sort',s)}}>{s}</button>)}<button className="cl-compose" aria-label="发布帖子" onClick={publish}><Icon name="edit"/>发帖</button></div>}
  {state==='loading'?<div className="cl-loading" aria-label="正在加载">{[0,1,2,3].map(i=><div key={i}/>)}</div>:state==='error'&&!recovered?<div className="cl-empty"><h2>暂时加载失败</h2><button onClick={()=>setRecovered(true)}>重试</button></div>:empty?<div className="cl-empty"><h2>暂无{tab==='works'?'作品':tab==='talk'?'帖子':'教程'}</h2><button onClick={()=>{setRecovered(true);choose('全部');setCategory('全部');store.setItem('cl-work-category','全部');setCircle('全部');store.setItem('cl-circle','全部')}}>查看全部</button></div>:tab==='works'?<WorkFeed items={workRows.map(w=>({...w,target:'work?item='+w.id+(w.id==='letter'?'&state=text':'')}))} go={open}/>:tab==='talk'?<div className="cl-posts">{postRows.map(p=><article className="cl-post" key={p.id}><button className="cl-author" aria-label={'查看作者：'+p.author} onClick={()=>open('author?name='+encodeURIComponent(p.author))}><img src={pic(p.author==='林间'?'portrait':'girl')} alt=""/><span><strong>{p.author}</strong><small>{p.date}</small></span></button><button className="cl-post-copy" onClick={()=>open(postTarget(p.id))}><p>{p.title}</p><span>{p.summary}</span></button><button className="cl-post-media" onClick={()=>open(postTarget(p.id))} aria-label={'查看帖子：'+p.title}><img src={pic(p.image)} alt={p.title}/></button>{p.reference&&(visible('work',new URLSearchParams(p.reference.split('?')[1]).get('item')||'restore')?<button className="cl-reference" onClick={()=>open(p.reference!)}><img src={pic(p.image)} alt=""/><span><small>关联作品</small>{p.id==='restore'?'旧照修复练习':'一瓶夏日晴光'}</span><Icon name="arrow-right-s"/></button>:<p className="cl-reference">关联作品暂不可访问</p>)}{p.circle&&<div className="cl-post-context"><button className="cl-circle-label" onClick={()=>open(circleTarget(sampleCircles.find(c=>c.name===p.circle)?.id||'image'))}>{p.circle}</button></div>}<ActionBar kind="post" target={postTarget(p.id)} title={p.title} go={open} onComment={()=>open(postTarget(p.id)+'&discussion=1')}/></article>)}</div>:<div className="cl-tutorial-list">{tutorialRows.map(t=><button className="cl-tutorial" key={t.id} onClick={()=>open('tutorial?item='+t.id)}><img className="cl-tutorial-cover" src={pic(t.cover)} alt=""/><span><strong>{t.title}</strong><small><em>{t.topic}</em> · {t.views} 次浏览</small></span><Icon name="arrow-right-s"/></button>)}</div>}
  {state==='more-error'&&!more&&!empty&&<div className="cl-empty"><p>后续内容加载失败</p><button onClick={()=>setMore(true)}>重试加载</button></div>}
 </section>;
}
