import { readFileSync } from "node:fs";
import { join } from "node:path";

export function getColumnContent(slug: string): string {
  return readFileSync(join(process.cwd(), "content", "columns", `${slug}.md`), "utf8");
}

// FAQPageは表示本文と同じQ&Aから生成し、二重管理による内容ずれを防ぐ。
export function extractFaqs(markdown: string) {
  const section = markdown.match(/## よくある質問\n([\s\S]*?)(?=\n## |$)/)?.[1] ?? "";
  return Array.from(
    section.matchAll(/\*\*Q\. (.+?)\*\*\nA\. ([^\n]+)/g),
    ([, question, answer]) => ({
      question,
      answer: answer
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\*\*/g, ""),
    }),
  );
}

export function extractHeadings(markdown: string) {
  return Array.from(markdown.matchAll(/^## (.+)$/gm), ([, text], index) => ({
    id: `section-${index + 1}`,
    text,
  }));
}
