"use client";

import { useEffect, useState } from "react";

// 用語カードの「リンクをコピー」。/yougo#<slug> のURLをクリップボードに入れる。
// SNSやLINEで「この言葉のことです」と送れるようにするためのもの。
export default function YougoCopyLink({ slug, term }: { slug: string; term: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 1800);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function copy() {
    const url = `${window.location.origin}/yougo#${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      // クリップボードが使えない環境では、URLを選択できる形で見せる
      window.prompt("このURLをコピーしてください", url);
      setState("failed");
    }
  }

  return (
    <button
      className={`yougo-copy${state === "copied" ? " is-copied" : ""}`}
      type="button"
      onClick={copy}
      aria-label={`「${term}」のリンクをコピー`}
      data-yougo-copy={slug}
    >
      {state === "copied" ? "コピーしました" : "リンクをコピー"}
    </button>
  );
}
