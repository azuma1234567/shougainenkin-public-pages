"use client";
/* 事務所ページのボタン3つ(docs/claude-code-sharoushi-list-2026-09-16-instructions.md §3-3)。
   無いものは出さない。3列グリッド、2つ以下なら等分。タップは事務所 id だけを送る(§5)。
   事務所サイトは掲載＝広告なので rel="noopener nofollow"。 */
import { trackMailTap, trackSiteClick, trackTelTap } from "@/lib/sharoushi-track";

export default function ProfileButtons({ officeId, tel, mail, url }: { officeId: string; tel: string; mail: string; url: string }) {
  const buttons = [
    tel ? <a key="tel" className="sr-btn sr-btn-tel" href={`tel:${tel}`} onClick={() => trackTelTap(officeId)}>電話する<small>{tel}</small></a> : null,
    mail ? <a key="mail" className="sr-btn" href={`mailto:${mail}`} onClick={() => trackMailTap(officeId)}>メールを送る<small>事務所のアドレスへ</small></a> : null,
    url ? <a key="url" className="sr-btn" href={url} target="_blank" rel="noopener nofollow" onClick={() => trackSiteClick(officeId)}>事務所サイト<small>外部サイトへ</small></a> : null,
  ].filter(Boolean);
  if (!buttons.length) return null;
  return <div className="sr-btns" data-count={buttons.length}>{buttons}</div>;
}
