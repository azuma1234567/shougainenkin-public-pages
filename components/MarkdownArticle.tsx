import type { ReactNode } from "react";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import XPostEmbed from "@/components/XPostEmbed";

function inlineContent(text: string, keyPrefix = "inline"): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern = /(\*\*.+?\*\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-${match.index}-strong`}>
          {inlineContent(
            token.slice(2, -2),
            `${keyPrefix}-${match.index}-strong-content`,
          )}
        </strong>,
      );
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const resolvedHref =
          href === "/columns/soudansaki-chigai"
            ? "/columns/jibun-de-shinsei"
            : href;
        const reserved = new Set(["/suuji", "/gokai", "/okane/zeikin", "/okane/chousei", "/erabu/irai-subeki-case", "/erabu/hiyou-souba", "/erabu/erabikata", "/erabu/fushikyu-no-ato", "/senmonka"]);
        nodes.push(
          reserved.has(resolvedHref) ? <span key={`${keyPrefix}-${match.index}-reserved`}>{inlineContent(label, `${keyPrefix}-${match.index}-reserved-label`)}</span> : resolvedHref.startsWith("/") ? (
            <Link
              key={`${keyPrefix}-${match.index}-link`}
              href={resolvedHref}
            >
              {inlineContent(
                label,
                `${keyPrefix}-${match.index}-link-label`,
              )}
            </Link>
          ) : (
            <a
              key={`${keyPrefix}-${match.index}-link`}
              href={resolvedHref}
              target="_blank"
              rel="noopener noreferrer external"
            >
              {inlineContent(
                label,
                `${keyPrefix}-${match.index}-link-label`,
              )}
            </a>
          ),
        );
      }
    }

    lastIndex = tokenPattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

// 見出しからアンカー用のidを作る。本文から [表示](#見出し) で参照できるようにするため、
// また目次のリンクが初回表示(JS実行前)から機能するために、サーバー側で振っておく。
//
// 記号(:「」、— など)は落とし、英数字・ひらがな・カタカナ・漢字だけを残す。
// カタカナの長音符(ー)は語の一部なので残す。
function headingId(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(
      /[^0-9A-Za-zぁ-ゖァ-ヺー一-鿿ｦ-ﾟ\s-]/g,
      "",
    )
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function xPostUrl(line: string): string | null {
  const specifiedUrl = line.match(/https:\/\/x\.com\/[^\]]+/)?.[0];
  if (specifiedUrl) return specifiedUrl;

  if (line.includes("岸野さんの障害者雇用の心得")) {
    return "https://x.com/coco_ruuchan/status/2075183030982078880";
  }

  return null;
}

function tableCells(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line: string): boolean {
  const cells = tableCells(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

export default function MarkdownArticle({
  source,
  appCtaSlug,
  faqAccordion = false,
}: {
  source: string;
  appCtaSlug: string;
  faqAccordion?: boolean;
}) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  // 同じ見出しが2回出てくる記事でもidが重複しないようにする。
  const usedHeadingIds = new Set<string>();
  const uniqueHeadingId = (text: string, fallback: string): string => {
    const base = headingId(text) || fallback;
    let id = base;
    let suffix = 2;
    while (usedHeadingIds.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    usedHeadingIds.add(id);
    return id;
  };

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line || line === "---") {
      index += 1;
      continue;
    }

    if (line.startsWith("[スクショ")) {
      index += 1;
      continue;
    }

    if (line === "[App Storeバッジ]") {
      blocks.push(<AppCta key={`cta-${index}`} ct={appCtaSlug} />);
      index += 1;
      continue;
    }

    if (line.startsWith("[ツイート埋め込み:")) {
      const url = xPostUrl(line);
      if (url) {
        blocks.push(<XPostEmbed key={`x-${index}`} url={url} />);
      }
      index += 1;
      continue;
    }

    if (faqAccordion && /^\*\*Q[.．]/.test(line)) {
      const question = line.replace(/^\*\*/, "").replace(/\*\*$/, "");
      index += 1;
      const answerLines: string[] = [];
      while (index < lines.length) {
        const next = lines[index].trim();
        if (!next) { index += 1; break; }
        if (/^\*\*Q[.．]/.test(next) || next.startsWith("## ")) break;
        answerLines.push(next);
        index += 1;
      }
      blocks.push(<details className="hub-faq-item" key={`faq-${index}`}><summary>{inlineContent(question)}</summary><p>{inlineContent(answerLines.join(" "))}</p></details>);
      continue;
    }

    if (
      line.startsWith("|") &&
      index + 1 < lines.length &&
      isTableDivider(lines[index + 1].trim())
    ) {
      const headers = tableCells(line);
      const rows: string[][] = [];
      index += 2;

      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(tableCells(lines[index].trim()));
        index += 1;
      }

      // 3列以上の表はスマホで横スクロールが必要になる。切れていることが
      // 分からないため、注記を添えたうえでスクロール領域をキーボード操作可能にする。
      const isWide = headers.length >= 3;
      const isEpilepsyScale = headers[0]?.includes("発作の型と頻度") ?? false;

      blocks.push(
        <div
          className={isWide ? "article-table-figure is-wide" : isEpilepsyScale ? "article-table-figure is-epilepsy-scale" : "article-table-figure"}
          key={`table-${index}`}
        >
          {isWide ? (
            <p className="article-table-hint">→ 横にスクロールできます</p>
          ) : null}
          <div
            className="article-table-wrap"
            role="region"
            aria-label="表(横にスクロールできます)"
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  {headers.map((header, cellIndex) => (
                    <th key={cellIndex} scope="col">
                      {inlineContent(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers.map((header, cellIndex) => (
                      <td data-label={header} key={cellIndex}>
                        {inlineContent(row[cellIndex] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>,
      );
      continue;
    }

    if (line.startsWith("### ")) {
      const text = line.slice(4);
      blocks.push(
        <h3 key={`h3-${index}`} id={uniqueHeadingId(text, `heading-${index}`)}>
          {inlineContent(text)}
        </h3>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      const text = line.slice(3);
      blocks.push(
        <h2 key={`h2-${index}`} id={uniqueHeadingId(text, `heading-${index}`)}>
          {inlineContent(text)}
        </h2>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(
        <blockquote key={`quote-${index}`}>
          {quoteLines.map((quoteLine, quoteIndex) =>
            quoteLine ? (
              <p key={quoteIndex}>{inlineContent(quoteLine)}</p>
            ) : null,
          )}
        </blockquote>,
      );
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push(
        <ul key={`ul-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{inlineContent(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s/, ""));
        index += 1;
      }
      blocks.push(
        <ol key={`ol-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{inlineContent(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (
        !next ||
        next === "---" ||
        next.startsWith("## ") ||
        next.startsWith("### ") ||
        next.startsWith(">") ||
        next.startsWith("- ") ||
        /^\d+\.\s/.test(next) ||
        next.startsWith("[スクショ") ||
        next.startsWith("[ツイート埋め込み:") ||
        next === "[App Storeバッジ]"
      ) {
        break;
      }
      paragraphLines.push(next);
      index += 1;
    }
    blocks.push(
      <p key={`p-${index}`}>{inlineContent(paragraphLines.join(" "))}</p>,
    );
  }

  return <>{blocks}</>;
}
