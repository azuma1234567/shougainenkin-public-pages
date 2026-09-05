/* /hajimete に差し込む機能カード。 */
import Link from "next/link";
import { TOOLS, type ToolId } from "@/data/dougu";
import { isPublishedInternalPath } from "@/lib/published-links";

/* 2+3 の並び。申請の時間順。 */
const LEAD: ToolId[] = ["mitate", "kingaku"];

export function JibunCard({ id }: { id: ToolId }) {
  const t = TOOLS[id];
  return (
    <Link className={`jc jc--${id}`} href={t.path}>
      <span className="jc-q">{t.question}</span>
      <span className="jc-what">{t.what}</span>
      <span className="jc-meta">
        <span className="jc-time">{t.time}</span>
        <span className="jc-basis">{t.basisShort}</span>
      </span>
    </Link>
  );
}

/* 未公開の機能は出さない(タグでは表現しない)。 */
export function JibunCards({ ids }: { ids: ToolId[] }) {
  const visible = ids.filter((id) => isPublishedInternalPath(TOOLS[id].path));
  const lead = visible.filter((id) => LEAD.includes(id));
  const rest = visible.filter((id) => !LEAD.includes(id));
  if (visible.length === 0) return null;
  return (
    <div className="jc-set">
      {lead.length > 0 && <div className="jc-row jc-row-lead">{lead.map((id) => <JibunCard key={id} id={id} />)}</div>}
      {rest.length > 0 && <div className="jc-row jc-row-rest">{rest.map((id) => <JibunCard key={id} id={id} />)}</div>}
    </div>
  );
}
