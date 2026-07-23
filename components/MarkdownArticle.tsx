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
        nodes.push(
          resolvedHref.startsWith("/") ? (
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
}: {
  source: string;
  appCtaSlug: string;
}) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

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

      blocks.push(
        <div className="article-table-wrap" key={`table-${index}`}>
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
                  {headers.map((_, cellIndex) => (
                    <td key={cellIndex}>
                      {inlineContent(row[cellIndex] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={`h3-${index}`}>{inlineContent(line.slice(4))}</h3>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={`h2-${index}`}>{inlineContent(line.slice(3))}</h2>,
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
