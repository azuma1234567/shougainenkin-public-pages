"use client";

import { useEffect } from "react";

// /yougo#<slug> で着地したとき、該当の語を確実に画面上部へ持ってくる。
// ハイライト自体は CSS の :target(platform.css の yougo-flash)が担う。
// 通常はブラウザが自動でスクロールするが、ハイドレーション後に位置が
// ずれることがあるため、念のため読み込み時とハッシュ変更時にそろえる。
export default function YougoAnchorLanding() {
  useEffect(() => {
    const land = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      if (!slug) return;
      const target = document.getElementById(slug);
      if (target?.classList.contains("yougo-term") || target?.classList.contains("yougo-group")) {
        target.scrollIntoView({ block: "start" });
      }
    };
    const timer = window.setTimeout(land, 50);
    window.addEventListener("hashchange", land);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", land);
    };
  }, []);
  return null;
}
