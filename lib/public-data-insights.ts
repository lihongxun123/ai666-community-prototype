import type { DataEssay } from './public-data-types';

export const publicDataInsights: DataEssay[] = [
  {
    title:'网站规模与单次访问深度，给出的顺序不同',
    paragraphs:[
      'Semrush 2026 年 7 月估计：Civitai 为 1,283 万次访问、每次 5.34 页；Midjourney 为 1,109 万次、每次 15.89 页；LINUX DO 为 926 万次、每次 18.05 页。前者在这三个域名中访问次数更多，后两者每次访问的页数更多。数字揭示的是不同使用形态，不能把其中任何一项单独作为社区成功标准。',
      '对多元拾光，应同时记录进入案例的人数、开始运行的人数、成果被采用的人数，以及下一次真实任务的独立复用。论坛翻页、作品浏览与画布生成分别计量，才能看清内容和工具各自提供了什么。'
    ],
    refs:[
      {title:'Semrush：Civitai 7 月数据',url:'https://www.semrush.com/website/civitai.com/overview/'},
      {title:'Semrush：Midjourney 7 月数据',url:'https://www.semrush.com/website/midjourney.com/overview/'},
      {title:'Semrush：LINUX DO 7 月数据',url:'https://www.semrush.com/website/linux.do/overview/'}
    ]
  },
  {
    title:'单月回升需要放回连续月份',
    paragraphs:[
      '同一组 Semrush 数据中，OpenArt 的 5—7 月访问估计依次为 2,018 万、1,490 万、1,536 万；7 月环比为 +3.13%，仍低于 5 月。Hugging Face 则为 4,137 万、3,949 万、4,629 万。两个产品最近一个月都增长，但各自在这三个月中的位置不同。',
      '这还不足以解释变化来自哪些功能、模型发布或推广活动。四人团队研究一个案例或活动时，也要记录实施前的基线、自然任务周期和活动期间的额外支持；仅比较活动前后两个总访问量，容易把短期波动当作方法有效。'
    ],
    refs:[
      {title:'Semrush：OpenArt 5—7 月访问序列',url:'https://www.semrush.com/website/openart.ai/overview/'},
      {title:'Semrush：Hugging Face 5—7 月访问序列',url:'https://www.semrush.com/website/huggingface.co/overview/'}
    ]
  },
  {
    title:'不同供应商可能给出相反的涨跌判断',
    paragraphs:[
      'NightCafe 的 2026 年 7 月，Semrush 给出访问环比 +5.41%，Similarweb 的 7 月公开页为 -2.6%。RunningHub.cn 的 Semrush 7 月页为 -4.95%、平均 22:47；首次读取的 Similarweb 7 月旧公开快照为 +3.9%、7:15，随后该网址更新为 8 月。历史快照与新月份已分开保留。',
      '这些差异足以改变“正在增长”或“用户停留很久”的判断。本报告按提供方和月份展示，既不取均值，也不把其中一个估计当作平台实际账本。对于多元拾光的留存目标，最终需要自己的任务记录和用户回访来定，而不能照抄第三方时长。'
    ],
    refs:[
      {title:'Semrush：NightCafe',url:'https://www.semrush.com/website/nightcafe.studio/overview/'},
      {title:'Similarweb：NightCafe',url:'https://www.similarweb.com/website/nightcafe.studio/'},
      {title:'Semrush：RunningHub.cn',url:'https://www.semrush.com/website/runninghub.cn/overview/'},
      {title:'Similarweb：RunningHub.cn（页面按月更新）',url:'https://www.similarweb.com/website/runninghub.cn/'}
    ]
  },
  {
    title:'域名迁移会改变看到的流量走势',
    paragraphs:[
      'Similarweb 2026 年 8 月，runwayml.com 的环比为 -8.02%，runway.com 为 +329.6%。本轮打开旧官网会到新域，登录入口仍指向 app.runwayml.com。这里存在域名职责变化；还无法量化有多少访问转移、多少是真实新增。',
      '可灵也同时涉及 klingai.com 与 kling.ai，RunningHub 有 .cn 与 .ai。多元拾光与 MakeNow 同样需要区分社区入口、工具工作台和 API 调用，再通过自己的账号或任务记录去重。主域、子域和站间跳转相加，容易把一次任务统计成多份规模。'
    ],
    refs:[
      {title:'Similarweb：runwayml.com',url:'https://www.similarweb.com/website/runwayml.com/'},
      {title:'Similarweb：runway.com',url:'https://www.similarweb.com/website/runway.com/'},
      {title:'Runway 当前官网与登录入口',url:'https://runway.com/'},
      {title:'Similarweb：重定向与域名历史的处理',url:'https://support.similarweb.com/hc/en-us/articles/5083358615313-Similarweb-Data-Methodology-FAQs'}
    ]
  },
  {
    title:'地区与人口属性，适合帮助招募而非确定客户',
    paragraphs:[
      'Similarweb 2026 年 8 月的 SeaArt 桌面地区数据中，日本占 35.23%。Dify 主域的桌面中国访问占 52.6%，Cloud 子域为 26.93%；两者查询范围有重叠，不能当作两批互斥用户。只看主域汇总，可能看不到工作台访问的地区构成差异。',
      '这些数据可以帮助决定访谈使用什么语言、怎样安排时间、去哪类内容中寻找作者。年龄、性别、地区还不能回答职业、预算、任务频率和作品是否商用。当前团队应优先按能交付的任务筛人，避免因某一地区份额较高就同时投入多语种运营。'
    ],
    refs:[
      {title:'Similarweb：SeaArt 受众',url:'https://www.similarweb.com/website/seaart.ai/'},
      {title:'Similarweb：Dify 主域',url:'https://www.similarweb.com/website/dify.ai/'},
      {title:'Similarweb：Dify Cloud 子域',url:'https://www.similarweb.com/website/cloud.dify.ai/'}
    ]
  },
  {
    title:'上游网站提供了更具体的作者寻找线索',
    paragraphs:[
      'RunningHub.cn 的 Semrush 7 月桌面来路中，Bilibili 占 1.45%，YouTube 占 1.31%；Direct 占 85.94%。这些数据说明可见的教程与视频平台入口值得追查，但不能证明来自教程的人更愿意付费，也不能把直接访问等同于老用户。',
      '可执行的招募假设是：运营先在相关教程中寻找持续展示输入、参数修改、失败处理和最终文件的作者；产品再核实其最近交付和下一次任务。作者合作购买的是可以交接的方法与维护，种子使用者则需要带来自己的素材和真实用途。该通路的招募转化率仍待验证。'
    ],
    refs:[
      {title:'Semrush：RunningHub.cn 桌面来源',url:'https://www.semrush.com/website/runninghub.cn/overview/'},
      {title:'Similarweb：直接访问的定义',url:'https://support.similarweb.com/hc/en-us/articles/4770707469201-Direct-Traffic'}
    ]
  },
  {
    title:'这一轮数据对团队选择的影响',
    paragraphs:[
      '值得保留的方向是把案例、答疑与现有工具的真实使用接在一起。公开数据已经提供了候选平台的访问形态和作者入口，但尚未证明商品内容、连载创作或 API 开发三类人中，哪一类最适合当前 MakeNow。因此上一轮的分组访谈仍是必要验证。',
      '投入前补齐四条记录：使用者上一次怎样完成任务；下一次何时发生；采用结果需要多少重试与人工帮助；正常价格下由谁付款。访谈完成后只选一类安排作者案例与小规模试用，再用实际采用、独立复用、自己付费和成员帮助四项事实复盘。',
      '公开流量网站最适合帮助缩小候选范围、发现值得追问的变化。付费率、收入归因、毛利与用户留存仍有明确缺口；本轮没有以更多小数位来替代这些缺失的经营数据。'
    ],
    refs:[]
  }
];
