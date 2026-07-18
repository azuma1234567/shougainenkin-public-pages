"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const CONSENT_STORAGE_KEY = "analytics-consent-v1";
const GA_MEASUREMENT_ID = "G-PHHDYX0H53";

type ConsentChoice = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
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

export default function AnalyticsConsent() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  const [analyticsInitialized, setAnalyticsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const analyticsConfiguredRef = useRef(false);
  const lastTrackedPathnameRef = useRef<string | null>(null);
  const bannerHeadingRef = useRef<HTMLHeadingElement>(null);

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
    let savedConsent: string | null = null;

    try {
      savedConsent = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    } catch {
      // 保存領域を読み取れない場合は未選択として扱う。
    }

    if (savedConsent === "granted") {
      initializeGoogleTagQueue();
      setConsent("granted");
    } else if (savedConsent === "denied") {
      setConsent("denied");
    } else {
      setIsBannerOpen(true);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isBannerOpen) {
      bannerHeadingRef.current?.focus();
    }
  }, [isBannerOpen]);

  useEffect(() => {
    if (
      consent !== "granted" ||
      !analyticsInitialized ||
      !window.gtag
    ) {
      return;
    }

    if (lastTrackedPathnameRef.current === pathname) {
      return;
    }

    window.gtag("event", "page_view", {
      page_location: window.location.origin + pathname,
      page_referrer: "",
    });
    lastTrackedPathnameRef.current = pathname;
  }, [analyticsInitialized, consent, pathname]);

  const grantConsent = () => {
    saveConsent("granted");
    initializeGoogleTagQueue();
    setConsent("granted");
    setIsBannerOpen(false);
  };

  const denyConsent = () => {
    saveConsent("denied");

    if (consent === "granted") {
      window.gtag?.("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      deleteGoogleAnalyticsCookies();
      window.location.reload();
      return;
    }

    setConsent("denied");
    setIsBannerOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="analytics-settings-button"
        onClick={() => setIsBannerOpen(true)}
      >
        アクセス解析設定
      </button>

      {consent === "granted" ? (
        <Script
          id="google-analytics-gtag"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
          onLoad={configureAnalyticsOnce}
          onReady={configureAnalyticsOnce}
        />
      ) : null}

      {isReady && isBannerOpen ? (
        <section
          className="analytics-consent-banner"
          role="dialog"
          aria-labelledby="analytics-consent-title"
          aria-describedby="analytics-consent-description"
        >
          <div className="analytics-consent-inner">
            <div className="analytics-consent-copy">
              <h2
                id="analytics-consent-title"
                className="analytics-consent-title"
                tabIndex={-1}
                ref={bannerHeadingRef}
              >
                アクセス解析について
              </h2>
              <p id="analytics-consent-description">
                当サイトでは、利用状況の把握とサービス改善のためGoogle
                Analyticsを使用します。
              </p>
            </div>
            <div className="analytics-consent-actions">
              <button
                type="button"
                className="analytics-consent-accept"
                onClick={grantConsent}
              >
                同意する
              </button>
              <button
                type="button"
                className="analytics-consent-deny"
                onClick={denyConsent}
              >
                拒否する
              </button>
              <Link href="/privacy" onClick={() => setIsBannerOpen(false)}>
                プライバシーポリシーを見る
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
