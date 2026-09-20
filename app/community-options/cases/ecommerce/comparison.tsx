const test='https://www.sketchto.com/zh/posts/tutorials/ai-product-photography-prompts-background-test';
const repo='https://github.com/linbei0/EcomGen';
export default function Comparison(){return <>
<section id="comparison"><h2>同一输入，两种提示词：约束更长，结果未必更好</h2>
<p>SketchTo 团队在2026年9月9日公布两次换背景结果。输入是合成茶叶罐，每种提示词各运行一次。这组图适合比较检查方法，未涉及真实商家采用。</p>
<div className="ec-three">{[
['输入图','虚构茶叶罐，厨房背景','0d74b2f5294340168d77e8ba968b171057fff2f8f630d9f20109cdec65192bf6'],
['方案一','描述影棚背景，要求保留商品','c65264b61ba3db9fba04d37275d746b8f00e5b82ebff7791fd7078801ae5fb47'],
['方案二','增加前景锁定和逐字保留标签要求','7363a6e7b8ed0c9819ee688a3622768a3a3f6e3979c850fcd582ed5db125ded4']
].map(([title,caption,file])=><figure key={title}><a href={'https://assets.sketchto.com/posts/assets/'+file+'.png'} target="_blank" rel="noopener noreferrer"><img src={'https://assets.sketchto.com/posts/assets/'+file+'.png'} alt={title+'：'+caption} loading="lazy"/></a><figcaption><strong>{title}</strong> · {caption}</figcaption></figure>)}</div>
<p>作者称两版标签均可读；第二版背景更灰，未显示额外约束的优势。每版只有一张结果，无法据此判断哪种提示词更稳定。背景也未做像素测量。</p>
<p><strong>可借鉴：</strong>比较时同时保留输入与输出，说明实际改了什么，再按用途决定是否采用。把提示词变长本身不算改进。</p>
<a href={test} target="_blank" rel="noopener noreferrer">来源、提示词与完整披露 · SketchTo ↗</a>
</section>
<section id="workflow"><h2>开源工具怎样设计这条流程</h2>
<p>EcomGen 的公开项目说明已包含商品事实、参考素材、分镜确认、局部编辑和人工审核。下面是其描述的任务路径；本轮没有运行项目。</p>
<div className="ec-flow">商品事实与素材 → AI规划／手动／套图 → 确认分镜 → 生成与修改 → 审核导出</div>
<div className="ec-two"><div><h3>制作前，把要求写进项目</h3><p>明确真实商品、参考风格与禁止声明；允许手动选择模板，并在生成前修改分镜内容。</p><h3>制作后，保留修改空间</h3><p>项目说明支持蒙版、局部重绘、输出分支和编辑历史，审核后再导出。</p><p><a href={repo} target="_blank" rel="noopener noreferrer">EcomGen 项目说明 ↗</a> · <a href="https://linux.do/t/topic/2829843" target="_blank" rel="noopener noreferrer">作者介绍与使用反馈 ↗</a></p></div><figure><a href="https://cdn3.ldstatic.com/original/4X/0/5/b/05bd64866f81e3344043072fb1f940831f1ebf32.jpeg" target="_blank" rel="noopener noreferrer"><img src="https://cdn3.ldstatic.com/original/4X/0/5/b/05bd64866f81e3344043072fb1f940831f1ebf32.jpeg" alt="EcomGen作者发布的分镜确认界面" loading="lazy"/></a><figcaption>作者原帖截图 · 分镜确认界面。可点击查看大图。</figcaption></figure></div>
<p><strong>对我们的影响：</strong>任务分类、素材说明和修改历史已有开源设计参照，实际使用效果仍需验证。社区应把案例中的选择理由、失败位置和后续反馈组织好，并连接适用工具。是否自建制作工作台，留到方案取舍时讨论。</p>
</section>
<section id="decisions"><h2>下一次遇到商品图，先判断这三件事</h2><p>以下是基于本轮材料提出的内容组织建议，可用真实案例继续检验。</p>
<div className="ec-three ec-choice">
<article><h3>商品不能改什么？</h3><p>标签、孔位、配件、纹理分别列出。原图保留作对照，修改要求定位到具体区域。</p><b>内容呈现：原图＋局部放大＋修改理由</b></article>
<article><h3>这张图需要说明什么？</h3><p>先确认每张图的表达目标。饰品质感与功能演示需要不同结构，套图模板允许删改。</p><b>内容呈现：图序＋文案预览＋采纳理由</b></article>
<article><h3>换商品后还能复用什么？</h3><p>区分可以复用的版式与必须重新核对的商品信息，记录例外和失效版本。</p><b>内容呈现：适用条件＋重复结果＋异常处理</b></article>
</div><p>真实商品的同条件方法对照、连续修改及最终采用，仍缺一条可完整核对的记录。本轮补充了可见对照与成熟工作流，不把它们计作新增真实交付案例。</p>
</section>
</>}
