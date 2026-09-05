import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import AppCta from "@/components/AppCta";
import CaseLead from "@/components/platform/CaseLead";
import { TOOLS } from "@/data/dougu";
import { COLUMN_SOURCE_LINKS } from "@/components/ColumnFooter";

function sourceContent(text: string): ReactNode[] {
  // 最長の資料名から完全一致で選ぶ。短い「初診日」などは引用符内の資料名だけ。
  const nodes: ReactNode[] = [];
  let rest = text;
  while (rest) {
    const candidates = COLUMN_SOURCE_LINKS.map(ref => ({ ref, index: rest.indexOf(ref.label) }))
      .filter(({ ref, index }) => index >= 0 && (ref.label.length > 8 || rest[index - 1] === "「"))
      .sort((a, b) => a.index - b.index || b.ref.label.length - a.ref.label.length);
    const next = candidates[0];
    if (!next) { nodes.push(...inlineContent(rest)); break; }
    nodes.push(...inlineContent(rest.slice(0, next.index)));
    nodes.push(<a key={`source-${nodes.length}`} href={next.ref.href} target="_blank" rel="noopener noreferrer">{next.ref.label}</a>);
    rest = rest.slice(next.index + next.ref.label.length);
  }
  return nodes;
}

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
        const reserved = new Set(["/gokai", "/okane/zeikin", "/okane/chousei", "/senmonka"]);
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
  columnStyle = false,
  leadNotice,
}: {
  source: string;
  appCtaSlug: string;
  faqAccordion?: boolean;
  columnStyle?: boolean;
  // リード(本文の最初のブロック)の直後に差し込む注記。
  // アフィリエイト広告の表示に使う。景表法が求める「目立つ位置」がここ。
  leadNotice?: ReactNode;
}) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  const cardStack: { start: number; variant?: string }[] = [];
  let index = 0;
  // 出典ブロックは用語辞典の自動リンク対象外にするため、見出しの位置を覚えておく。
  let sourcesHeadingIndex = -1;

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

    const arrow = columnStyle && line.match(/^→ (.+)\((\/[^()]*)\)$/);
    if (arrow) {
      const [, label, href] = arrow;
      const tool = Object.values(TOOLS).find(tool => tool.path === href);
      blocks.push(<Link key={`arrow-${index}`} href={href} className={`column-inline-card${tool ? ` jc--${tool.id}` : href.startsWith("/gokai/") ? " column-gokai-link" : ""}`}>→ {label}</Link>);
      index += 1;
      continue;
    }

    const caseLine = columnStyle && line.match(/^\*\*(.+?([hr]\d\d(?:_\d\d)?(?:_r\d\d)?-\d\d_\d\d)[^*]*)\*\*\s*—\s*(.*)$/);
    if (caseLine) {
      blocks.push(<div className="gokai-case" key={`case-${index}`} data-yougo-skip><p><CaseLead lead={caseLine[1]} caseId={caseLine[2]} /> — {inlineContent(caseLine[3])}</p></div>);
      index += 1;
      continue;
    }

    if (columnStyle && /^\*\*Q[.．]/.test(line)) {
      const question = line.replace(/^\*\*/, "").replace(/\*\*$/, "");
      blocks.push(<h3 className="column-faq-question" data-yougo-skip key={`faq-${index}`} id={uniqueHeadingId(question, `faq-${index}`)}>{inlineContent(question)}</h3>);
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

    // [カード開始] 〜 [カード終了] で囲んだブロックを1枚のカードにまとめる。
    // 印刷・スクリーンショットしやすい持ち物リストや質問メモに使う。
    // [カード開始:質問メモ] のように種類を付けると、答えを書く余白つきの体裁になる。
    if (/^\[カード開始(:[^\]]+)?\]$/.test(line)) {
      const variant = line.match(/^\[カード開始:([^\]]+)\]$/)?.[1];
      cardStack.push({ start: blocks.length, variant });
      index += 1;
      continue;
    }
    if (line === "[カード終了]") {
      const card = cardStack.pop();
      if (card) {
        const inner = blocks.splice(card.start);
        const className = card.variant === "質問メモ" ? "article-card article-qmemo" : "article-card";
        blocks.push(<div className={className} key={`card-${index}`}>{inner}</div>);
      }
      index += 1;
      continue;
    }

    // 「☐ 」で始まる行の並びはチェックリスト。文言はそのまま出す。
    if (line.startsWith("☐")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("☐")) {
        items.push(lines[index].trim().replace(/^☐\s*/, ""));
        index += 1;
      }
      blocks.push(
        <ul className="article-checklist" key={`check-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}><span className="article-checkbox" aria-hidden="true">☐</span><span>{inlineContent(item)}</span></li>
          ))}
        </ul>,
      );
      continue;
    }

    if (faqAccordion && /^\*\*Q[.．]/.test(line)) {
      /* 質問は `**Q. …**`。答えは次の行から書く形と、同じ行に続けて書く形の両方がある
         (ハブ 40 本のうち 17 本が同じ行の形)。同じ行の分を summary に飲み込ませない。 */
      const inline = /^\*\*(Q[.．][^*]*?)\*\*\s*(.*)$/.exec(line);
      const question = inline ? inline[1] : line.replace(/^\*\*/, "").replace(/\*\*$/, "");
      index += 1;
      const answerLines: string[] = inline && inline[2] ? [inline[2]] : [];
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
      if (text.startsWith("出典")) sourcesHeadingIndex = blocks.length;
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
      if (text.startsWith("出典")) sourcesHeadingIndex = blocks.length;
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
            <li key={itemIndex}>{columnStyle && sourcesHeadingIndex >= 0 ? sourceContent(item) : inlineContent(item)}</li>
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
        (columnStyle && (next.startsWith("→ ") || /^\*\*Q[.．]/.test(next))) ||
        next.startsWith("## ") ||
        next.startsWith("### ") ||
        next.startsWith(">") ||
        next.startsWith("- ") ||
        /^\d+\.\s/.test(next) ||
        next.startsWith("[スクショ") ||
        next.startsWith("[カード") ||
        next.startsWith("☐") ||
        next === "[App Storeバッジ]"
      ) {
        break;
      }
      paragraphLines.push(next);
      index += 1;
    }
    const paragraph = paragraphLines.join(" ");
    const label = columnStyle && paragraph.match(/^\*\*([^*]+)\*\*\s*(.*)$/);
    if (label) {
      blocks.push(<h3 key={`label-${index}`} id={uniqueHeadingId(label[1], `label-${index}`)}>{inlineContent(label[1])}</h3>);
      if (label[2]) blocks.push(<p key={`p-${index}`}>{inlineContent(label[2])}</p>);
    } else {
      blocks.push(<p key={`p-${index}`}>{columnStyle && sourcesHeadingIndex >= 0 ? sourceContent(paragraph) : inlineContent(paragraph)}</p>);
    }
  }

  // リードの直後へ注記を差し込む。出典見出しの位置も1つずれる。
  if (leadNotice && blocks.length > 0) {
    blocks.splice(1, 0, leadNotice);
    if (sourcesHeadingIndex >= 1) sourcesHeadingIndex += 1;
  }

  if (sourcesHeadingIndex < 0) return <>{blocks}</>;
  // 出典見出し以降のブロックに印を付け、用語辞典の自動リンクを走らせない。
  return (
    <>
      {blocks.map((block, blockIndex) =>
        blockIndex >= sourcesHeadingIndex && isValidElement(block)
          ? cloneElement(block as ReactElement<Record<string, unknown>>, {
              "data-yougo-skip": "",
            })
          : block,
      )}
    </>
  );
}
