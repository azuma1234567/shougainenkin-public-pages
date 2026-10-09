"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { recordPathname } from "@/lib/nav-from";

/* アクセス解析はオプトアウト方式(docs/analytics-optout-2026-09-08-instructions.md)。
   既定で計測し、/privacy のボタンでいつでも止められる。localStorage に "denied" を
   保存している人(旧・同意バナーで「拒否する」を押した人を含む)は計測しない。
   キーと値は同意方式のときのまま。変えると既存の denied を読めなくなる。 */
const CONSENT_STORAGE_KEY = "analytics-consent-v1";
const GA_MEASUREMENT_ID = "G-PHHDYX0H53";
const APP_STORE_HOSTNAME = "apps.apple.com";
const EVENT_SEND_TIMEOUT_MS = 1000;

type ConsentChoice = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function readConsent(): ConsentChoice | null {
  try {
    const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return saved === "granted" || saved === "denied" ? saved : null;
  } catch {
    // 保存領域を読み取れない場合は未選択(= 計測する)として扱う。
    return null;
  }
}

function saveConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // localStorageが使えない場合も、現在のページでは選択結果を反映する。
  }
}

function initializeGoogleTagQueue() {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(..._args: unknown[]) {
      window.dataLayer?.push(arguments);
    };
}

function deleteGoogleAnalyticsCookies() {
  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0]?.trim())
    .filter(
      (name): name is string =>
        Boolean(name) && (name === "_ga" || name.startsWith("_ga_")),
    );

  const hostnameParts = window.location.hostname.split(".");
  const domainCandidates = new Set<string>();

  for (let index = 0; index < hostnameParts.length - 1; index += 1) {
    const domain = hostnameParts.slice(index).join(".");
    domainCandidates.add(domain);
    domainCandidates.add(`.${domain}`);
  }

  for (const name of cookieNames) {
    document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

    for (const domain of domainCandidates) {
      document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    }
  }
}

/* 計測を止める。denied を保存し、consent を denied に更新して Cookie を消し、読み込み直す。 */
function optOutOfAnalytics() {
  saveConsent("denied");
  window.gtag?.("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  deleteGoogleAnalyticsCookies();
  window.location.reload();
}

/* 計測を再開する。granted を保存して読み込み直す。 */
function optInToAnalytics() {
  saveConsent("granted");
  window.location.reload();
}

function getAppStoreLink(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;

  const link = target.closest<HTMLAnchorElement>("a[href]");
  if (!link) return null;

  try {
    return new URL(link.href).hostname === APP_STORE_HOSTNAME ? link : null;
  } catch {
    return null;
  }
}

function getLinkText(link: HTMLAnchorElement): string {
  return (
    link.innerText ||
    link.getAttribute("aria-label") ||
    link.querySelector("img")?.getAttribute("alt") ||
    ""
  ).trim();
}

/* 「次に読む」の箱(components/ColumnArticle.tsx の .column-next)のクリック(docs/site-audit-2026-10-09.md §5-1)。
   送るのは送り元と送り先のコラムの slug だけ。/columns/<slug> の記事ページで、送り先も /columns/<slug> のときに限る
   (同じクラスを使う見本ページ /dev/design などでは送らない)。 */
const COLUMN_PATH = /^\/columns\/([^/?#]+)\/?$/;

function getNextReadClick(target: EventTarget | null): { from_slug: string; to_slug: string } | null {
  if (!(target instanceof Element)) return null;

  const link = target.closest<HTMLAnchorElement>(".column-next a[href]");
  if (!link) return null;

  const fromSlug = COLUMN_PATH.exec(window.location.pathname)?.[1];
  let toSlug: string | undefined;
  try {
    toSlug = COLUMN_PATH.exec(new URL(link.href).pathname)?.[1];
  } catch {
    return null;
  }
  return fromSlug && toSlug ? { from_slug: fromSlug, to_slug: toSlug } : null;
}

/* 自動ブラウザ(Playwright・ヘッドレス Chrome・各種クローラ)は navigator.webdriver が true。
   検証スクリプトや巡回を GA4 の数字に混ぜない(docs/site-audit-2026-10-05.md §4・§5-3)。 */
function isAutomatedBrowser(): boolean {
  return typeof navigator !== "undefined" && navigator.webdriver === true;
}

export default function Analytics() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  const [analyticsInitialized, setAnalyticsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const analyticsConfiguredRef = useRef(false);
  const lastTrackedPathnameRef = useRef<string | null>(null);
  /* 最初の page_view より前に起きたイベント。gtag.js の設定(config)前に dataLayer へ積むと gtag.js は送り先が無いまま捨て、
     config 後でも page_view より先に送るとそのイベントがセッションの開始になるので、ここに貯めて最初の page_view の直後に送る
     (lazyOnload のため、表示から 0.5〜5 秒ほどこの状態がある)。 */
  const pendingEventsRef = useRef<[string, Record<string, string>][]>([]);

  const configureAnalyticsOnce = useCallback(() => {
    if (analyticsConfiguredRef.current) return;
    if (isAutomatedBrowser()) return;

    initializeGoogleTagQueue();
    if (!window.gtag) return;

    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    analyticsConfiguredRef.current = true;
    setAnalyticsInitialized(true);
  }, []);

  /* 直前のサイト内パスの記録(lib/nav-from.ts)。計測の可否と関係なく、パスが変わるたびに更新する。 */
  useEffect(() => {
    if (pathname) recordPathname(pathname);
  }, [pathname]);

  useEffect(() => {
    const savedConsent = readConsent();

    if (savedConsent !== "denied" && !isAutomatedBrowser()) {
      initializeGoogleTagQueue();
    }

    setConsent(savedConsent);
    setIsReady(true);
  }, []);

  useEffect(() => {
    const trackAppStoreClick = (event: MouseEvent) => {
      const link = getAppStoreLink(event.target);
      if (!link || !window.gtag) return;

      const opensInCurrentPage =
        event.button === 0 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey &&
        (!link.target || link.target === "_self");

      let navigationTimeout: number | undefined;
      let hasNavigated = false;
      const continueNavigation = () => {
        if (!opensInCurrentPage || hasNavigated) return;

        hasNavigated = true;
        if (navigationTimeout !== undefined) {
          window.clearTimeout(navigationTimeout);
        }
        window.location.assign(link.href);
      };

      if (opensInCurrentPage) {
        event.preventDefault();
        navigationTimeout = window.setTimeout(
          continueNavigation,
          EVENT_SEND_TIMEOUT_MS,
        );
      }

      window.gtag("event", "app_store_click", {
        link_url: link.href,
        link_text: getLinkText(link),
        page_location: window.location.href,
        page_path: window.location.pathname,
        transport_type: "beacon",
        event_callback: continueNavigation,
        event_timeout: EVENT_SEND_TIMEOUT_MS,
      });
    };

    /* 「次に読む」は <Link> のクライアント遷移でページが残るので、遷移を止めずにそのまま送る
       (transport_type は付けない。GA4 では送信方法の指定ではなく、ただのイベントパラメータとして記録される)。
       webdriver ガードの内側: 自動ブラウザでは送らない(window.gtag も作られないが、明示的に見る)。
       計測を止めている人は window.gtag が無いので送らない。
       - ダブルクリックの 2 回目(detail > 1)は数えない
       - 中ボタンで新しいタブに開いたとき(auxclick, button 1)も、Cmd/Shift クリックと同じく 1 回数える
       - 最初の page_view を送る前のクリックは pendingEventsRef に貯めて、page_view の直後に送る */
    const trackNextReadClick = (event: MouseEvent) => {
      if (isAutomatedBrowser() || !window.gtag) return;
      if (event.type === "auxclick" && event.button !== 1) return;
      if (event.detail > 1) return;

      const params = getNextReadClick(event.target);
      if (!params) return;

      if (lastTrackedPathnameRef.current === null) {
        pendingEventsRef.current.push(["next_read_click", params]);
        return;
      }
      window.gtag("event", "next_read_click", params);
    };

    document.addEventListener("click", trackAppStoreClick, true);
    document.addEventListener("click", trackNextReadClick, true);
    document.addEventListener("auxclick", trackNextReadClick, true);
    return () => {
      document.removeEventListener("click", trackAppStoreClick, true);
      document.removeEventListener("click", trackNextReadClick, true);
      document.removeEventListener("auxclick", trackNextReadClick, true);
    };
  }, []);

  useEffect(() => {
    if (
      !isReady ||
      consent === "denied" ||
      !analyticsInitialized ||
      !window.gtag
    ) {
      return;
    }

    if (lastTrackedPathnameRef.current === pathname) {
      return;
    }

    /* 参照元は初回だけ渡す。2ページ目以降はサイト内遷移なので渡さない。
       page_location はクエリ(?case= など)を含めるため href を使う。 */
    const isFirstPageView = lastTrackedPathnameRef.current === null;
    window.gtag("event", "page_view", {
      page_location: window.location.href,
      ...(isFirstPageView ? { page_referrer: document.referrer } : {}),
    });
    lastTrackedPathnameRef.current = pathname;

    /* 設定前に貯めたイベント(「次に読む」のクリック)を、page_view の後ろに送る。 */
    for (const [name, params] of pendingEventsRef.current.splice(0)) {
      window.gtag("event", name, params);
    }
  }, [analyticsInitialized, consent, isReady, pathname]);

  /* localStorage を読むまでは読み込まない(denied の人に一瞬でも gtag を読ませないため)。
     読むときも描画が終わってから(lazyOnload)。未選択の人にも読むが、LCP の前には走らせない(2026-09-15)。 */
  if (!isReady || consent === "denied") return null;

  return (
    <Script
      id="google-analytics-gtag"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="lazyOnload"
      onLoad={configureAnalyticsOnce}
      onReady={configureAnalyticsOnce}
    />
  );
}

/* /privacy に置く、計測を止める/再開するボタン。いまの状態で表示が変わる。 */
export function AnalyticsOptOutButton() {
  const [consent, setConsent] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    setConsent(readConsent());
  }, []);

  const isTracking = consent !== "denied";

  return (
    <button
      type="button"
      className="analytics-preference-button"
      onClick={isTracking ? optOutOfAnalytics : optInToAnalytics}
    >
      {isTracking ? "アクセス解析を停止する" : "アクセス解析を再開する"}
    </button>
  );
}
