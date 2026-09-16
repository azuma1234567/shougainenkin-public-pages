/* サイト内の直前のパスを覚えておく(client 側だけ)。
   Next の <Link> による遷移では document.referrer が更新されないため、/sharoushi の計測の
   from(どのページから来たか。sharoushi-list 指示書 §5-2)が取れない。Analytics(全ページに出る)が
   パスの変化のたびに recordPathname を呼び、lib/sharoushi-track.ts が previousPathname を読む。
   パスの全文は送らず、先頭セグメントだけを使う。 */
let current: string | null = null;
let previous: string | null = null;

export function recordPathname(pathname: string) {
  if (pathname === current) return;
  previous = current;
  current = pathname;
}

/* 直前のサイト内パス。初回表示(直前が無い)なら null。 */
export const previousPathname = (): string | null => previous;
