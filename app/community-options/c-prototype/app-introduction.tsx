'use client';
export const appSummaries:Record<string,string>={
 copy:'把已有文字改得更清楚，适合发布和分享。',
 background:'为产品图片更换背景，尝试不同的展示场景。',
 video:'用产品素材制作一段展示短片。',
 'repair-color':'调整照片的色彩，让肤色和画面更自然。',
 restore:'改善旧照片中的划痕、模糊和褪色。'
};
export function AppIntroduction({input,output,provider,conditions}:{input:string;output:string;provider:string;conditions?:string}){
 const condition=conditions?.trim();
 const defaultConditions=['使用 MakeNow 前请核对目标页说明与账号条件。','准备需要改写的原文。生成前确认本次积分。'];
 return <div className="app-introduction">
  <div className="app-introduction-grid">
   <section><h3>准备什么</h3><p>{input||'查看应用说明中的材料要求。'}</p></section>
   <section><h3>得到什么</h3><p>{output||'查看应用说明中的结果形式。'}</p></section>
  </div>
  {condition&&!defaultConditions.includes(condition)&&<p className="app-introduction-condition">{condition}</p>}
  <p className="app-introduction-platform">在 MakeNow 使用，费用、进度和结果在该平台查看。</p>
  {provider&&<p className="app-introduction-provider">由 {provider} 提供</p>}
 </div>;
}
