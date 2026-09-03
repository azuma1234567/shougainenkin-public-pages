"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CONTINUATION, MAIN_BACK, MAIN_FRONT } from "@/data/moushitatesho/layout";
import type { MoushitateshoState, Waku } from "@/data/moushitatesho/types";
import { loadMoushitatesho } from "@/lib/moushitatesho-storage";

type Format = "a4" | "a3";
const WINDOW_NAME_PREFIX = "moushitatesho:";
// 収まらないときに文字を縮める下限。役所へ出す書類なので、読めない大きさまでは縮めない。
// 8pt でも入らない欄は、縮めずに画面で知らせて、期間を分けて続紙へ送ってもらう。
const FIT_BASE_PT = 10, FIT_MIN_PT = 8;
export default function MoushitateshoPrint(){const router=useRouter();const [state,setState]=useState<MoushitateshoState|null>(null),[format,setFormat]=useState<Format>("a4"),[overflow,setOverflow]=useState(0);useEffect(()=>{let value:MoushitateshoState|null=null;if(window.name.startsWith(WINDOW_NAME_PREFIX)){try{value=JSON.parse(window.name.slice(WINDOW_NAME_PREFIX.length))}catch{value=null}}value=value??loadMoushitatesho();if(!value)router.replace("/dougu/moushitatesho");else setState(value)},[router]);if(!state)return <p>入力画面へ戻ります…</p>;const extras=state.waku.slice(5);const continuation=Array.from({length:Math.ceil(extras.length/5)},(_,i)=>extras.slice(i*5,i*5+5));return <div className={`mt-print mt-format-${format}`}><FitPrintText format={format} onMeasure={setOverflow}/>
  <section className="no-print mt-print-controls"><Link href="/dougu/moushitatesho">入力に戻る</Link><h1>印刷プレビュー</h1><fieldset><legend>用紙</legend><label><input type="radio" checked={format==="a4"} onChange={()=>setFormat("a4")}/>A4分割（家庭用プリンター）</label><label><input type="radio" checked={format==="a3"} onChange={()=>setFormat("a3")}/>A3原寸</label></fieldset><div className="mt-print-note"><p><strong>A3は倍率100%（等倍）</strong>にし、「用紙に合わせる」は選ばないでください。</p><p>A4分割で提出できるかは、提出前に年金事務所へご確認ください。</p><p>Chrome／Edgeは「その他の設定」、Safariは印刷設定で「ヘッダーとフッター」をオフにしてください。</p></div>{overflow>0&&<p className="mt-print-overflow"><strong>この用紙に収まらない欄が {overflow} か所あります。</strong>プレビューで赤い枠が付いた欄です。文字は{FIT_MIN_PT}ptまでしか小さくしません（それ以上は読めない書類になるため）。<Link href="/dougu/moushitatesho#kikan">期間を分けて続紙へ送る</Link>と収まります。</p>}<button className="mt-primary" onClick={()=>window.print()}>印刷画面を開く</button></section>
  <div className="mt-preview-stage">{format==="a3"?<><MainFront state={state}/><MainBack state={state}/></>:<><A4Half half="top"><MainFront state={state}/></A4Half><A4Half half="bottom"><MainFront state={state}/></A4Half><A4Half half="top"><MainBack state={state}/></A4Half><A4Half half="bottom"><MainBack state={state}/></A4Half></>}{continuation.map((rows,i)=><Continuation key={i} rows={rows} number={i+1}/>)}</div>
 </div>}
function FitPrintText({format,onMeasure}:{format:Format,onMeasure:(count:number)=>void}){useLayoutEffect(()=>{let live=true;(document.fonts?.ready??Promise.resolve()).then(()=>{if(!live)return;let over=0;document.querySelectorAll<HTMLElement>(".mt-paper-text").forEach(el=>{
  // 前回の縮小を戻してから測り直す。行間(1.45)は詰めない — 詰めると全欄の可読性が落ちる。
  el.style.fontSize="";delete el.dataset.autoFit;
  let size=FIT_BASE_PT;
  while(el.scrollHeight>el.clientHeight&&size>FIT_MIN_PT){size-=.5;el.style.fontSize=`${size}pt`;el.dataset.autoFit="true"}
  const rest=el.scrollHeight>el.clientHeight;el.dataset.overflow=String(rest);if(rest)over+=1;
});onMeasure(over)});return()=>{live=false}},[format,onMeasure]);return null}
function A4Half({half,children}:{half:"top"|"bottom",children:React.ReactNode}){return <div className={`mt-a4-half mt-half-${half}`}><div>{children}</div></div>}
function Box({box,children,className=""}:any){return <div className={`mt-paper-text ${className}`} style={{left:`${box.x}mm`,top:`${box.y}mm`,width:`${box.w}mm`,height:`${box.h}mm`}}>{children}</div>}
function MainFront({state}:{state:MoushitateshoState}){return <div className="mt-paper mt-a3" style={{backgroundImage:"url(/forms/moushitatesho/main-1.png)"}}><Box box={MAIN_FRONT.byoumei}>{state.byoumei}</Box><Box box={MAIN_FRONT.hatsubyou}>{dateJa(state.hatsubyou)}</Box><Box box={MAIN_FRONT.shoshin}>{dateJa(state.shoshin)}</Box>{state.waku.slice(0,5).map((w,i)=><WakuBoxes key={w.id} w={w} boxes={MAIN_FRONT.rows[i]}/>)}</div>}
function MainBack({state}:{state:MoushitateshoState}){return <div className="mt-paper mt-a3" style={{backgroundImage:"url(/forms/moushitatesho/main-2.png)"}}><Box box={MAIN_BACK.byoumei}>{state.byoumei}</Box><Box box={MAIN_BACK.sonota}>{state.sonota}</Box><Box box={MAIN_BACK.name}>{state.techouInfo.namae}</Box></div>}
function Continuation({rows,number}:{rows:Waku[],number:number}){return <div className="mt-paper mt-a4-cont" style={{backgroundImage:"url(/forms/moushitatesho/continuation-1.png)"}}><Box box={CONTINUATION.number}>{number}</Box>{rows.map((w,i)=><WakuBoxes key={w.id} w={w} boxes={CONTINUATION.rows[i]}/>)}</div>}
function WakuBoxes({w,boxes}:{w:Waku,boxes:any}){return <><Box box={boxes.meta} className="mt-paper-meta">{monthJa(w.from)}〜{monthJa(w.to)}<br/>{w.jushin?`受診した${w.kikan?`：${w.kikan}`:""}`:"受診していない"}</Box><Box box={boxes.text}>{w.text}</Box></>}
const dateJa=(s:string)=>s?`${s.slice(0,4)}年${Number(s.slice(5,7))}月${Number(s.slice(8,10))}日`:"";const monthJa=(s:string)=>s?`${s.slice(0,4)}年${Number(s.slice(5,7))}月`:"";
