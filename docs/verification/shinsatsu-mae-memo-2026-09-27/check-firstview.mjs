// 検証5: スマホ幅(375×812、iPhone 相当)で /columns/shinsatsu-mae-memo を開き、
// h3「空欄の型」と h2「先に、渡す紙」が最初の画面に入るかを測る。スクリーンショットも撮る。
//   node docs/verification/shinsatsu-mae-memo-2026-09-27/check-firstview.mjs http://localhost:3210 local
import { chromium } from "playwright";
const origin = process.argv[2] ?? "http://localhost:3210";
const tag = process.argv[3] ?? "local";
const out = "docs/verification/shinsatsu-mae-memo-2026-09-27";
const browser = await chromium.launch({ headless: true });
try {
  for (const [w, h] of [[375, 812], [390, 844], [360, 740]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${origin}/columns/shinsatsu-mae-memo`, { waitUntil: "networkidle" });
    const m = await page.evaluate(() => {
      const find = (sel, text) => [...document.querySelectorAll(sel)].find((el) => el.textContent.includes(text));
      const rect = (el) => el ? Math.round(el.getBoundingClientRect().top + scrollY) : null;
      const banner = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "拒否する");
      const bannerBox = banner?.closest("[role=dialog], aside, div")?.getBoundingClientRect();
      return {
        viewport: innerHeight,
        h1: rect(document.querySelector("h1")),
        conclusion: rect(document.querySelector(".column-conclusion")),
        firstH2: rect(find("h2", "診断書、思ったより軽く書かれてた")),
        h2Paper: rect(find("h2", "先に、渡す紙")),
        h3Blank: rect(find("h3", "空欄の型")),
        bannerTop: bannerBox ? Math.round(bannerBox.top) : null,
      };
    });
    const inView = m.h3Blank !== null && m.h3Blank < m.viewport;
    console.log(`${w}×${h}: 空欄の型の見出し top=${m.h3Blank}px / 画面の高さ ${m.viewport}px → ${inView ? "最初の画面に入る" : `入らない(あと ${m.h3Blank - m.viewport}px)`}`);
    console.log(`  h1=${m.h1} 結論の箱=${m.conclusion} 冒頭h2=${m.firstH2} 「先に、渡す紙」h2=${m.h2Paper} 同意バナー上端=${m.bannerTop}`);
    await page.screenshot({ path: `${out}/firstview-${tag}-${w}x${h}.png` });
    await page.close();
  }
} finally { await browser.close(); }
