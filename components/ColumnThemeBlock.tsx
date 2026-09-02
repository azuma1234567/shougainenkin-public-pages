import Link from "next/link";
import { publishedHubLinks } from "@/lib/hubs";
import type { Column } from "@/lib/columns";

export default function ColumnThemeBlock({ column }: { column: Column }) {
  const hubs = publishedHubLinks({
    primary: column.hubPrimary,
    secondary: column.hubSecondary,
    role: column.role,
    mergeCandidate: column.mergeCandidate,
  });
  if (hubs.length === 0) return null;

  return (
    <aside className="column-theme-block" aria-labelledby={`column-theme-${column.slug}`}>
      <p id={`column-theme-${column.slug}`} className="column-theme-title">この記事が属するテーマ</p>
      <div className="column-theme-links">
        {hubs.map((hub, index) => (
          <Link href={hub.path} key={hub.path}>
            {index === 0 ? <span className="column-theme-primary">主テーマ</span> : null}
            {hub.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
