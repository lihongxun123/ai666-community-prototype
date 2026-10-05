'use client';
import {useState} from 'react';
import {TransientFeedback,useFeedbackExpiry} from '../c-prototype/transient-feedback';
import './common-feedback.css';

function FailureSample(){const [done,setDone]=useState(false);return <div className="rf-example rf-centered"><strong>{done?'内容已加载':'暂时无法加载'}</strong><p>{done?'重试成功后恢复原内容。':'请检查网络后重试。'}</p><button onClick={()=>setDone(!done)}>{done?'重置示例':'重试'}</button></div>;}
function ValidationSample(){const [value,setValue]=useState(''),[submitted,setSubmitted]=useState(false);return <form className="rf-example" onSubmit={e=>{e.preventDefault();setSubmitted(true);}}><label>作品标题<input value={value} onChange={e=>{setValue(e.target.value);setSubmitted(false);}} aria-invalid={!value.trim()} aria-describedby="rf-title-error"/></label>{!value.trim()?<p id="rf-title-error" role="alert">请填写作品标题</p>:submitted?<TransientFeedback message="校验通过" onClear={()=>setSubmitted(false)}/>:null}<button type="submit">确认</button></form>;}
function ActionSample(){const [value,setValue]=useState('海边日落练习'),[done,setDone]=useState(false),[notice,setNotice]=useState('');return <div className="rf-example"><label>作品标题<input value={value} onChange={e=>{setValue(e.target.value);setDone(false);}}/></label><TransientFeedback message={notice} onClear={()=>setNotice('')}/>{!done&&<p role="alert">保存失败，已填写的内容已保留。</p>}<button onClick={()=>{setDone(!done);setNotice(done?'':'已保存')}}>{done?'重置示例':'重试保存'}</button></div>;}
function PendingSample(){const [checked,setChecked]=useState(false);return <div className="rf-example rf-centered"><strong>提交结果待确认</strong><p>{checked?'暂未查到最终结果，请稍后再次查询。':'尚未收到明确结果，请勿重复提交。'}</p><button onClick={()=>setChecked(true)}>查询结果</button><small role="status">{checked?'已查询原请求，未重新提交':''}</small></div>;}
function ToastSample(){const [message,setMessage]=useState('');return <div className="rf-example"><p>操作完成后短暂显示，不占正文位置。</p>{['已加入圈子','资料已保存','签到成功','操作未完成，请重试'].map(text=><button key={text} onClick={()=>setMessage(text)}>{text}</button>)}<TransientFeedback message={message} onClear={()=>setMessage('')}/></div>}
function CopySample(){const [copied,setCopied]=useState(false);useFeedbackExpiry(copied,()=>setCopied(false),2000);return <div className="rf-example rf-centered"><button onClick={()=>setCopied(true)}>{copied?'已复制':'演示复制反馈'}</button><p>反馈后恢复原按钮文字。</p></div>}
export function CommonFeedback(){return <div className="rf-board">
 <header><h2>通用反馈</h2><p>统一展示页面反馈、局部反馈与提交反馈。业务页复用对应组件，具体触发条件与文案由页面需求说明。</p></header>
 <section aria-labelledby="rf-page"><h3 id="rf-page">页面反馈</h3><div className="rf-grid">
  <article><h4>加载中</h4><div className="rf-example rf-skeleton" aria-label="列表加载骨架">{[1,2,3].map(i=><div key={i}><i/><span><b/><b/></span></div>)}</div><p>首次加载按页面结构显示骨架；加载更多仅在列表底部反馈，保留已有内容。</p></article>
  <article><h4>暂无内容</h4><div className="rf-example rf-centered"><strong>暂无内容</strong><p>发布后的作品会显示在这里。</p></div><p>首次无内容提供适用的创作或发现入口；筛选为空保留条件并允许清除，不统一使用同一按钮。</p></article>
  <article><h4>加载失败</h4><FailureSample/><p>合并断网、读取超时与服务暂不可用。重试只重新读取；续载失败在列表底部重试。</p></article>
  <article><h4>内容不可访问</h4><div className="rf-example rf-centered"><strong>内容暂不可访问</strong><p>内容可能已移除或当前不可查看。</p></div><p>适用于删除、下架、不存在或无查看权限。按可公开原因给出文案与返回入口，不泄露受限正文或内部原因。</p></article>
 </div></section>
 <section aria-labelledby="rf-local"><h3 id="rf-local">局部反馈</h3><div className="rf-grid">
  <article><h4>短暂轻提示</h4><ToastSample/><p>加入、退出、保存、签到、评论和绑定等操作完成后提示约 2.5 秒；不挤动内容、不拦截操作。弹层内触发时显示在弹层上方。相同提示显示期间不重复弹出；不同反馈替换当前提示，不堆叠。简单操作失败可短暂提示；需要处理的错误持续保留。</p></article><article><h4>按钮内反馈</h4><CopySample/><p>复制成功可在原按钮显示“已复制”，约 2 秒后恢复。与轻提示二选一，不重复反馈。</p></article><article><h4>表单校验</h4><ValidationSample/><p>必填、格式、字数和文件限制在字段附近说明，保留输入，不跳整页错误界面。</p></article>
  <article><h4>操作失败</h4><ActionSample/><p>保存失败保留输入；上传失败保留其他素材；关注失败恢复原关系；复制失败提供手动复制。反馈放在原操作附近。</p></article>
 </div></section>
 <section aria-labelledby="rf-submit"><h3 id="rf-submit">提交反馈</h3><div className="rf-grid"><article><h4>结果待确认</h4><PendingSample/><p>提交或兑换结果未知时查询原请求，不重复写入、不假定成功或退款。业务弹层复用这项规则，不增加重复状态页。</p></article></div></section>
 <footer>上传中、提交中、媒体异常与列表到底等在对应组件内体现；登录、账号绑定和电脑端继续由已有模块承载。编辑保护、权限及失败处理规则仍保留在各页面需求中。</footer>
 </div>;}
