"use client";

import { useEffect, useRef } from "react";
import { ABOUT_INTRO_CHAPTERS, ABOUT_INTRO_DURATION_LABEL, ABOUT_INTRO_DURATION_SECONDS } from "@/data/about-intro";

/* /about の自己紹介動画と、その目次(docs/about-video-2026-09-18-instructions.md §2)。
   目次を押すとその時間へ飛ぶので、<video> はこの部品が持つ(ページ側はサーバー部品で ref を渡せないため)。
   サーバーで描くので、JavaScript が無くても動画は再生でき、目次の文字も読める。 */

/* 秒 → M:SS */
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/* /about#t=<秒>(構造化データの Clip の url と同じ形)。動画の長さを超える値は無視する */
const startFromHash = (hash: string): number | null => {
  const match = /^#t=(\d+)$/.exec(hash);
  if (!match) return null;
  const at = Number(match[1]);
  return at < ABOUT_INTRO_DURATION_SECONDS ? at : null;
};

export default function AboutIntroChapters() {
  const videoRef = useRef<HTMLVideoElement>(null);

  /* 読み込み時の #t=<秒>: その位置から始まるようにして、動画を画面内へ。自動再生はしない。
     preload="none" のまま currentTime を入れると「再生を押したときの開始位置」になり、押すまで何も読まない */
  useEffect(() => {
    const at = startFromHash(window.location.hash);
    const video = videoRef.current;
    if (at === null || !video) return;
    video.currentTime = at;
    video.scrollIntoView({ block: "center" });
  }, []);

  const jump = (at: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = at;
    /* 自動再生がブロックされたときに、コンソールへ出さない */
    video.play().catch(() => {});
    /* 今いる箇所を URL に残す(共有・再読み込みで同じ位置から)。履歴は増やさない */
    window.history.replaceState(null, "", `#t=${at}`);
  };

  return (
    <>
      <figure className="about-video">
        {/* preload="none": 82MB を、再生ボタンを押した人だけに落とす。付け忘れると /about を開いただけで落ちる。
            width/height は読み込み前に場所を確保するため(CLS 0)。字幕は映像に焼き込み済みなので <track> は付けない。 */}
        <video
          id="about-intro"
          ref={videoRef}
          controls
          preload="none"
          playsInline
          poster="/img/about/intro-poster.webp"
          width={1280}
          height={720}
        >
          <source src="/video/about-intro.mp4" type="video/mp4" />
          お使いのブラウザは動画の再生に対応していません。下の書き起こしをお読みください。
        </video>
        <figcaption>{ABOUT_INTRO_DURATION_LABEL}・音声あり。字幕は映像に入っています。</figcaption>
      </figure>

      {/* 用語の自動リンクがボタンの中に <a> を入れないよう、data-yougo-skip を付ける */}
      <ol className="about-video-chapters" aria-label="動画の目次" data-yougo-skip="">
        {ABOUT_INTRO_CHAPTERS.map((chapter) => (
          <li key={chapter.at}>
            <button type="button" onClick={() => jump(chapter.at)}>
              <span className="about-video-time">{clock(chapter.at)}</span> {chapter.label}
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}
