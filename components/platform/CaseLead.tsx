import { SAIKETSU_CASES } from "@/lib/saiketsu";

// 誤解カードとコラムで、確認済み裁決だけを同じ原文リンクにする。
export default function CaseLead({ lead, caseId }: { lead: string; caseId: string }) {
  const item = SAIKETSU_CASES.find(item => item.id === caseId);
  if (!item) throw new Error(`未検証の裁決ID: ${caseId}`);
  const index = lead.lastIndexOf(caseId);
  if (index < 0) throw new Error(`裁決IDがリードにない: ${caseId}`);
  return <strong>{lead.slice(0, index)}<a href={item.url} target="_blank" rel="noopener noreferrer">原文(厚労省PDF)</a>{lead.slice(index + caseId.length)}</strong>;
}
