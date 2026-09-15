/* トップの「次にやること」6枚の線画アイコン(docs/top-icons-2026-09-15-instructions.md)。
   Platform.tsx の TopicIcon と同じ作法。装飾なので aria-hidden で、<title> は持たない。パスはモックのまま。 */
import type { ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg className="p-next-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

/* 01 カレンダーに印のついた日 */
export function FirstVisitIcon() {
  return <Icon><path d="M4 6h16v14H4z" /><path d="M4 10h16M8 3v4M16 3v4" /><circle cx="12" cy="15" r="2" /></Icon>;
}
/* 02 紙1枚にハート */
export function DoctorNoteIcon() {
  return <Icon><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M12 16s-3-2-3-4a1.7 1.7 0 0 1 3-1 1.7 1.7 0 0 1 3 1c0 2-3 4-3 4z" /></Icon>;
}
/* 03 スマホの画面に書式の行 */
export function StatementIcon() {
  return <Icon><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M10 7h4M10 10h4M10 13h2" /><path d="M11 18h2" /></Icon>;
}
/* 04 封筒 */
export function SubmitIcon() {
  return <Icon><path d="M3 7l9 6 9-6" /><rect x="3" y="5" width="18" height="14" rx="2" /></Icon>;
}
/* 05 砂時計 */
export function WaitingIcon() {
  return <Icon><path d="M7 3h10M7 21h10" /><path d="M8 3c0 4 4 5 4 9s-4 5-4 9M16 3c0 4-4 5-4 9s4 5 4 9" /></Icon>;
}
/* 06 開いた封筒と手紙 */
export function ResultIcon() {
  return <Icon><path d="M4 10l8-6 8 6v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" /><path d="M4 10l8 5 8-5" /><path d="M8 7h8v5" /></Icon>;
}
