import Link from "next/link";
import type { GokaiBlock, GokaiBody as Body } from "@/data/gokai-bodies";
import { isPublishedInternalPath } from "@/lib/gokai";
import CaseLead from "@/components/platform/CaseLead";

// 原稿の文字列は保持し、承認された **太字** だけを要素へ変換する。
function Inline({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*\n]+\*\*)/g).map((part, i) =>
    part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  )}</>;
}

function Block({ block, arrow }: { block: GokaiBlock; arrow: boolean }) {
  switch (block.type) {
    case "p": return <p><Inline text={block.text} /></p>;
    case "h3": return <h3><Inline text={block.text} /></h3>;
    case "ul": return <ul>{block.items.map((text, i) => <li key={i}><Inline text={text} /></li>)}</ul>;
    case "faq": return <div className="gokai-faq"><h3 data-yougo-skip>Q. <Inline text={block.q} /></h3><p>A. <Inline text={block.a} /></p></div>;
    case "link": return isPublishedInternalPath(block.href) ? <Link href={block.href}>{arrow ? "→ " : ""}{block.label}</Link> : null;
    case "case": {
      return <div className="gokai-case"><p><CaseLead lead={block.lead} caseId={block.caseId} /> — <Inline text={block.text} /></p></div>;
    }
  }
}

const sectionClasses: Record<string, string> = {
  "結論": "gokai-truth",
  "自分の場合を確かめる": "gokai-block gokai-check",
  "窓口で聞く一言": "gokai-block gokai-ask",
  "数字で見ると": "gokai-block gokai-figure",
  "次に読む": "gokai-next",
  "出典": "gokai-sources",
};

export default function GokaiBody({ body }: { body: Body }) {
  return <>{body.sections.map(section => (
    <section key={section.heading} className={sectionClasses[section.heading] ?? "gokai-block"}
      data-yougo-skip={section.heading === "出典" || section.heading === "同じ状況の人が、どうなったか" ? true : undefined}>
      <h2>{section.heading}</h2>
      {section.blocks.map((block, i) => <Block key={i} block={block} arrow={section.heading !== "次に読む"} />)}
    </section>
  ))}</>;
}
