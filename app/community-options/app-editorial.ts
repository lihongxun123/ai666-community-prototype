/** Optional editorial content. Layout is owned by the shared frontend template. */
export type AppCase = {
  style: 'media' | 'comparison'; title: string; summary: string; illustrative: boolean;
  items: {id:string;title:string;image:string;text:string;panel?:number}[];
};
export type AppEditorial = {appCase?:AppCase;topicRefs?:string[]};
export const emptyAppCase=():AppCase=>({style:'media',title:'',summary:'',illustrative:false,items:[]});
export function appCaseErrors(value?:AppCase):string[]{
 if(!value)return [];
 const errors:string[]=[];
 if(!value.title.trim())errors.push('请填写案例标题');
 if(value.title.length>60||value.summary.length>300)errors.push('案例标题最多60字，简介最多300字');
 if(value.style==='comparison'&&value.items.length!==2)errors.push('前后对照需要两项内容');
 if(value.style==='media'&&(value.items.length<1||value.items.length>4))errors.push('图片组需要1至4张图片');
 if(value.items.some(x=>!x.title.trim()||(value.style==='media'?!x.image:!x.text.trim())))errors.push(value.style==='media'?'请补齐每张图片及名称':'请补齐对照标题及正文');
 return errors;
}
export const editorialSeeds = [
 {key:'selling',title:'商品卖点梳理',summary:'把商品特点整理成面向消费者的表达。',input:'商品资料、目标人群、使用场景',output:'卖点结构与文案初稿',entry:'',cover:'/home-prototype/writing.png',case:{style:'comparison',title:'从商品参数，到清楚的卖点表达',summary:'区分可核实的事实与需要验证的描述。',illustrative:true,items:[{id:'source',title:'商品资料',image:'',text:'便携随行杯。容量350mL，可拆卸杯盖。适合通勤携带。'},{id:'result',title:'表达方向',image:'',text:'通勤携带：350mL容量，方便安排日常饮水。\n清洁维护：杯盖可拆卸，清洁更直接。\n\n发布前核对容量与材质信息，不加入未经验证的保温或防漏承诺。'}]},body:'## 如何开始\n\n1. **整理事实**：提供可核实的商品资料。\n2. **明确人群**：说明目标用户和使用场景。\n3. **复核表达**：删除没有依据的承诺。',tutorial:'从商品资料提炼有依据的卖点'},
 {key:'suite',title:'电商套图',summary:'同一款商品，做出统一风格的上新套图。',input:'商品原图、核心卖点、目标平台',output:'主图、场景图与细节图',entry:'https://www.makenow.tv/tools/workspace/ecom-suite',cover:'/app-editorial/perfume.png',case:{style:'media',title:'从一张商品图，到一组上新素材',summary:'同一款商品，通过统一的风格与构图，表达商品、场景与细节。',illustrative:true,items:['商品原图','场景主图','细节展示'].map((title,i)=>({id:'image-'+i,title,image:'/app-editorial/perfume.png',text:'',panel:i}))},body:'## 如何开始\n\n1. **准备商品图**：整理清晰的商品图，确保主体完整。\n2. **选择版式与风格**：在 MakeNow 中确认场景与画幅。\n3. **检查文字与商品细节**：核对形态、标识与细节，再选择导出。',tutorial:'同一款商品，如何统一三张图的视觉风格'},
 {key:'weekly',title:'周报总结',summary:'把工作记录整理成成果、风险与下周计划。',input:'本周记录、关键进展、汇报对象',output:'可编辑的周报初稿',entry:'',cover:'/home-prototype/writing.png',case:{style:'comparison',title:'把零散记录，整理成一份清楚的周报',summary:'从日常记录中提取进展、依赖和下一步安排。',illustrative:true,items:[{id:'before',title:'原始记录',image:'',text:'完成首页改版评审\n修复两处移动端布局问题\n接口联调等待确认\n整理应用案例素材\n下周开始联调验收'},{id:'after',title:'整理后的周报',image:'',text:'本周成果\n完成首页改版评审，明确后续排期。\n修复移动端布局问题，整理应用案例素材。\n\n风险与依赖\n接口联调仍待对方确认，需持续跟进。\n\n下周计划\n启动联调验收，根据结果安排后续工作。'}]},body:'## 如何开始\n\n1. **整理工作记录**：提供本周工作内容与明确进展。\n2. **说明汇报对象**：告知阅读者与希望强调的重点。\n3. **核对事实与遗漏**：确认数据、责任归属与计划，避免遗漏。',tutorial:'如何让周报突出成果，而不是罗列事项'},
 {key:'storyboard',title:'分镜一致性质检',summary:'检查角色、场景和镜头连续性，找出需要复核的细节。',input:'连续分镜、角色设定、场景基准',output:'检查建议与待修正位置',entry:'',cover:'/app-editorial/storyboard.png',case:{style:'media',title:'连续镜头里，哪些细节发生了变化？',summary:'对比连续镜头，检查角色、场景与道具的一致性。',illustrative:true,items:['镜头01 · 街道建立','镜头02 · 进入咖啡店','镜头03 · 咖啡店内'].map((title,i)=>({id:'shot-'+i,title,image:'/app-editorial/storyboard.png',text:'',panel:i}))},body:'## 检查发现\n\n|位置|发现|建议|\n|---|---|---|\n|镜头02|雨伞由红色变为蓝色|统一道具描述|\n|镜头01—03|人物服装与场景衔接|复核角色与场景基准|\n\n## 如何开始\n\n1. **准备分镜与基准**：整理连续镜头和角色设定。\n2. **在项目中使用技能**：在 MakeNow 中提交或选择相关内容。\n3. **人工复核并调整**：结合原始设定检查建议，再修改素材。',tutorial:'怎样建立角色与道具的一致性基准'},
] as const;
