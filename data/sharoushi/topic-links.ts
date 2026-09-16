/* 事務所ページの「対応できる相談」→ 当サイトの入口ページの対応表
   (docs/claude-code-sharoushi-list-2026-09-16-instructions.md §3-4)。
   分類名は data/sharoushi/options.ts の SHAROUSHI_TOPICS と同じ文字列。
   リンク先は isPublishedInternalPath を通し、未公開なら文字だけにする。 */
export const TOPIC_LINKS: Record<string, { href: string; hint: string }> = {
  "申請の前の相談": { href: "/erabu/jibun-ka-irai", hint: "自分で申請するか、依頼するか →" },
  "初診日・受診歴の確認": { href: "/nayami/shoshinbi-karute", hint: "初診日のカルテがないとき →" },
  "診断書・申立書の準備": { href: "/nayami/shindansho-komatta", hint: "診断書で困ったとき →" },
  "働きながらの申請": { href: "/joukyou/hatarakinagara", hint: "働きながら申請するとき →" },
  "家族からの相談": { href: "/joukyou/kazoku-ga-tetsudau", hint: "家族が申請を手伝うとき →" },
  "精神の障害・発達障害": { href: "/byoki", hint: "病気から探す →" },
  "身体の障害・内部の病気": { href: "/byoki", hint: "病気から探す →" },
  "不支給になったあと": { href: "/nayami/fushikyu", hint: "不支給と言われたとき →" },
  "更新・支給停止のあと": { href: "/nayami/koushin", hint: "更新や額改定で困ったとき →" },
};
