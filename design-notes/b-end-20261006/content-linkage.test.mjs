import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const load=(file,deps={},globals={})=>{const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>{if(!(name in deps))throw Error(name);return deps[name]},structuredClone,URLSearchParams,Date,...globals});return exports;};
let rows=[];const {mergeAdminWorks}=load('app/community-options/b-prototype/work-public-adapter.ts',{'./work-management':{readAdminWorks:()=>rows}});
const {publicWorkRows}=load('app/community-options/c-prototype/public-work-rows.ts');
const {mergeManagedContent}=load('app/community-options/b-prototype/content-consumer-adapter.ts');
const base={records:[]},fixture={id:'w',title:'published',author:'author',official:false,category:'摄影',status:'已公开',hot:true,created:'2026-10-01 10:00',publicAt:'2026-10-01 10:00',prompt:'public prompt',summary:'public summary',mediaType:'文本',textBody:'public text',images:[],logs:[]};
rows=[fixture];assert.equal(mergeAdminWorks(base).records[0].public.title,'published');
rows=[{...fixture,status:'待审核',title:'private edit',publicSnapshot:fixture}];let visible=mergeAdminWorks(base).records[0];assert.equal(visible.public.title,'published');assert.equal(visible.adminWork.publicSnapshot,undefined);
rows=[{...rows[0],status:'已拒绝'}];assert.equal(mergeAdminWorks(base).records[0].public.title,'published');
rows=[{...rows[0],status:'已下架'}];let hidden=mergeAdminWorks(base).records[0];assert.equal(hidden.public,null);assert.equal(hidden.adminWork,undefined);assert.equal(hidden.draft.title,'');
rows=[{...fixture,status:'待审核',title:'private first'}];assert.equal(mergeAdminWorks(base).records[0].public,null);
rows=[fixture,{...fixture,id:'new',title:'new',publicAt:'2026-10-06 10:00'}];let cards=publicWorkRows(mergeAdminWorks(base).records,[]);assert.equal(cards[0].id,'new');assert.equal(cards.length,2);
const draft={title:'old title',body:'old body',blocks:[],media:'/a.png|data:video/mp4;base64,AA',cover:'/a.png',refs:[],circle:'摄影创作'};
const item={id:'p',kind:'post',visibility:'已公开',review:'待审核',published:draft,draft:{...draft,title:'unapproved'},author:'author',revision:2};
let managed=mergeManagedContent(base,{records:[item]});assert.equal(managed.records[0].public.title,'old title');assert.equal(managed.records[0].public.body.length,3);assert.equal(managed.records[0].public.body[2].type,'视频');
managed=mergeManagedContent(base,{records:[{...item,visibility:'未公开',published:null}]});assert.equal(managed.records[0].public,null);
// Pure local-storage fixtures exercise the actual C submission adapter without browser injection.
const storage=new Map(),events=[];let content={records:[]},sequence=0;
const localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
const model={blankContentDraft:()=>({title:'',body:'',media:'',cover:'',category:'',circle:''}),contentTime:()=> '2026-10-06 12:00',readContentModel:()=>content,changeContentModel:fn=>fn(content),createContent:kind=>({id:'new',kind,draft:{},published:null,visibility:'未公开',review:'草稿',revision:0,logs:[],pinned:false})};
const adapter=load('app/community-options/c-prototype/c-submission-adapter.ts',{
 react:{useSyncExternalStore:()=> '[]'},'../b-prototype/content-model':model,
 '../b-prototype/work-management':{readAdminWorks:()=>JSON.parse(localStorage.getItem('ai666-work-admin-v3')||'[]')}
},{localStorage,window:{dispatchEvent:event=>events.push(event.type)},Event:class{constructor(type){this.type=type}},crypto:{randomUUID:()=>`submission-${++sequence}`}});
const workRows=()=>JSON.parse(localStorage.getItem('ai666-work-admin-v3')||'[]');
const journalRows=()=>JSON.parse(localStorage.getItem('ai666-c-submissions-v1')||'[]');
const reset=(works=[],posts=[])=>{storage.clear();content={records:structuredClone(posts)};localStorage.setItem('ai666-work-admin-v3',JSON.stringify(works));};
const submit=(id,kind='work',title='unapproved')=>adapter.submitCContent({contentId:id,kind,title,body:'private body',creationPrompt:'private prompt',workType:'text',media:[]},'demo author');
const publicWork=id=>{rows=workRows();return mergeAdminWorks(base).records.find(row=>row.id===id)?.public;};
// First submission is private and can be withdrawn; deletion removes both backend and journal.
reset();submit('first');assert.equal(workRows()[0].status,'待审核');assert.equal(publicWork('first'),null);
assert.throws(()=>adapter.changeCSubmissionState('first','restore'));assert.equal(publicWork('first'),null);
adapter.changeCSubmissionState('first','withdraw');assert.equal(workRows().length,0);assert.equal(journalRows()[0].status,'withdrawn');
submit('first');adapter.changeCSubmissionState('first','delete');assert.equal(workRows().length,0);assert.equal(journalRows().length,0);assert.equal(adapter.changeCSubmissionState('first','restore'),null);
// An edit/rejection retains the old approved snapshot; withdrawal returns to that version.
reset([fixture]);submit('w');assert.equal(publicWork('w').title,'published');
let rejected=workRows();rejected[0].status='已拒绝';localStorage.setItem('ai666-work-admin-v3',JSON.stringify(rejected));assert.equal(publicWork('w').title,'published');
adapter.changeCSubmissionState('w','withdraw');assert.equal(workRows()[0].title,'published');assert.equal(workRows()[0].status,'已公开');
// Down/up preserves the pending edit separately and clears hot on both current and public versions.
reset([fixture]);submit('w');adapter.changeCSubmissionState('w','remove');assert.equal(publicWork('w'),null);assert.equal(workRows()[0].hot,false);assert.equal(workRows()[0].publicSnapshot.hot,false);
adapter.changeCSubmissionState('w','restore');assert.equal(workRows()[0].status,'待审核');assert.equal(workRows()[0].title,'unapproved');assert.equal(publicWork('w').title,'published');assert.equal(publicWork('w').summary,'public summary');
assert.equal(workRows()[0].publicAt,fixture.publicAt);
// Resubmission while down must not republish either old or unapproved content.
adapter.changeCSubmissionState('w','remove');submit('w');assert.equal(workRows()[0].submittedWhileDown,true);assert.equal(publicWork('w'),null);
assert.throws(()=>adapter.changeCSubmissionState('w','restore'));assert.equal(publicWork('w'),null,'restore must not publish a down/resubmitted unreviewed work');
// Already approved work can be restored, with its first publication time retained.
reset([fixture]);localStorage.setItem('ai666-c-submissions-v1',JSON.stringify([{contentId:'w',kind:'work'}]));
adapter.changeCSubmissionState('w','remove');adapter.changeCSubmissionState('w','restore');assert.equal(publicWork('w').title,'published');assert.equal(workRows()[0].hot,false);assert.equal(workRows()[0].publicAt,fixture.publicAt);
// Post edits retain the approved body, clearing pin on down; restore never uses pending draft.
reset([], [{...item,pinned:true,logs:[],author:'demo author'}]);submit('p','post');assert.equal(content.records[0].draft.title,'unapproved');assert.equal(mergeManagedContent(base,content).records[0].public.title,'old title');
adapter.changeCSubmissionState('p','remove');assert.equal(content.records[0].pinned,false);assert.equal(mergeManagedContent(base,content).records[0].publicStatus,'下架');
adapter.changeCSubmissionState('p','restore');assert.equal(content.records[0].review,'待审核');assert.equal(mergeManagedContent(base,content).records[0].public.title,'old title');
adapter.changeCSubmissionState('p','withdraw');assert.equal(content.records[0].review,'草稿');assert.equal(content.records[0].submissionId,null);assert.equal(mergeManagedContent(base,content).records[0].public.title,'old title');
adapter.changeCSubmissionState('p','remove');submit('p','post');assert.equal(content.records[0].visibility,'已下架');assert.equal(mergeManagedContent(base,content).records[0].publicStatus,'下架');
adapter.changeCSubmissionState('p','delete');assert.equal(content.records.length,0);assert.equal(journalRows().length,0);assert.equal(adapter.changeCSubmissionState('p','restore'),null);
reset();submit('new-post','post');assert.equal(content.records[0].review,'待审核');assert.equal(mergeManagedContent(base,content).records[0].public,null);assert.throws(()=>adapter.changeCSubmissionState('new-post','restore'));assert.equal(content.records[0].visibility,'未公开');
adapter.changeCSubmissionState('new-post','withdraw');assert.equal(content.records[0].review,'草稿');assert.equal(mergeManagedContent(base,content).records[0].public,null);
assert.ok(events.includes('ai666-work-admin-change'));assert.ok(events.includes('cp-content-change'));
console.log('Content linkage state assertions passed (public snapshots and C submission lifecycle)');
