"use client";
import Link from "next/link";
import { useEffect,useLayoutEffect,useMemo,useRef,useState,type ReactNode } from "react";
import { DAILY_ITEMS,DAILY_LEVELS_GENZAI,DAILY_LEVELS_NINTEI,REASON_OTHER_INDEX,TECHOU_KINDS,WORK_REASONS_GENZAI,WORK_REASONS_NINTEI,emptyBack,emptyState,emptyTechou,newWaku,ninteibiFrom,today,type BackSide,type MoushitateshoState,type Techou,type Waku } from "@/data/moushitatesho/types";
import { clearMoushitatesho,loadMoushitatesho,normalize,saveMoushitatesho } from "@/lib/moushitatesho-storage";
import Capacity from "@/components/tools/MoushitateshoCapacity";
import { TEL_HINT,splitTel } from "@/lib/moushitatesho-tel";
import { CONT_FRONT,MAIN_BACK,MAIN_FRONT } from "@/data/moushitatesho/layout";

const SSR:MoushitateshoState={version:2,byoumei:"",hatsubyou:"",shoshin:"",ninteibi:"",waku:[],back:{nintei:emptyBack(),genzai:emptyBack()},sonota:"",techou:null,techouList:[],seikyuusha:{name:"",address:"",tel:""},moushitateDate:"",daihitsu:null,seikyuuType:null,fontPt:10.5,updatedAt:""};
const PLAIN=["ひとりでできる","だいたいできるが、ときどき助言や手助けがいる","助言や手助けがあればできる","助言や手助けがあっても、できない・しない"] as const;
const QUESTIONS=["着替えは、自分でできていますか","顔を洗ったり、身だしなみを整えたりできますか","トイレは、自分でできていますか","お風呂には、自分で入れていますか","食事は、自分で用意して食べられていますか","外へ出たり、散歩したりできていますか","料理は、自分でできていますか","洗濯は、自分でできていますか","掃除は、自分でできていますか","買い物は、自分でできていますか"] as const;
const month=(v:string)=>v? `${v.slice(0,4)}年${Number(v.slice(5,7))}月`:"時期未入力";
const monthNo=(v:string)=>v?Number(v.slice(0,4))*12+Number(v.slice(5,7)):NaN;
const updated=(v:string)=>{const d=new Date(v);return Number.isNaN(d.getTime())?"日付不明":`${d.getMonth()+1}月${d.getDate()}日`};

export default function MoushitateshoTool(){
 const [state,setState]=useState<MoushitateshoState>(SSR),[step,setStep]=useState(0),[period,setPeriod]=useState(0);
 const [hydrated,setHydrated]=useState(false),[hasDraft,setHasDraft]=useState(false),[started,setStarted]=useState(false),[noSave,setNoSave]=useState(false),[saveOk,setSaveOk]=useState(true),[confirmNew,setConfirmNew]=useState(false),[confirmDelete,setConfirmDelete]=useState(false);
 useEffect(()=>{const draft=loadMoushitatesho();setHasDraft(!!draft);setState(draft??emptyState());setHydrated(true)},[]);
 useEffect(()=>{if(!hydrated||!started||noSave)return;const timer=setTimeout(()=>setSaveOk(saveMoushitatesho({...state,moushitateDate:state.moushitateDate||today(),updatedAt:new Date().toISOString()})),500);return()=>clearTimeout(timer)},[hydrated,noSave,started,state]);
 const patch=(p:Partial<MoushitateshoState>)=>setState(s=>({...s,...p}));
 const setWaku=(id:string,p:Partial<Waku>)=>patch({waku:state.waku.map(w=>w.id===id?{...w,...p}:w)});
 const go=(n:number)=>{setStep(Math.max(0,Math.min(9,n)));window.scrollTo({top:0,behavior:"smooth"})};
 const begin=()=>{setState(emptyState());setHasDraft(false);setConfirmNew(false);setStarted(true);go(1)};
 const next=()=>{if(step===3&&period<state.waku.length-1){setPeriod(period+1);window.scrollTo({top:0});return}if(step===5&&state.seikyuuType!=="sokyuu"){go(7);return}go(step+1)};
 const back=()=>{if(step===3&&period>0){setPeriod(period-1);window.scrollTo({top:0});return}if(step===7&&state.seikyuuType!=="sokyuu"){go(5);return}go(step-1)};
 const exportJson=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="moushitatesho-data.json";a.click();URL.revokeObjectURL(a.href)};
 const importJson=(f:File)=>{const r=new FileReader();r.onload=()=>{const v=normalize(JSON.parse(String(r.result)||"null"));if(!v){alert("このファイルは読み込めませんでした");return}setState(v);setHasDraft(true)};r.readAsText(f)};
 const screen=step===0?<Intro hydrated={hydrated} hasDraft={hasDraft} updatedAt={state.updatedAt} confirmNew={confirmNew} setConfirmNew={setConfirmNew} onContinue={()=>{setStarted(true);go(1)}} onNew={()=>hasDraft?setConfirmNew(true):begin()} onConfirm={()=>{clearMoushitatesho();begin()}}/>:
 step===1?<When state={state} patch={patch}/>:step===2?<Periods state={state} setWaku={setWaku} patch={patch}/>:step===3?<Period state={state} index={period} setWaku={setWaku} patch={patch}/>:step===4?<Life title="いまの生活のことを教えてください" value={state.back.genzai} formal={DAILY_LEVELS_GENZAI} change={v=>patch({back:{...state.back,genzai:v}})} state={state} patch={patch} notebook/>:step===5?<Retro state={state} patch={patch}/>:step===6?<Life title={`初診日から1年6か月たった頃(${recognition(state.shoshin)}ごろ)の生活のこと`} value={state.back.nintei} formal={DAILY_LEVELS_NINTEI} change={v=>patch({back:{...state.back,nintei:v}})} state={state} patch={patch}/>:step===7?<Identity state={state} patch={patch}/>:step===8?<Seikyuusha state={state} patch={patch}/>:<Finish {...{state,noSave,setNoSave,exportJson,importJson,confirmDelete,setConfirmDelete}} onDelete={()=>{clearMoushitatesho();setState(emptyState());setHasDraft(false);setConfirmDelete(false)}}/>;
 return <div className="mt-tool mt-redesign">
  {step>0&&<header className="mt-flow-head"><div className="mt-progress-line" role="progressbar" aria-valuemin={1} aria-valuemax={10} aria-valuenow={step+1}><span style={{width:`${(step+1)/10*100}%`}}/></div><button className="mt-interrupt" onClick={()=>{alert("ここまでの内容は残っています。いつでも続きから始められます");window.location.href="/shinsei"}}>中断する</button></header>}
  <section className={`mt-panel${step===0?" mt-intro-panel":""}`}>{screen}</section>
  {step>0&&<><p className="mt-save-status" role="status">{noSave||!saveOk?"この端末では保存できません。閉じると消えます":"ここまでの内容は、この端末に残っています"}</p><footer className="mt-actions"><button onClick={back}>戻る</button>{step<9&&<button key={`${step}-${period}`} autoFocus className="mt-primary" onClick={next}>次へ</button>}</footer></>}
 </div>
}

function Intro(p:any){return <><h1>申立書を、自分で書きたい</h1><p className="mt-intro-lead">病歴・就労状況等申立書は、発病から今までを期間に分けて書く書類です。<br/>ここでは、期間の区切り方から、各期間の書き方まで、順番に進めます。<br/>書いた内容は公式の様式に重ねて印刷できます。手書きで出すつもりの方も、期間の整理だけ使えます。</p><p className="mt-reassurance"><span>30分から。何日かに分けて大丈夫</span><span>書いたものはこの端末に残ります</span><span>サーバーには送りません。AIも使いません</span></p>
 {p.hydrated&&p.hasDraft?<div className="mt-resume"><p>前回の続きがあります(最終保存 {updated(p.updatedAt)})。</p>{!p.confirmNew?<div><button className="mt-primary" onClick={p.onContinue}>続きから</button><button onClick={p.onNew}>新しく始める</button></div>:<div><p>前回の下書きは消えます。よろしいですか</p><button className="mt-primary" onClick={p.onConfirm}>消して始める</button><button onClick={()=>p.setConfirmNew(false)}>戻る</button></div>}</div>:<button className="mt-primary mt-start" onClick={p.onNew}>はじめる</button>}</>}

function When({state,patch}:any){return <><h2>まず、2つだけ教えてください。だいたいの月で構いません。</h2><div className="mt-fields"><Field label="この病気や症状が始まったのは、いつ頃ですか"><input type="month" value={state.hatsubyou.slice(0,7)} onChange={e=>patch({hatsubyou:e.target.value?`${e.target.value}-01`:""})}/></Field><Field label="その症状で、最初に病院に行ったのはいつ頃ですか"><input type="month" value={state.shoshin.slice(0,7)} onChange={e=>{const v=e.target.value?`${e.target.value}-01`:"";patch({shoshin:v,ninteibi:ninteibiFrom(v)})}}/></Field></div><p className="mt-calm">思い出せないときは空欄のままで進めます。あとで直せます。</p></>}

function Periods({state,setWaku,patch}:any){const notices=useMemo(()=>periodNotices(state),[state]);const sort=()=>patch({waku:[...state.waku].sort((a,b)=>a.from.localeCompare(b.from))});return <><h2>発病から今までを、いくつかの期間に分けます</h2><p className="mt-explanation">区切りは「病院が変わった」「通わなくなった」「働き方が変わった」「暮らしが変わった」ところです。<br/>1つの期間は3〜5年が目安。長くなったら分けてください。<br/>最初は大まかで大丈夫。あとから足したり分けたりできます。</p><aside className="mt-example">例: 2015年4月〜2017年3月　A病院に通院。会社勤め<br/>　　2017年4月〜2019年12月 通院を中断。退職して実家<br/>　　2020年1月〜現在　　　 B病院に通院。就労支援に通う</aside>{notices.map((n:string)=><p className="mt-notice" key={n}>{n}</p>)}<div className="mt-period-rows">{state.waku.map((w:Waku,i:number)=><div className="mt-period-row" key={w.id}><span>期間 {i+1}</span><input aria-label={`期間 ${i+1} 開始`} type="month" value={w.from} onChange={e=>setWaku(w.id,{from:e.target.value})}/><span>〜</span><input aria-label={`期間 ${i+1} 終了`} type="month" value={w.to} disabled={!w.to} onChange={e=>setWaku(w.id,{to:e.target.value})}/><label><input type="checkbox" checked={!w.to} onChange={e=>setWaku(w.id,{to:e.target.checked?"":new Date().toISOString().slice(0,7)})}/>現在</label>{state.waku.length>1&&<button onClick={()=>patch({waku:state.waku.filter((x:Waku)=>x.id!==w.id)})}>削除</button>}</div>)}</div>{state.waku.length>5&&<p className="mt-calm">6つ目からは続紙に載ります</p>}<div className="mt-period-buttons"><button onClick={()=>patch({waku:[...state.waku,newWaku()]})}>期間を追加する</button><button onClick={sort}>日付順に並べる</button></div></>}

const SEP="\n\n【仕事のこと】\n";
const split=(v:string)=>v.includes(SEP)?v.split(SEP,2):[v,""];
function Period({state,index,setWaku,patch}:any){const w:Waku=state.waku[index]??state.waku[0];if(!w)return null;const [care,work]=split(w.text),last=index===state.waku.length-1,setText=(a:string,b:string)=>setWaku(w.id,{text:b?`${a}${SEP}${b}`:a});return <><p className="mt-period-count">期間 {index+1} / {state.waku.length}</p><h2>{month(w.from)}〜{w.to?month(w.to):"現在"}のこと</h2><div className="mt-fields"><fieldset><legend>この期間、病院に行きましたか</legend><Choices options={["行った","行かなかった"]} selected={w.jushin?0:1} choose={i=>setWaku(w.id,{jushin:i===0,...(i?{kikan:""}:{})})}/></fieldset>{w.jushin&&<><Field label="病院の名前(分かる範囲で)"><input value={w.kikan} onChange={e=>setWaku(w.id,{kikan:e.target.value})}/></Field><Capacity slot={(index<5?MAIN_FRONT.rows[index]:CONT_FRONT.rows[0]).hospital} text={w.kikan} fontPt={state.fontPt}/></>}<Overflow label={w.jushin?"どんな治療・どんな様子だったか":"なぜ行かなかったか、その間どう過ごしていたか"} value={care} change={(v:string)=>setText(v,work)}/><fieldset><legend>この期間、働いていましたか</legend><Choices options={["働いていた","働いていなかった"]} selected={last?(state.back.genzai.work===true?0:state.back.genzai.work===false?1:-1):-1} choose={i=>last&&patch({back:{...state.back,genzai:{...state.back.genzai,work:i===0}}})}/></fieldset>{(!last||state.back.genzai.work===true)&&<Overflow label="仕事の内容と、つらかったこと・配慮してもらったこと" value={work} change={(v:string)=>setText(care,v)}/>}<Capacity slot={(index<5?MAIN_FRONT.rows[index]:CONT_FRONT.rows[0]).body} text={w.text} fontPt={state.fontPt} hint="期間を分けて続紙へ送るか、文字を小さめ(9pt)にすると収まります。"/></div><details className="mt-hint"><summary>書けないときは: いつ・どこで・何が・どれくらい、の順に短く</summary><p>いつ・どこで・何が・どれくらい、の順に短く書きます。</p></details></>}

function Retro({state,patch}:any){return <><h2>初診日から1年6か月たった頃の状態も、書きますか</h2><p className="mt-explanation">その頃の状態を書くと、その時点までさかのぼって請求できる場合があります(認定日請求)。<br/>その頃の診断書も必要になります。分からなければ「あとで決める」で進めます。</p><div className="mt-big-choices"><button className={state.seikyuuType==="sokyuu"?"is-selected":""} onClick={()=>patch({seikyuuType:"sokyuu"})}>書く</button><button className={state.seikyuuType==="jigojuushou"?"is-selected":""} onClick={()=>patch({seikyuuType:"jigojuushou"})}>書かない(いまの状態だけで請求する)</button><button className={state.seikyuuType===null?"is-selected":""} onClick={()=>patch({seikyuuType:null})}>あとで決める</button></div>{state.seikyuuType!=="jigojuushou"&&<div className="mt-fields mt-ninteibi"><Field label="障害認定日(初診日から1年6か月たった日。ちがう日なら直してください)"><input type="date" value={state.ninteibi} onChange={e=>patch({ninteibi:e.target.value})}/></Field><p className="mt-calm">様式の「1．障害認定日（　年　月　日）頃」に入ります。</p></div>}</>}

function Work({value,change,side,fontPt,reasons}:{value:BackSide,change:(v:BackSide)=>void,side:0|1,fontPt:number,reasons:readonly string[]}){
 /* 様式の順番どおり(指示書 §1)。work は様式に無い。UI の分岐だけに使い、紙には出さない。 */
 const set=(p:Partial<BackSide>)=>change({...value,...p});
 const num=(v:string)=>v.replace(/[^0-9]/g,"").slice(0,2);
 const when=side===0?"障害認定日":"請求日";
 const past=side===0;
 return <fieldset className="mt-work"><legend>{past?"その頃、働いていましたか":"いま、働いていますか"}</legend>
  <Choices options={past?["働いていた","働いていなかった"]:["働いている","働いていない"]} selected={value.work===true?0:value.work===false?1:-1} choose={i=>set({work:i===0})}/>
  {value.work===true&&<div className="mt-work-fields">
   <Field label="職種(仕事の内容)"><input value={value.job} onChange={e=>set({job:e.target.value})}/></Field>
   <Capacity slot={MAIN_BACK.sections[side].job} text={value.job} fontPt={fontPt}/>
   <Field label="通勤方法"><input value={value.commuteMethod} onChange={e=>set({commuteMethod:e.target.value})}/></Field>
   <Capacity slot={MAIN_BACK.sections[side].commuteMethod} text={value.commuteMethod} fontPt={fontPt}/>
   <fieldset className="mt-inline-nums"><legend>通勤時間(片道)</legend>
    <label><input inputMode="numeric" value={value.commuteHours} onChange={e=>set({commuteHours:num(e.target.value)})}/><span>時間</span></label>
    <label><input inputMode="numeric" value={value.commuteMinutes} onChange={e=>set({commuteMinutes:num(e.target.value)})}/><span>分</span></label>
   </fieldset>
   <fieldset className="mt-inline-nums"><legend>出勤日数</legend>
    <label><input inputMode="numeric" value={value.daysPrev} onChange={e=>set({daysPrev:num(e.target.value)})}/><span>{when}の前月</span></label>
    <label><input inputMode="numeric" value={value.daysPrevPrev} onChange={e=>set({daysPrevPrev:num(e.target.value)})}/><span>{when}の前々月</span></label>
   </fieldset>
   <Field label={past?"仕事中や仕事が終わった時の身体の調子はどうでしたか":"仕事中や仕事が終わった時の身体の調子はどうですか"}><textarea rows={3} value={value.cond} onChange={e=>set({cond:e.target.value})}/></Field>
   <Capacity slot={MAIN_BACK.sections[side].cond} text={value.cond} fontPt={fontPt}/>
  </div>}
  {value.work===false&&<div className="mt-work-fields">
   <fieldset><legend>{past?"働いていなかった理由(あてはまるものすべて)":"働いていない理由(あてはまるものすべて)"}</legend>
    {reasons.map((r,i)=><label key={r} className="mt-check"><input type="checkbox" checked={value.reasons.includes(i)} onChange={()=>set({reasons:value.reasons.includes(i)?value.reasons.filter(x=>x!==i):[...value.reasons,i].sort()})}/>{r}</label>)}
   </fieldset>
   {value.reasons.includes(REASON_OTHER_INDEX)&&<><Field label="その理由"><input value={value.reasonsOther} onChange={e=>set({reasonsOther:e.target.value})}/></Field>
    <Capacity slot={MAIN_BACK.sections[side].reasonOther} text={value.reasonsOther} fontPt={fontPt}/></>}
  </div>}
 </fieldset>}

function Life({title,value,formal,change,state,patch,notebook=false}:{title:string,value:BackSide,formal:readonly string[],change:(v:BackSide)=>void,state:MoushitateshoState,patch:(p:Partial<MoushitateshoState>)=>void,notebook?:boolean}){return <><h2>{title}</h2>
 <Work value={value} change={change} side={notebook?1:0} fontPt={state.fontPt} reasons={notebook?WORK_REASONS_GENZAI:WORK_REASONS_NINTEI}/>
 <div className="mt-life">{DAILY_ITEMS.map((item,i)=><fieldset key={item}><legend>{QUESTIONS[i]}</legend><small>{item}</small><div>{PLAIN.map((plain,j)=><label key={plain}><input type="radio" name={`daily-${notebook?"now":"then"}-${i}`} checked={value.daily[i]===j+1} onChange={()=>change({...value,daily:{...value.daily,[i]:(j+1) as 1|2|3|4}})}/><span><strong>{plain}</strong><small>{formal[j]}</small></span></label>)}</div></fieldset>)}</div>{notebook&&<fieldset className="mt-notebook"><legend>障害者手帳を持っていますか</legend><Choices options={["持っている","持っていない","申請中"]} selected={state.techou==="ari"?0:state.techou==="nashi"?1:state.techou==="shinsei"?2:-1} choose={i=>patch({techou:["ari","nashi","shinsei"][i] as any,techouList:i===0&&state.techouList.length===0?[emptyTechou()]:state.techouList})}/>{state.techou==="ari"&&<TechouFields state={state} patch={patch}/>}</fieldset>}</>}

function Identity({state,patch}:any){return <><h2>最後に、様式の頭に入るものを</h2><div className="mt-fields"><Field label="病名(診断書に書かれている名前)"><input value={state.byoumei} onChange={e=>patch({byoumei:e.target.value})}/></Field><Capacity slot={MAIN_FRONT.byoumei} text={state.byoumei} fontPt={state.fontPt}/></div><p className="mt-calm">分からない欄は空欄のままで印刷して、手書きできます。</p></>}

function Finish(p:any){const ref=useRef<HTMLAnchorElement>(null);useLayoutEffect(()=>{ref.current?.focus()},[]);return <><h2>印刷</h2><p className="mt-intro-lead">入力した内容を、公式様式の位置に重ねて印刷します。空欄はそのまま手書きできます。</p><Link ref={ref} className="mt-print-link" href="/dougu/moushitatesho/insatsu" onClick={()=>{try{window.name=`moushitatesho:${JSON.stringify(p.state)}`}catch{}}}>印刷プレビューを開く</Link><section className="mt-cross" aria-labelledby="mt-next"><h2 id="mt-next">ここからできること</h2><div className="dougu-cross"><Link className="dougu-band-card" href="/dougu/madoguchi"><b>→ どこに出せばいい？</b><span>管轄の年金事務所と、予約のしかた</span></Link><Link className="dougu-band-card" href="/dougu/shorui"><b>→ 何をそろえればいい？</b><span>自分の場合に要る書類だけを一覧に</span></Link></div></section><details className="mt-storage"><summary>保存について</summary><div><button onClick={p.exportJson}>下書きをファイルに書き出す(別の端末に持っていく)</button><label className="mt-file">ファイルから読み込む<input type="file" accept="application/json" onChange={e=>e.target.files?.[0]&&p.importJson(e.target.files[0])}/></label><label className="mt-check"><input type="checkbox" checked={p.noSave} onChange={e=>p.setNoSave(e.target.checked)}/>共用のパソコンなので、この端末に残さない</label>{!p.confirmDelete?<button onClick={()=>p.setConfirmDelete(true)}>この端末の下書きを消す → 確認</button>:<span><button onClick={p.onDelete}>消す</button><button onClick={()=>p.setConfirmDelete(false)}>戻る</button></span>}</div></details></>}

function TechouFields({state,patch}:{state:MoushitateshoState,patch:(p:Partial<MoushitateshoState>)=>void}){
 const list=state.techouList.length?state.techouList:[emptyTechou()];
 const set=(i:number,p:Partial<Techou>)=>patch({techouList:list.map((t,k)=>k===i?{...t,...p}:t)});
 return <div className="mt-techou">{list.map((t,i)=><fieldset key={i}><legend>{i===0?"1冊目":"2冊目"}</legend>
  <Choices options={TECHOU_KINDS.map(k=>k.label)} selected={TECHOU_KINDS.findIndex(k=>k.key===t.shurui)} choose={k=>set(i,{shurui:TECHOU_KINDS[k].key})}/>
  {t.shurui==="ta"&&<><Field label="手帳の名前"><input value={t.taName} onChange={e=>set(i,{taName:e.target.value})}/></Field>
   <Capacity slot={MAIN_BACK.techou[i].otherName} text={t.taName} fontPt={state.fontPt}/></>}
  <Field label="交付日"><input type="date" value={t.kofu} onChange={e=>set(i,{kofu:e.target.value})}/></Field>
  <Field label="級"><input inputMode="numeric" value={t.tokyu} onChange={e=>set(i,{tokyu:e.target.value.replace(/[^0-9]/g,"").slice(0,1)})}/></Field>
  <Field label="障害名"><input value={t.shougaimei} onChange={e=>set(i,{shougaimei:e.target.value})}/></Field>
  <Capacity slot={MAIN_BACK.techou[i].shougaimei} text={t.shougaimei} fontPt={state.fontPt}/>
 </fieldset>)}
 {list.length<2&&<button type="button" className="mt-add" onClick={()=>patch({techouList:[...list,emptyTechou()]})}>2冊目を足す</button>}
 </div>}

function Seikyuusha({state,patch}:{state:MoushitateshoState,patch:(p:Partial<MoushitateshoState>)=>void}){
 const S=state.seikyuusha, D=state.daihitsu, B=MAIN_BACK.moushitate;
 const setS=(p:Partial<typeof S>)=>patch({seikyuusha:{...S,...p}});
 const setD=(p:Partial<NonNullable<typeof D>>)=>patch({daihitsu:{...(D??{name:"",zokugara:"",tel:""}),...p}});
 const telNg=(v:string)=>{const r=splitTel(v);return !r.ok&&r.reason==="needsHyphen"};
 return <><h2>最後に、請求者のことを</h2>
  <p className="mt-explanation">様式の下に「上記のとおり相違ないことを申し立てます」の欄があります。記載要領は、請求者の現住所・氏名・電話番号を書くように案内しています。</p>
  <div className="mt-fields">
   <Field label="氏名"><input value={S.name} onChange={e=>setS({name:e.target.value})}/></Field>
   <Capacity slot={B.name} text={S.name} fontPt={state.fontPt}/>
   <Field label="現住所"><input value={S.address} onChange={e=>setS({address:e.target.value})}/></Field>
   <Capacity slot={B.address} text={S.address} fontPt={state.fontPt}/>
   <Field label="電話番号"><input inputMode="tel" placeholder="090-1234-5678" value={S.tel} onChange={e=>setS({tel:e.target.value})}/></Field>
   {telNg(S.tel)&&<p className="mt-capacity">{TEL_HINT}</p>}
   <Field label="申立日"><input type="date" value={state.moushitateDate} onChange={e=>patch({moushitateDate:e.target.value})}/></Field>
  </div>
  <fieldset className="mt-daihitsu"><legend>本人以外が書いた場合</legend>
   <label className="mt-check"><input type="checkbox" checked={!!D} onChange={e=>patch({daihitsu:e.target.checked?{name:"",zokugara:"",tel:""}:null})}/>本人以外が書いた(代筆)</label>
   {D&&<div className="mt-fields">
    <Field label="代筆者の氏名"><input value={D.name} onChange={e=>setD({name:e.target.value})}/></Field>
    <Capacity slot={B.daihitsuName} text={D.name} fontPt={state.fontPt}/>
    <Field label="請求者からみた続柄"><input value={D.zokugara} onChange={e=>setD({zokugara:e.target.value})}/></Field>
    <Capacity slot={B.daihitsuZokugara} text={D.zokugara} fontPt={state.fontPt}/>
    <Field label="代筆者の電話番号"><input inputMode="tel" placeholder="090-1234-5678" value={D.tel} onChange={e=>setD({tel:e.target.value})}/></Field>
    {telNg(D.tel)&&<p className="mt-capacity">{TEL_HINT}</p>}
   </div>}
  </fieldset></>}

function Choices({options,selected,choose}:{options:string[],selected:number,choose:(i:number)=>void}){return <div className="mt-inline-choices">{options.map((x,i)=><label key={x}><input type="radio" checked={selected===i} onChange={()=>choose(i)}/>{x}</label>)}</div>}
function Overflow({label,value,change}:{label:string,value:string,change:(v:string)=>void}){return <Field label={label}><textarea rows={6} value={value} onChange={e=>change(e.target.value)}/></Field>}
function periodNotices(s:MoushitateshoState){const n:string[]=[];s.waku.forEach((w,i)=>{if(monthNo(w.to)-monthNo(w.from)+1>60)n.push(`期間 ${i+1}: この期間は5年を超えています。分けると書きやすくなります`);if(s.hatsubyou&&w.from&&w.from<s.hatsubyou.slice(0,7))n.push(`期間 ${i+1}: 発病より前から始まっています。だいたいの月で構いません`);if(!w.from)n.push(`期間 ${i+1}: 開始の月は空欄のままでも進めます`)});return n}
function recognition(v:string){if(!v)return"時期未入力";const d=new Date(`${v.slice(0,7)}-01T00:00:00`);d.setMonth(d.getMonth()+18);return`${d.getFullYear()}年${d.getMonth()+1}月`}
function Field({label,children}:{label:string,children:ReactNode}){return <label className="mt-field"><span>{label}</span>{children}</label>}
