import Link from '@/components/research-link';
import '@/components/market-social.css';
import '../briefs/briefs.css';
function Source({href,children}:{href:string;children:React.ReactNode}){return <a href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a>}
export default function Page(){return <main className="ms-report proposal-brief">
<p><Link href="/community-options/presentation#china">返回主讲 · 国内背景</Link></p>
<header><p>国内背景 / 依据与分析</p><h1>AI使用怎样连接到社区机会</h1><p>工作、学习、生活与创作都有实际使用。社区的选择依据，在于具体任务、已有帮助，以及用户愿意交流的理由。</p><p className="brief-meta">资料核读截至2026年9月20日；各项数据保留各自统计期。</p></header>
<nav className="brief-nav"><a href="#usage">人群与用途</a><a href="#supply">工具供给</a><a href="#tasks">实际任务</a><a href="#help">已有帮助</a><a href="#implications">方案含义</a></nav>
<section id="usage"><h2>近期资料覆盖了哪些使用</h2><div className="brief-options">
<article><h3>7月：效率办公应用</h3><p>QuestMobile于9月1日发布的报告列出：AI效率办公赛道合计月活1.02亿，同比增长8.2%；总使用次数同比增长112.4%。</p><p>“合计”的跨端去重方法未核清，保留赛道口径；使用次数反映应用使用，工作效率另需结果证据。</p><Source href="https://www.questmobile.cn/research/report/2094686886299705346/">报告原文</Source></article>
<article><h3>8月发布：青年使用用途</h3><p>PCG Lab调查的新华网报道涉及1000位1997—2009年出生者：工作提效64.3%、生活咨询62.0%、知识获取61.0%，信息搜索70.7%。</p><p>上述比例属于调查样本，各用途可重叠；完整抽样方法、调查期与问卷未取得。</p><Source href="https://www1.xinhuanet.com/tech/20260807/726e6ca7e2eb4c41b61cbf9c939a6626/c.html">调查报道</Source></article>
<article><h3>1月发布：工作与日常使用</h3><p>中国青年报、问卷网访问1334人，职场人士占82.4%。样本中内容生成58.5%、生活助手56.0%、学习辅助45.3%。</p><p>它补充用途范围。与8月调查的样本、问题不同，分别使用。</p><Source href="https://zqb.cyol.com/pc/content/202601/15/content_421198.html">原发布报道</Source></article>
<article><h3>全国使用基础</h3><p>CNNIC第57次报告：截至2025年12月，生成式AI用户6.02亿，普及率42.8%。这一历史基线涵盖多种用途。</p><p>持续创作者、需要交流的人以及新社区潜在人群，仍需按任务另行识别。</p><Source href="https://www.cnnic.cn/n4/2026/0205/c326-11542.html">CNNIC发布说明</Source></article></div></section>
<section id="supply"><h2>工具覆盖的制作环节更完整</h2><p>厂商资料已涉及参考素材、多镜头、音画与编辑能力。可灵2026年中期资料披露3.0系列第二季度上线原生4K输出；万相2.6发布说明包括参考生视频、多镜头叙事和音画同步。模型能力与具体产品的账号开放条件仍需分别核对。</p><p><Source href="https://ir.kuaishou.com/news-releases/news-release-details/kuaishou-technology-announces-second-quarter-and-interim-2026">可灵中期披露</Source> · <Source href="https://tongyi.aliyun.com/news?eId=pxwhvf%2Fsuodqg%2Fzb8ufi86steu3s9v&id=pxwhvf%2Fsuodqg%2Fqkhh70wdrlgwogs2">万相发布说明</Source></p><p>商品图已有套图、改字、清晰化和抠图等产品路径。选择还涉及保留商品细节、物料一致性和人工精修。社区可以解释这些取舍，并连接已有工具。</p><Source href="https://pc.meitu.com/product-kit">美图商品套图</Source></section>
<section id="tasks"><h2>任务决定结果标准</h2><div className="brief-options">
<article><h3>备课：材料与学科判断</h3><p>作者从直接生成教案，转向分析教材、课例与学情，再核实和写作。评论者有采用自述，课堂效果未见对照。</p><Source href="https://www.xiaohongshu.com/explore/6a1651900000000007012824">备课原帖</Source></article>
<article><h3>成绩表：准确与可交付</h3><p>作者称用豆包发现分数差异，也回答过生成文件偶尔打不开的问题。同一作者另称尝试制作PPT；这支持继续使用的自述，尚缺读者采用后的成果。</p><Source href="https://www.xiaohongshu.com/explore/697394930000000022020f2f">原帖与回复</Source></article>
<article><h3>面试：形成自己的回答</h3><p>作者自述从改简历、背稿，转向让AI追问自己的项目，发现准备盲区。准备过程与最终录用结果分别判断。</p><Source href="https://www.xiaohongshu.com/explore/6a7869240000000022030e4a">面试准备原帖</Source></article>
<article><h3>短片：表达与修改</h3><p>作者发布首次尝试的短片，认可评论指出的形态变化并希望修改。交流有具体对象，后续修订结果未见。</p><Source href="https://www.douyin.com/video/7654266723361282697">短片与评论</Source></article></div><p className="brief-meta">案例以作者自述为主，原始文件未独立复验。小红书记录年份未确认；短片未完整观看，仅采用已归档的作者与评论记录。这些案例不用于估算人群占比或月份趋势。</p></section>
<section id="help"><h2>已有帮助与主动交流</h2><article><h3>有组织的学习已经发生</h3><p>北京化工大学报道2026年5月教师整理课程材料、练习备课与出题并交流；浙江机电职业技术大学报道6月培训中的分组项目、课件评析与迭代。两者均为组织方报告，后续实际教学效果未核。</p><Source href="https://jiaowuchu.buct.edu.cn/2026/0615/c620a220671/pagem.htm">北京化工大学</Source> · <Source href="https://ztjywz.zime.edu.cn/info/1034/3279.htm">浙江机电职业技术大学</Source></article><article><h3>历史访谈：创作与同行交流</h3><p>麦橘访谈谈到表达与不同观点；StoryStorm发起人访谈谈到创作者发现、风格评审与合作。这两份旧访谈保留为创作者动机背景；当前方案是否能吸引作者及普通成员持续参与，仍需要近期直接记录。</p><Source href="https://www.uisdc.com/uisdc-interview-merjic">麦橘访谈 · 2024年</Source> · <Source href="https://www.kepuchina.cn/article/articleinfo?ar_id=639891&business_type=100&classify=0">StoryStorm访谈 · 2025年</Source></article></section>
<section id="implications"><h2>先比较额外价值，再配置能力</h2><p>已有成熟供给可以是基础配置或外部承接。社区能否增加选择依据、连续学习、作品讨论、方法维护或问题帮助，决定五套方案的重心。自建、防御性跟进与外部接入，应结合核心用户路径和业务依赖判断。</p><p>现有证据支持提出这些方案，用户选择新社区及供给者持续参与仍待验证。公开议题材料可说明讨论过什么；月份之间缺少可比采样，暂不呈现热度曲线。</p><Source href="/community-options#compare">五套方案比较与改选条件</Source></section>
</main>}
