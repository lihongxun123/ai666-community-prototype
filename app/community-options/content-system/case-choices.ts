export const caseChoices:Record<string,{alternatives:string;reason:string;result:string}> = {
  "ecommerce": {
    "alternatives": "直接换背景 / 分层保留商品后调整背景",
    "reason": "包装文字是重要保留项，本例先保留商品主体，再处理场景。",
    "result": "主图、场景图和详情图；并排保留原图核对"
  },
  "local-business": {
    "alternatives": "分别制作每张物料 / 先确认活动信息再延展",
    "reason": "日期和条件会变，本例以同一信息表组织多种物料。",
    "result": "同一活动的海报、菜单及手机宣传图"
  },
  "knowledge": {
    "alternatives": "先生成图再补解释 / 从出处组织图文",
    "reason": "解释依赖来源，本例先确定说法及图解目的，再安排图注。",
    "result": "解释正文、图解、图注与对应来源"
  },
  "character": {
    "alternatives": "逐张独立生成 / 先固定角色与分镜",
    "reason": "连续阅读需要识别同一角色，本例先确定固定特征再逐格制作。",
    "result": "设定页、连续画面及待修正的问题格"
  },
  "portrait": {
    "alternatives": "整张重绘 / 保留原片并局部调整",
    "reason": "本人特征与修改意愿优先，本例限制改动区域并保留对照。",
    "result": "原片、局部调整与组照；由有权授权者决定公开范围"
  },
  "design": {
    "alternatives": "逐尺寸重新设计 / 从主版调整层级",
    "reason": "系列需要一致性，本例保留核心元素，按画幅重新安排阅读顺序。",
    "result": "主视觉与多尺寸版式，附字体素材条件"
  },
  "writing": {
    "alternatives": "整篇自由改写 / 按作者目标定向编辑",
    "reason": "原意与语气需要保留，本例按句段展示建议和理由，由作者取舍。",
    "result": "原稿、修改建议和作者选择位置"
  },
  "work-learning": {
    "alternatives": "把全部资料放进页面 / 按听众问题组织提纲",
    "reason": "讲解需要主次，本例先定要回答的问题，再选择材料。",
    "result": "材料清单、提纲、讲解页及来源定位"
  },
  "ip": {
    "alternatives": "直接批量延展 / 先定规范并试复杂动作",
    "reason": "辨识点容易随姿态变化，本例先试复杂动作再延展表情。",
    "result": "形象规范、表情动作与数字应用"
  }
};
