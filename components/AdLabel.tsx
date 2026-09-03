// 広告であることの表示ラベル。社労士の掲載枠・アフィリエイトリンク・AdSense枠で
// 共通に使う。景表法のステマ規制は「広告であることが一般消費者に明瞭に分かること」を
// 求めるので、枠の中で最初に目に入る位置へ置くこと。
//
// 文言は「広告」「PR」と、事務所の掲載枠に使う「掲載(広告)」の3つだけにする。
// 増やすと、読者が毎回それが広告かどうかを読み解くことになる。
export type AdLabelKind = "広告" | "PR" | "掲載(広告)";

export default function AdLabel({
  kind = "広告",
  className = "",
}: {
  kind?: AdLabelKind;
  className?: string;
}) {
  return <span className={`ad-label ${className}`.trim()}>{kind}</span>;
}
