// Fictional local examples. IDs and routes are shared by cards, search and details.
export type SamplePost = { id:string; title:string; author:string; date:string; summary:string; body:string[]; image:string; circle?:string; reference?:string; recommended?:boolean };
export const samplePosts:SamplePost[] = [
  {id:'restore',title:'给旧照片修复时，我先做了这三件事',author:'林间',date:'9月24日',summary:'先判断划痕的位置，再检查面部细节，最后留一份原图对照。',body:['我先确认破损主要集中在照片边缘，再逐处观察脸部和衣服的细节。原图会单独留存，方便最后比较。','这次最有用的是先写清楚想恢复什么：减少划痕、保留表情，而不是把照片变成另一张全新的肖像。'],image:'restore',circle:'影像练习圈',reference:'work?item=restore',recommended:true},
  {id:'light',title:'给玻璃瓶拍照，先处理背景还是光线？',author:'鹿与光',date:'9月22日',summary:'我试了两种背景，发现先固定光线方向更容易比较。',body:['同一个透明瓶放在浅色与深色背景前，边缘的清晰度差别很大。先固定侧光，再调整背景，能减少反复重拍。','这只是我的拍摄练习，欢迎分享你们处理玻璃反光的方法。'],image:'perfume',circle:'视觉创作圈',reference:'work?item=perfume',recommended:true},
  {id:'sea',title:'短片的第一个镜头，我留给了海面',author:'陈屿',date:'9月19日',summary:'先定下画面的节奏，再决定转场与音乐。',body:['我把镜头顺序写在纸上，先从一段平静的海面开始。','片段完成后，重新检查字幕与画面的节奏。'],image:'sea',recommended:true},
  {id:'question',title:'第一次做产品图，素材要怎么准备？',author:'周末观察',date:'9月17日',summary:'想从一张普通产品照片开始，先整理哪些信息比较好？',body:['我只有一张手机拍的产品照片，背景比较杂乱。想先尝试更清楚的商品展示图。','如果有入门经验，欢迎分享准备素材的顺序。'],image:'cup',circle:'视觉创作圈',recommended:false},
  {id:'image-window',title:'阴天拍人像，背景总显得太灰怎么办？',author:'温白',date:'9月25日',summary:'我试着让人物靠近窗边，先调亮脸部，再留住背景里的阴影。',body:['阴天的光很柔和，但这次背景总显得发灰。我让人物靠近窗边，先调整面部亮度，再观察衣服与背景的层次。','目前更喜欢保留一点阴影的版本。大家会怎么处理这种反差？'],image:'portrait',circle:'影像练习圈',recommended:true},
  {id:'image-crop',title:'一张照片的三个裁切版本，哪张更有故事感？',author:'小树影',date:'9月24日',summary:'同一张街景，分别保留人物、路口和远处的车。第三张留白最多。',body:['我把同一张街景裁成三个版本：一个紧跟人物，一个留下路口，一个把远处的车也纳入画面。','第三张留白最多，我觉得它更像一段尚未讲完的故事。你会留下哪张？'],image:'tram',circle:'影像练习圈',recommended:false},
  {id:'image-album',title:'把家里的老照片重新整理成一页相册',author:'阿璃',date:'9月23日',summary:'没有做复杂修饰，只把散落的照片按时间排好。',body:['这个周末把家里的老照片重新整理了一遍。没有做复杂修饰，只校正了方向，把散落的照片按时间排好。','翻到最后一张时，才发现过去总被忽略的背景细节也很珍贵。'],image:'girl',circle:'影像练习圈',recommended:false},
  {id:'visual-space',title:'让耳机产品图看起来更轻的一点小改动',author:'知一',date:'9月24日',summary:'保留大块留白后，主体的位置反而更明确了。',body:['最初我把耳机放得很满，画面看起来有些沉。后来收起了装饰，让产品周围多一些留白。','主体的位置反而更明确。做了两版摆放，想听听大家的感受。'],image:'headphones',circle:'视觉创作圈',recommended:false},
  {id:'writing-commute',title:'把通勤路上的一句话写成了短故事',author:'南风',date:'9月25日',summary:'“下一站，有人会记得你。”我从这句话开始写了一个很短的开头。',body:['早高峰时听到一句“下一站，有人会记得你”，我把它记在手机里。','回家后写成一个短故事的开头：主人公每天坐同一班车，却总在不同站台遇见同一个人。故事还没写完，想先留下这个片段。'],image:'writing',circle:'写作灵感圈',recommended:true},
  {id:'writing-sound',title:'写不下去的时候，我先记录一个声音',author:'书页',date:'9月24日',summary:'先把当时听见的雨声、脚步声和一句对话留下来。',body:['写不下去时，我会先记下一个具体的声音。这一次是雨停后巷子里的脚步声。','它不一定马上成为故事，但比空白页面更容易让我继续写下去。'],image:'writing',circle:'写作灵感圈',recommended:false},
  {id:'film-opening',title:'短片开头的十秒，我留给了海面',author:'陈屿',date:'9月25日',summary:'镜头先慢下来，音乐晚一点进。看完粗剪后，这个停顿很有必要。',body:['第一个版本里，音乐和字幕一起出现，开头显得太满。','我把前十秒留给海面，让镜头和环境声先建立节奏。看完粗剪后，这个停顿很有必要。'],image:'sea',circle:'短片实验圈',recommended:true},
  {id:'film-cut',title:'转场太多会不会打断观看？',author:'一帧',date:'9月24日',summary:'只保留两个转场，其余地方让动作自然接上。',body:['这周重剪一段短片，发现原来的转场几乎每个镜头都有。','我只保留了两个确实有叙事作用的转场，其余地方让动作自然接上。节奏变得更安静了。'],image:'underwater',circle:'短片实验圈',recommended:false},
  {id:'life-desk',title:'周末把书桌换到窗边，光线真的不一样',author:'木木',date:'9月24日',summary:'没有添新东西，只是换了摆放顺序。',body:['周末把书桌挪到窗边，没有添新东西，只换了摆放顺序。','下午四点的影子刚好落在桌面上，读书时会忍不住多看一眼。'],image:'interior',circle:'生活美学圈',recommended:true},
  {id:'life-colors',title:'一杯咖啡的颜色，成了这周的配色灵感',author:'鹿角',date:'9月23日',summary:'从杯子、桌布到窗外的树叶，记录容易错过的小变化。',body:['早上喝咖啡时，发现杯子的棕色和桌布的灰白色搭在一起很舒服。','又拍了窗外的树叶，想把这三个颜色用在下一张练习图里。'],image:'leaves',circle:'生活美学圈',recommended:false},
  {id:'character-expression',title:'这个角色的表情，我改了第四版',author:'圆圆',date:'9月25日',summary:'放松眉眼之后，人物终于有了想要的亲近感。',body:['前三版的眉眼都太紧，角色看起来比设定中严肃。','这次放松眉毛，稍微调整视线方向，人物终于有了我想要的亲近感。接下来准备试试不同的服装。'],image:'anime',circle:'角色创作圈',recommended:true},
  {id:'character-objects',title:'用三件日常物品写一份人物设定',author:'沐言',date:'9月24日',summary:'一支旧笔、一张车票、一只不肯丢掉的纸袋。',body:['我试着用三件随身物品写人物设定：一支旧笔、一张车票、一只不肯丢掉的纸袋。','它们分别指向角色的习惯、去过的地方和舍不得放下的事情。性格和经历慢慢就有了轮廓。'],image:'anime',circle:'角色创作圈',recommended:false},
];
export const sampleCircles=[
  {id:'image',name:'影像练习圈',description:'照片修复 · 构图讨论',cover:'restore'},
  {id:'visual',name:'视觉创作圈',description:'产品视觉 · 光线与配色',cover:'perfume'},
  {id:'writing',name:'写作灵感圈',description:'日常观察 · 短篇表达',cover:'writing'},
  {id:'film',name:'短片实验圈',description:'镜头语言 · 剪辑与声音',cover:'sea'},
  {id:'life',name:'生活美学圈',description:'空间器物 · 生活记录',cover:'interior'},
  {id:'character',name:'角色创作圈',description:'人物设定 · 故事画面',cover:'anime'},
];
export const postTarget=(id:string)=>'post?item='+id;
export const circleTarget=(id:string)=>'circle?item='+id;
