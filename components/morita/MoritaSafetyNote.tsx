/* 「向かない人と相談窓口」の固定ボックス。森田療法の全記事で lead の直後に出す
   (docs/claude-code-morita-2026-10-06-instructions.md §4)。文言はハブ原稿「先に、このページが向かない人」を短くしたもので、
   新しい主張は書かない。電話番号は年金側の定数(data/)と混ぜず、ここに置く。公開前に番号を一度だけ目視で再確認する。 */
export default function MoritaSafetyNote() {
  return (
    <aside className="morita-safety" aria-label="このページが向かない人">
      <p className="morita-safety-title">このページが向かない人</p>
      <p>重いうつ病・統合失調症の治療中の方、死にたい気持ちが強い方は、先に医療機関へ。</p>
      <p>よりそいホットライン <a href="tel:0120-279-338">0120-279-338</a>(24時間) / こころの健康相談統一ダイヤル <a href="tel:0570-064-556">0570-064-556</a></p>
      <p>森田療法は薬と併用するのが普通です。処方されている薬を自己判断でやめないでください。</p>
    </aside>
  );
}
