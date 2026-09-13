"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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

export default function Analytics() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  const [analyticsInitialized, setAnalyticsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const analyticsConfiguredRef = useRef(false);
  const lastTrackedPathnameRef = useRef<string | null>(null);

  const configureAnalyticsOnce = useCallback(() => {
    if (analyticsConfiguredRef.current) return;

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

  useEffect(() => {
    const savedConsent = readConsent();

    if (savedConsent !== "denied") {
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

    document.addEventListener("click", trackAppStoreClick, true);
    return () => {
      document.removeEventListener("click", trackAppStoreClick, true);
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
  }, [analyticsInitialized, consent, isReady, pathname]);

  /* localStorage を読むまでは読み込まない(denied の人に一瞬でも gtag を読ませないため)。 */
  if (!isReady || consent === "denied") return null;

  return (
    <Script
      id="google-analytics-gtag"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
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
