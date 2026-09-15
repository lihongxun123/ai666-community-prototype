import type { DataEssay } from './public-data-types';

export const publicDataInsights: DataEssay[] = [
  {
    title:"访问次数与单次浏览页数",
    paragraphs:[
      'Semrush 的2026年7月估计显示，LINUX DO 约有926万次访问，单次访问18.05页。',
      '网站访问深度无法区分作品观看、教程阅读、问题回应与画布生成；它只说明访问过程中发生了多少页面浏览。'
    ],
    refs:[


      {title:'Semrush：LINUX DO 7 月数据',url:'https://www.semrush.com/website/linux.do/overview/'}
    ]
  },
  {
    title:"连续月份的访问变化",
    paragraphs:[
      '同一组 Semrush 数据中，OpenArt 的 5—7 月访问估计依次为 2,018 万、1,490 万、1,536 万；7 月环比为 +3.13%，仍低于 5 月。Hugging Face 则为 4,137 万、3,949 万、4,629 万。两个产品最近一个月都增长，但各自在这三个月中的位置不同。',
      "访问变化尚不能归因于功能、模型或推广。评估活动时，还需实施前基线、自然任务周期和额外支持记录，避免将短期波动计为活动效果。"
    ],
    refs:[
      {title:'Semrush：OpenArt 5—7 月访问序列',url:'https://www.semrush.com/website/openart.ai/overview/'},
      {title:'Semrush：Hugging Face 5—7 月访问序列',url:'https://www.semrush.com/website/huggingface.co/overview/'}
    ]
  },
  {
    title:'不同供应商可能给出相反的涨跌判断',
    paragraphs:[

      'RunningHub.cn 的7月访问变化，Semrush 估计为下降4.95%，Similarweb 当时快照为增长3.9%；平均访问时长分别为22分47秒和7分15秒。',
      '这些差异会改变对增长和停留时间的判断，因此按提供方和月份分别展示。不同估计不取均值，也不视为平台内部实测值。'
    ],
    refs:[


      {title:'Semrush：RunningHub.cn',url:'https://www.semrush.com/website/runninghub.cn/overview/'},
      {title:'Similarweb：RunningHub.cn（页面按月更新）',url:'https://www.similarweb.com/website/runninghub.cn/'}
    ]
  },
  {
    title:'域名迁移会改变看到的流量走势',
    paragraphs:[
      "Similarweb 2026年8月显示，runwayml.com环比为-8.02%，runway.com为+329.6%。旧官网跳转新域，登录仍指向app.runwayml.com。域名用途变化影响流量比较，转移与新增访问尚无法拆分。",
      '可灵同时涉及 klingai.com 与 kling.ai，RunningHub 有 .cn 与 .ai。主域、子域和站间跳转的访问数可能重叠，不能相加作为独立用户总数。'
    ],
    refs:[
      {title:'Similarweb：runwayml.com',url:'https://www.similarweb.com/website/runwayml.com/'},
      {title:'Similarweb：runway.com',url:'https://www.similarweb.com/website/runway.com/'},
      {title:'Runway 当前官网与登录入口',url:'https://runway.com/'},
      {title:'Similarweb：重定向与域名历史的处理',url:'https://support.similarweb.com/hc/en-us/articles/5083358615313-Similarweb-Data-Methodology-FAQs'}
    ]
  },
  {
    title:"访问地区与样本寻找",
    paragraphs:[
      'Similarweb 2026 年 8 月的 SeaArt 桌面地区数据中，日本占 35.23%。Dify 主域的桌面中国访问占 52.6%，Cloud 子域为 26.93%；两者查询范围有重叠，不能当作两批互斥用户。只看主域汇总，可能看不到工作台访问的地区构成差异。',
      '访问地区不能说明用户的职业、预算、任务频率或作品是否商用，也不能据此确认用户使用的语言。'
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
      '上游网站只提供可能的发现入口，无法确认具体用户看过哪篇教程，也没有说明这些用户后来是否创作、付费或持续使用。'
    ],
    refs:[
      {title:'Semrush：RunningHub.cn 桌面来源',url:'https://www.semrush.com/website/runninghub.cn/overview/'},
      {title:'Similarweb：直接访问的定义',url:'https://support.similarweb.com/hc/en-us/articles/4770707469201-Direct-Traffic'}
    ]
  },
  {
    title:"流量之外的证据缺口",
    paragraphs:[
      '公开流量能说明访问形态、地区和上游入口，不能识别哪些人持续观看、交流、制作或付费。',
      '使用记录优先追到后续：同一公开账号是否继续制作，问题怎样处理，是否自述取消或续费，案例是否交代重试与人工投入。经营数字则核对原始披露、数据期、统计对象和计算方式；无法核实的部分继续留空。',
      "流量数据可用于选择研究对象和识别变化；付费率、收入归因、毛利和留存仍需经营及用户记录。"
    ],
    refs:[]
  }
];
