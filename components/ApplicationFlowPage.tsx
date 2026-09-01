import type { Metadata } from "next";
import Link from "next/link";
import AppStoreBadge from "@/components/AppStoreBadge";
import {
  availableClusters,
  CATEGORY_ORDER,
  COLUMNS,
  columnsInCategory,
  formatDate,
  WORRY_SHORTCUTS,
} from "@/lib/columns";
import { APP_STORE_URL, SITE_NAME, SITE_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

const PAGE_TITLE =
  "障害年金の申請の流れと必要書類｜初めての方へ8ステップで解説【2026年度対応】";
const PAGE_DESCRIPTION =
  "障害年金の申請を何から始めればよいか、初診日の確認、納付要件、年金事務所への相談、必要書類、診断書、申立書、提出、結果待ちまで8ステップで解説します。実際につまずきやすいところと、その避け方もあわせて。令和8年度(2026年度)の年金額に対応。";

// 制度の数値を更新したら、この日付も必ず更新する(構造化データの dateModified と共用)。
const LAST_UPDATED = "2026-08-14";

// このページは「障害年金 申請」クラスタの柱ページなので、自分自身は除く。
// 残りの柱ページは、公開されたら自動でここに並ぶ(lib/clusters.ts の published)。
const MORE_PILLARS = availableClusters().filter(
  (cluster) => cluster.pillarPath !== "/shinsei",
);

export const metadata: Metadata = pageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/shinsei",
  absoluteTitle: true,
});

type StepLink = { href: string; label: string };

type Step = {
  id: string;
  num: number;
  title: string;
  why: string;
  todo: string[];
  prepare: string[];
  // 旧「よくある間違い」を、実際につまずくところの具体的な説明に置き換えた。
  // 短い箇条書きではなく、なぜそうなるか・どう避けるかまで書く。
  real: string[];
  // 常時表示するリンク。2〜3本まで。それ以上は moreLinks に回して折りたたむ。
  links: StepLink[];
  moreLinks?: StepLink[];
  // この段階に対応するコラム一覧のカテゴリ(lib/columns.ts の CATEGORY_ANCHORS のid)。
  // サイト全体で「8ステップ」という同じ地図を見せるための対応づけ。
  columnsAnchor?: string;
  // アプリに対応する実体機能があるステップだけに置く事実文。
  // 等級や受給を約束する表現は書かないこと。
  appNote?: string;
  next: string;
};

const STEPS: Step[] = [
  {
    id: "step-1",
    num: 1,
    title: "初診日を確認する",
    why: "初診日(その傷病で初めて医師にかかった日)は、申請全体の「起点」です。保険料納付要件の判定期間も、障害基礎年金か障害厚生年金かも、障害認定日も、すべてここから決まります。ここがずれると申請をやり直すことになる場合があるので、最初にゆっくり確かめましょう。",
    todo: [
      "その症状で初めて医師にかかった日を思い出す。診断名がついた日ではありません。",
      "転院している場合は、いちばん最初にかかった医療機関を確認する。",
      "その日に会社員だったか(厚生年金)、そうでなかったか(国民年金)も確認する。",
    ],
    prepare: [
      "通院してきた医療機関の名前と、かかった時期のメモ",
      "健康保険証の使用履歴やお薬手帳など、受診の手がかりになるもの",
      "その頃の勤務先と在籍期間がわかるもの",
    ],
    real: [
      "初診日は「うつ病と診断された日」ではありません。眠れなくて近所の内科にかかった日、めまいで耳鼻科に行った日が初診日になることが実際によくあります。心療内科に移る前の受診を数えそこねて、あとから初診日をずらすことになる — これが最も多いつまずき方です。",
      "その日に厚生年金に入っていたか、国民年金だったかで、受け取れる年金の種類そのものが変わります。会社を辞めて体調を崩し、落ち着いてから受診した場合、障害厚生年金ではなく障害基礎年金だけになることがあります。長く保険料を納めてきた人ほど、この差は大きく感じられます。",
      "カルテの保存義務は5年です(医師法第24条第2項。数え始めはその患者の診療が終わった日から)。「体調が落ち着いてから申請しよう」と待っている間に、証明が取れなくなることがあります。初診の病院がまだあるなら、ほかの準備より先に受診状況等証明書だけ取っておく、というのが実務でよく勧められる順番です。",
      "カルテが残っていなくても、そこで終わりではありません。転院先のカルテに書かれた発病からの経過、前の病院からの紹介状、身体障害者手帳を申請したときの診断書の写し、生命保険の給付を請求したときの診断書、お薬手帳、診察券、領収書、健康保険の給付記録などが手がかりになります。",
      "第三者証明という方法もありますが、三親等内の親族は書けません。原則2通必要で、20歳以後に初診日がある場合は、それに加えて初診日を裏づける参考資料も要ります(20歳前なら2通のみで足ります)。初診の医療機関の医師や看護師が、当時の受診を直接見ていたことを証明できる場合は1通で足ります。「昔から具合が悪そうだった」という印象では通らず、いつ・どこで・何を見聞きしたかという具体性が必要です。",
    ],
    links: [
      {
        href: "/columns/shoshinbi-wakaranai",
        label: "初診日がわからないときの調べ方",
      },
      {
        href: "/columns/shoshinbi-karute-nashi",
        label: "カルテがない・破棄されたときの証明方法と代替資料",
      },
    ],
    moreLinks: [
      {
        href: "/columns/shoshinbi-haiin",
        label: "昔の病院が廃院しているときの調べ方",
      },
      { href: "/columns/hatachi-mae", label: "20歳前の傷病による障害基礎年金" },
      {
        href: "/columns/hattatsu-shougai",
        label: "発達障害(ADHD・ASD)の初診日の考え方",
      },
      {
        href: "/columns/tekio-shogai-shogai-nenkin",
        label: "適応障害と診断された場合の初診日の確認",
      },
    ],
    columnsAnchor: "columns-cat-shoshinbi",
    appNote:
      "無料の申請ガイドアプリでは、いくつかの質問に答えると、いま自分がどの段階にいて、最初に何をすればいいかが分かります。",
    next: "ステップ2: 保険料納付要件を確認する",
  },
  {
    id: "step-2",
    num: 2,
    title: "保険料納付要件を確認する",
    why: "障害年金は、初診日の前日までの保険料の納め方が一定の条件を満たしている必要があります。症状が重くても、この要件を満たさないと受け取れないことがあります。",
    todo: [
      "初診日の前日時点で「3分の2要件」か「直近1年要件」のどちらかを満たしているか確認する。",
      "直近1年要件(初診日がある月の前々月までの1年間に未納がない)の特例は、初診日が令和18年(2036年)3月末日までで、初診日に65歳未満であることが条件です。以前は令和8年3月末までとされていましたが、10年延長されました。",
      "ねんきんネットや年金事務所で、これまでの納付状況を確認できます。",
      "20歳前の、年金制度に加入していない期間に初診日がある場合は、納付要件は問われません。",
    ],
    prepare: ["基礎年金番号がわかるもの", "ねんきんネットのアカウント(あれば)"],
    real: [
      "免除や学生納付特例を「払っていない期間」だと思い込んで、確認する前に諦めてしまう人がとても多いところです。免除・猶予を受けていた期間は、納付要件の判定では未納になりません。記憶であきらめず、必ず記録で確かめてください。",
      "初診日より後になって未納分を納めても、判定には反映されません。逆にいえば、いま未納があっても、初診日の時点で満たしていれば大丈夫です。判定されるのはあくまで初診日の前日時点です。",
      "「特例は令和8年3月で終わる」という説明が、インターネット上にはまだ多く残っています。令和7年の年金制度改正で令和18年3月末まで10年延長されているので、古い情報を見て諦めないでください。",
      "20歳前に初診日がある場合、納付要件は問われませんが、代わりに本人の前年所得による支給停止があります。働き始めてから支給が止まって驚く、ということが起こりうる点だけ、頭の隅に置いておいてください。",
    ],
    links: [
      {
        href: "/columns/nofu-yoken",
        label: "保険料納付要件とは — 3分の2要件と直近1年の特例",
      },
      {
        href: "/columns/hatachi-mae",
        label: "納付要件が不要になる20歳前傷病の特例",
      },
    ],
    columnsAnchor: "columns-cat-nofu",
    next: "ステップ3: 年金事務所へ相談・予約する",
  },
  {
    id: "step-3",
    num: 3,
    title: "年金事務所へ相談・予約する",
    why: "申請書類一式は、年金事務所や街角の年金相談センターで受け取ります。納付要件の確認もその場でできます。相談は無料で、何度でも大丈夫です。「まだ何も分からない」段階で行っても、ちゃんと案内してもらえます。",
    todo: [
      "最寄りの年金事務所へ電話などで相談を予約する。",
      "初診日・通院歴・いまの生活の様子を伝えられるよう、簡単なメモを持っていく。",
      "書類一式(年金請求書、診断書の様式、病歴・就労状況等申立書、受診状況等証明書の様式など)を受け取る。",
    ],
    prepare: [
      "基礎年金番号がわかるもの",
      "通院してきた医療機関と時期のメモ",
      "本人確認書類",
      "その場で聞くことを書き出したメモ",
    ],
    real: [
      "窓口で「難しいと思いますよ」と言われることがあります。ですがそれは、受給できるかどうかの決定ではありません。決まるのは、書類を出したあとの審査です。窓口での見立てだけで申請そのものをやめてしまうのは、いちばんもったいない引き返し方です。",
      "障害年金は年金の中でも扱いが専門的で、担当者によって説明が違うことが実際に起こります。言われたことは、その場で日付と担当者名つきでメモしておくと、あとで話が食い違ったときに助かります。",
      "自分で進める場合、年金事務所には3回から5回は行くことになるのが普通です(相談・書類の受け取り・確認・提出・不足分の追加)。体調に波がある人にとっては、この往復そのものが最大の負担になります。1回で聞くことをまとめておく、郵送で済むものは郵送にする、と最初から決めておくと消耗が減ります。",
      "予約なしでも受け付けてもらえることはありますが、待ち時間が長くなります。体調のいい時間帯に予約を取るほうが、結果的に一度で済みます。",
    ],
    links: [
      {
        href: "/columns/nenkin-jimusho-soudan",
        label: "年金事務所で相談するときの持ち物と、当日に聞かれること",
      },
      {
        href: "/columns/shinsei-shindoi",
        label: "申請がしんどいときの、小分けの進め方",
      },
    ],
    columnsAnchor: "columns-cat-soudan",
    next: "ステップ4: 必要書類をそろえる",
  },
  {
    id: "step-4",
    num: 4,
    title: "必要書類をそろえる",
    why: "障害年金の申請には複数の書類が必要です。初診の医療機関と診断書を書く医療機関が違う場合などは、追加の書類が要ります。最初に全体像をつかんでおくと、後戻りが減って、気持ちにも余裕が生まれます。",
    todo: [
      "年金事務所の案内に沿って、自分に必要な書類を確認する。",
      "主な書類:年金請求書 / 医師の診断書 / 病歴・就労状況等申立書 / 受診状況等証明書(初診と診断書の医療機関が異なる場合) / 基礎年金番号がわかるもの / 戸籍・住民票関係 / 受け取り口座がわかるもの / 配偶者や子がいる場合の関係書類。",
      "病院に頼む書類から先に動かす。",
    ],
    prepare: [
      "書類を集めるためのチェックリスト",
      "受診状況等証明書が必要かどうかの確認(初診と診断書の病院が同じなら不要な場合があります)",
      "診断書などの文書料(1通あたり数千円から1万円台)",
    ],
    real: [
      "書類集めは自分のペースでは進みません。病院に依頼した診断書や受診状況等証明書は、2週間から1か月ほどかかるのが普通です。自分で書ける申立書を先に片づけたくなりますが、時間がかかるものから先に頼むほうが、全体としてずっと早く終わります。",
      "受診状況等証明書が要るかどうかは「初診の病院と、診断書を書いてもらう病院が同じかどうか」で決まります。同じなら不要です。これに後から気づいて、もう一度病院に行くことになるのがよくあるパターンです。",
      "診断書は無料ではありません。1通あたり数千円から1万円台かかり、受診状況等証明書も別にかかります。障害認定日の分と現在の分で2通必要になる場合もあるので、費用の見込みを先に立てておくと安心です。",
      "書類を取り寄せるだけの日は、それだけで一日が終わります。1日1件と決めて、できた日はそこで終わりにする。それでちょうどいいペースです。",
    ],
    links: [
      {
        href: "/columns/hitsuyou-shorui-seishin",
        label: "精神疾患の必要書類チェックリスト — 入手先・費用・取得順序",
      },
      {
        href: "/columns/jushinjokyo-shomeisho",
        label: "受診状況等証明書とは — 病院への依頼方法と確認ポイント",
      },
    ],
    columnsAnchor: "columns-cat-shorui",
    next: "ステップ5: 診断書の準備をする",
  },
  {
    id: "step-5",
    num: 5,
    title: "診断書の準備をする",
    why: "診断書は審査の中心になる書類です。とくに精神の障害では、日常生活の様子が診断書にどう書かれるかで結果が大きく変わります。医師が診察室で見えているのは、あなたの生活のごく一部です。だからこそ、ふだんの大変さを伝える準備に意味があります。",
    todo: [
      "年金事務所でもらった様式で、主治医に診断書を依頼する。",
      "障害認定日(原則、初診日から1年6か月を経過した日)時点、または現在の状態を書いてもらう。",
      "依頼するときに、ふだんの生活の様子をまとめた紙を一緒に渡す。",
      "受け取ったら、提出前に全部の欄を自分で読む。",
    ],
    prepare: [
      "診断書の様式",
      "日常生活の困りごとをまとめたメモ(A4で1〜2枚)",
      "これまでの通院の記録",
    ],
    real: [
      "医師が見ているのは、診察室での10分から15分だけです。家で入浴できていないこと、買い物に行けなくなっていること、家族がどれだけ手を貸しているか — 言わなければ伝わりません。伝えていないことは、書かれないだけです。",
      "いちばん効くのは、医師に渡す紙を自分で用意することです。日記のように時系列で書くのではなく、食事・清潔・金銭管理・通院と服薬・対人関係・危険への対応・社会性といった項目ごとに、いまどうなっているかを並べます。医師が診断書のどの欄に何を書けばいいか一目でわかる形にすると、受け取る側の負担も減ります。",
      "精神の診断書の裏面にある「日常生活能力の判定」7項目は、記載要領で「単身で生活するとしたら可能かどうかで判断してください」と定められています。実家で親が食事を作ってくれていても、評価するのは「一人だったらどうなるか」です。ここを知らずに「食事は問題ありません」と答えてしまい、実態より軽く評価される — これは本当によくある取りこぼしです。",
      "診察室で「大丈夫です」と言ってしまうのは、ほとんど反射のようなものです。「できません」と言い切るのがつらければ、「できたらいいのですが、実際には週に2回くらいしか入浴できていません」のように、事実を頻度で伝えると、誇張にも過小申告にもなりません。可能なら、家族に一度同席してもらって、家での様子を家族の口から話してもらうのも有効です。",
      "受け取った診断書に空欄があったら、そのままにしないでください。空欄は「問題なし」と読まれます。事実と違う記載があれば訂正をお願いしていいのですが、事実でないことを書いてもらうのは別の話です。頼んでいいのは、あくまで実態に合わせてもらうところまでです。",
      "病名の書かれ方でも結果は変わります。神経症の範囲にあたる病名が併記されると不利に働くことがあり、適応障害だけでは原則として対象になりません。診断名が変わっている場合は、その経過も含めて医師と共有しておくと、書類全体の筋が通ります。",
    ],
    links: [
      {
        href: "/columns/shinsatsu-mae-memo",
        label: "生活の実態を伝える診察前メモの作り方",
      },
      {
        href: "/columns/nichijo-seikatsu-7koumoku",
        label: "診断書裏面「日常生活能力の判定」7項目の見られ方",
      },
      {
        href: "/columns/shindansho-kakunin",
        label: "診断書を受け取ったら確認すべき7つのポイント",
      },
    ],
    moreLinks: [
      {
        href: "/columns/shindansho-irai-timing",
        label: "診断書はいつ頼む? — 依頼のタイミングと準備",
      },
      {
        href: "/columns/shindansho-tanomikata",
        label: "診断書を主治医にどう頼む? — 切り出し方の台本",
      },
      {
        href: "/columns/shindansho-ishi-ni-tsutaeru",
        label: "医師に伝えること全リスト — 6分野と言葉の例",
      },
      {
        href: "/columns/shindansho-jittai-chigau",
        label: "診断書が実態と違う・軽く書かれたときの対処",
      },
      {
        href: "/columns/shindansho-kaitekurenai",
        label: "診断書を医師が書いてくれないときの対処法",
      },
      {
        href: "/columns/hitorigurashi-furi",
        label: "一人暮らしだと不利? 日常生活能力の見られ方",
      },
      {
        href: "/columns/tokyu-hantei-guideline",
        label: "精神の等級判定ガイドラインと目安表の読み方",
      },
    ],
    columnsAnchor: "columns-cat-shindansho",
    appNote:
      "診察で話せなくても紙なら伝わります。アプリには、ふだんの生活の記録から主治医に渡すメモを作る機能があります。",
    next: "ステップ6: 病歴・就労状況等申立書を作成する",
  },
  {
    id: "step-6",
    num: 6,
    title: "病歴・就労状況等申立書を作成する",
    why: "申立書は、自分で書く唯一の書類です。発病から現在までの生活・通院・就労の実態を、あなた自身の言葉で伝えられる大切な機会でもあります。診断書と食い違わないように整えることも忘れずに。",
    todo: [
      "発病から現在までを、期間ごとに区切る。",
      "それぞれの期間の通院状況・日常生活・就労の様子を書く。",
      "書けたら、診断書と並べて読み、食い違いがないか確かめる。",
    ],
    prepare: [
      "通院してきた期間の一覧",
      "日々の困りごとのメモ",
      "働いていた時期の状況(勤務日数・休んだ日・職場の配慮など)",
    ],
    real: [
      "書き方には型があります。「事実」→「生活にどう影響しているか」→「誰の手助けが要るか」の順です。頻度・かかる時間・援助の有無、この3つが入っていれば、読む側は状況を思い浮かべられます。",
      "審査する側は、同じような書類を何百通と読んでいます。感情に訴える文章より、淡々とした事実の積み重ねのほうが届きます。余白なく詰め込むより、期間で区切って読みやすくするほうが伝わります。手書きでなくてかまいません。",
      "盛らないでください。診断書と食い違った瞬間に、申立書全体が信用されなくなります。逆に、実態より控えめに書きすぎるのも同じくらい多い失敗です。書くべきは、誇張でも遠慮でもない、そのままの生活です。",
      "障害年金は、苦労の量で決まる制度ではありません。過去の不遇や家庭の事情そのものより、いま日常生活のどこがどれだけ制限されているかを書いてください。関係のない苦労話が長いほど、肝心なところが埋もれます。",
      "完璧に書こうとして提出が遅れるのが、いちばん大きな損です。障害基礎年金2級なら、1か月あたり7万円ほどにあたります。まずは通院した病院を全部書き出すところから始めて、あとから肉付けしていくほうが結果的に早く終わります。",
      "順番の思い込みにも注意してください。「申立書は診断書をもらってから書くもの」ではありません。先に申立書の下書きを作り、それを診断書の依頼時に主治医へ渡す — この順番のほうが、書類全体の筋が通りやすくなります。",
    ],
    links: [
      {
        href: "/columns/moushitatesho-kakikata",
        label: "病歴・就労状況等申立書の書き方【精神疾患】",
      },
      {
        href: "/columns/moushitatesho-kikan-kugiri",
        label: "期間はどう区切る? 通院・就労・症状変化の書き方",
      },
      {
        href: "/columns/hatarakinagara",
        label: "働きながら申請する場合の伝え方",
      },
    ],
    moreLinks: [
      {
        href: "/columns/moushitatesho-mijushin-kikan",
        label: "未受診期間はどう書く? 理由と生活状況の伝え方",
      },
      {
        href: "/columns/kazoku-enjo-kakikata",
        label: "家族の援助をどう書く? — 具体例と書き分け",
      },
      {
        href: "/columns/moushitatesho-a4-insatsu",
        label: "申立書をA4で印刷する方法 — PDF・コンビニ印刷の手順",
      },
    ],
    columnsAnchor: "columns-cat-moushitatesho",
    appNote: "アプリでは、記録した生活の様子を申立書の下書きに整理できます。",
    next: "ステップ7: 年金事務所へ提出する",
  },
  {
    id: "step-7",
    num: 7,
    title: "年金事務所へ提出する",
    why: "提出の前が、書類全体を見直せる最後の機会です。診断書と申立書の内容が食い違っていると、審査で不利になることがあります。ここまで来たら、あと少しです。",
    todo: [
      "診断書と申立書を並べて読み、食い違いがないか確認する。",
      "必要書類がそろっているか、年金事務所の案内と照らし合わせる。",
      "すべてコピーを取ってから、年金事務所などへ提出する。",
    ],
    prepare: [
      "そろえたすべての必要書類",
      "提出書類の控え(コピー)",
      "郵送する場合は、追跡できる方法",
    ],
    real: [
      "控えを取らずに出してしまう人が、想像よりずっと多くいます。もし不支給になったとき、手元に控えがないと、何がどう評価されたのかを検証するところから始められません。スマートフォンで撮っておくだけでも、まったく違います。",
      "診断書と申立書を並べて読むのは、面倒でも必ずやってください。診断書に「家事はおおむね可能」と書かれているのに、申立書に「家事はほとんどできない」と書いてあると、どちらも信用されにくくなります。違いに気づいたら、どちらが実態かを整理してから出します。",
      "体調が悪い日に無理をして窓口へ行く必要はありません。郵送でも提出できます。窓口に持っていくと不備をその場で指摘してもらえる利点はありますが、行けない日に無理をするほどの差ではありません。",
    ],
    links: [
      {
        href: "/columns/teishutsusaki-yuusou",
        label: "書類はどこに提出する? — 窓口・郵送の使い分け",
      },
      {
        href: "/columns/shindansho-kakunin",
        label: "提出前に診断書を確認する7つのポイント",
      },
    ],
    columnsAnchor: "columns-cat-shorui",
    next: "ステップ8: 結果を待つ",
  },
  {
    id: "step-8",
    num: 8,
    title: "結果を待つ",
    why: "提出後は日本年金機構で審査が行われます。日本年金機構が目標として公表している事務処理期間は、障害基礎年金が約3か月、障害厚生年金が約3か月半です。長く感じる期間ですが、ここまで来たら、待つことも「申請のうち」です。追加の照会が来たら、早めに対応しましょう。",
    todo: [
      "結果が届くのを待つ。結果は「年金証書・年金決定通知書」または「不支給決定通知書」などの形で届きます。",
      "審査の途中で書類の追加や確認の連絡が来ることがあります。届いたら早めに対応する。",
      "不支給や等級に納得できない場合は、期限内であれば審査請求という不服申立ての制度があります。",
    ],
    prepare: ["提出書類の控え", "届いた通知書の保管"],
    real: [
      "目安は3か月・3か月半ですが、追加の照会が入るとそのぶん延びます。1か月半ほど経っても何の連絡もなければ、進み具合を問い合わせて構いません。待っているあいだ何も知らされないのは、それ自体がしんどい期間です。",
      "近年、審査が厳しくなったと感じている人が増えています。厚生労働省の調査では、令和6年度に不支給とされた割合は13.0%で、前年度の8.4%から上がりました。精神障害では6.4%から12.1%へと倍近くになっています。これを受けて日本年金機構が令和6年度以降の不支給事案を点検し、一部が支給に変わりました。「前は通ったのに」という感覚は、気のせいではありません。",
      "不支給だったときにまず必要なのは、気持ちの整理より「なぜ落ちたか」を知ることです。年金事務所で理由を確認するか、開示請求で審査の資料を取り寄せます。理由がわからないまま出し直しても、同じところで止まります。",
      "不服申立てには期限があります。しかも2段階目のほうが短いので、そこだけは覚えておいてください。審査請求は処分があったことを知った日の翌日から3か月以内、再審査請求は決定書の謄本が送られた日の翌日から2か月以内です。",
      "審査請求とは別に、あらためて請求し直すという道もあります。こちらに期限はありません。ただ、前回の内容は引き継がれて見られるため、何をどう変えたのかがはっきりしていないと通りにくくなります。だからこそ「とりあえず一度出してみる」はおすすめできない、というのが実務側でおおむね一致している見方です。",
    ],
    links: [
      {
        href: "/columns/fushikyuu-shinsa-seikyu",
        label: "不支給になったら|審査請求・再審査請求・再請求",
      },
      {
        href: "/columns/shinsei-kikan",
        label: "結果はいつ届く? 審査期間と結果待ちの過ごし方",
      },
      {
        href: "/columns/sokyuu-seikyuu",
        label: "最大5年分をさかのぼる遡及請求の条件",
      },
    ],
    moreLinks: [
      {
        href: "/columns/ninteibi-jigojusho",
        label: "障害認定日請求と事後重症請求の違い",
      },
      {
        href: "/columns/shinsa-shikumi-nintei-i",
        label: "審査は誰がどう行う? — 認定医と書類審査の仕組み",
      },
    ],
    columnsAnchor: "columns-cat-shinsa",
    appNote:
      "結果を待つあいだにできることも、アプリのガイドが段階ごとに案内します。",
    next: "",
  },
];

// ページ冒頭に置く「最初につまずく3か所」。
// 8ステップを読む前に、ここだけでも持ち帰ってもらうつもりで書く。
const TRAPS: { title: string; body: string; fix: string }[] = [
  {
    title: "初診日を、いまの主治医にかかった日だと思ってしまう",
    body: "初診日は、診断名がついた日ではなく、その症状で初めて医師にかかった日です。眠れなくて内科に行った日、めまいで耳鼻科に行った日が初診日になることがよくあります。その日に厚生年金だったか国民年金だったかで、受け取れる年金の種類まで変わります。",
    fix: "先にすること: 通院した病院を、いちばん古いものから全部書き出す。",
  },
  {
    title: "診断書を医師任せにして、実態より軽く書かれる",
    body: "医師が見ているのは診察室での10分ほどです。家で入浴できていないこと、家族がどれだけ手を貸しているかは、言わなければ伝わりません。とくに精神の診断書は、書かれ方で結果が大きく変わります。",
    fix: "先にすること: 依頼のときに渡す、生活の様子をまとめた紙を1枚つくる。",
  },
  {
    title: "落ち着いてから申請しようと待つあいだに、証明が取れなくなる",
    body: "カルテの保存義務は5年です。初診の病院がまだあるうちなら1通で済んだ証明が、数年後には第三者証明や代わりの資料をかき集める作業に変わります。",
    fix: "先にすること: 初診の病院に、カルテが残っているかだけ電話で確かめる。",
  },
];

// 令和8年度(2026年度)の年金額。出典は日本年金機構(更新日 2026年4月1日)。
// 令和8年4月分(令和8年6月支給分)から適用。数値を変えたら LAST_UPDATED も更新すること。
const AMOUNT_ROWS: { grade: string; kiso: string; kousei: string }[] = [
  {
    grade: "1級",
    kiso: "1,059,125円 + 子の加算額",
    kousei: "報酬比例の年金額 × 1.25 + 配偶者の加給年金額",
  },
  {
    grade: "2級",
    kiso: "847,300円 + 子の加算額",
    kousei: "報酬比例の年金額 + 配偶者の加給年金額",
  },
  {
    grade: "3級",
    kiso: "(対象外)",
    kousei: "報酬比例の年金額(最低保障額 635,500円)",
  },
];

// 自分で進めるか、専門家に頼むか。どちらかを勧めるためではなく、
// 判断材料を並べるために置く。運営者は社会保険労務士ではない。
const SELF_OK = [
  "初診日がはっきりしていて、初診の病院がいまもある",
  "初診から現在まで、同じ病院にかかり続けている",
  "主治医が診断書の作成に協力的",
  "書類の取り寄せや窓口でのやりとりを、体調的にこなせる",
];

const CONSIDER_PRO = [
  "初診日がわからない、またはカルテが破棄されている",
  "病院を何度も変わっていて、経過を追うのが難しい",
  "一度不支給になったことがある",
  "働きながらの精神疾患で、伝え方に迷っている",
  "体調的に、年金事務所へ何度も行くのが難しい",
];

// アプリの現行仕様に沿ったメリットの短い紹介。
// AI上限は src/lib(アプリ本体)の定数が正。数値を変えるときは規約・サポートと同時に直すこと。
const APP_POINTS = [
  "初めての障害年金申請を、ひとつずつガイド",
  "いまの段階と、次にすることが分かる",
  "申請ガイドと日々の記録は無料。日々の記録は件数無制限",
  "診察メモは、主治医が約30秒で読めるまとめに",
  "診察メモ・申立書PDF・AI文章整理・食い違いチェック・バックアップも無料",
  "すべて無料。AI機能は月400回まで",
];

// 構造化データ(FAQPage)と画面表示の両方で使う。数値は本文と必ずそろえること。
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "障害年金の申請にはどのくらい時間がかかりますか?",
    a: "書類をそろえる期間は人によって異なりますが、提出後の審査について日本年金機構が目標として公表している事務処理期間は、障害基礎年金が約3か月、障害厚生年金が約3か月半です。診断書の作成や初診日の証明に時間がかかると、準備段階だけで数か月かかることもあります。病院に頼む書類は2週間から1か月ほどかかるため、そこから先に動かすと全体が早く終わります。",
  },
  {
    q: "保険料に未納があると障害年金は受けられませんか?",
    a: "初診日の前日時点で、加入期間の3分の2以上が納付済み・免除済みであれば要件を満たします。これを満たさない場合でも、初診日が令和18年3月末日までで初診日に65歳未満であれば、初診日がある月の前々月までの直近1年間に未納がなければよいという特例があります。免除や学生納付特例を受けていた期間は未納にはあたりません。また、20歳前の年金制度に加入していない期間に初診日がある場合は、納付要件は問われません。",
  },
  {
    q: "障害年金はいくら受け取れますか?",
    a: "令和8年度(2026年度)の障害基礎年金は、1級が年額1,059,125円、2級が年額847,300円です(昭和31年4月2日以後生まれの方)。子がいる場合は2人目まで1人につき243,800円、3人目以降は1人につき81,300円が加算されます。障害厚生年金はこれに報酬比例の年金額が上乗せされ、金額は加入期間と報酬によって一人ひとり異なります。なお障害年金には所得税・住民税がかかりません。",
  },
  {
    q: "障害者手帳を持っていれば、その等級で障害年金がもらえますか?",
    a: "いいえ。障害者手帳と障害年金は別の制度で、判定の基準も審査する機関も違います。手帳が2級でも障害年金は不支給ということも、手帳を持っていなくても障害年金を受けられることもあります。手帳の等級を根拠に諦めたり期待したりせず、障害年金は障害年金として確認してください。",
  },
  {
    q: "働いていると障害年金は受けられませんか?",
    a: "働いていても受けられる場合があります。ただし、就労している状況が「日常生活の制限は軽い」と受け取られやすいのも事実です。大切なのは、どんな配慮を受けてはじめて働けているのかを具体的に書くことです。勤務時間の短縮、業務指示を細かく分けてもらっていること、休憩の追加、通院への配慮など、支えがあって成り立っている部分を書きます。",
  },
  {
    q: "病名が決まっていれば障害年金は受け取れますか?",
    a: "受け取れるとは限りません。障害年金は病名だけで決まる制度ではなく、初診日、保険料の納付要件、障害認定日時点および現在の障害の状態という複数の条件で判断されます。とくに精神の障害では、日常生活能力がどの程度制限されているかが診断書でどう書かれるかが結果に影響します。",
  },
  {
    q: "不支給になったらもう受け取れませんか?",
    a: "決定に納得できない場合は、期限内であれば審査請求という不服申立ての制度があります。審査請求は処分があったことを知った日の翌日から3か月以内、その結果にも納得できない場合の再審査請求は決定書の謄本が送付された日の翌日から2か月以内です。期限のない方法として、あらためて請求し直すこともできます。また、その後に症状が悪化した場合は事後重症請求として改めて請求でき、その請求書は65歳の誕生日の前々日までに提出する必要があります。",
  },
  {
    q: "さかのぼって受け取ることはできますか?",
    a: "障害認定日(原則、初診日から1年6か月を経過した日)の時点の診断書がそろえば、その時点にさかのぼって請求できます。ただし実際に受け取れるのは、請求した日から5年分までです。認定日から10年空いていても、支払われるのは直近5年分になります。当時のカルテが残っているかどうかが分かれ目になるため、思い当たる方は早めに確認してください。",
  },
];

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "ja-JP",
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/shinsei#webpage`,
      url: `${SITE_URL}/shinsei`,
      name: "障害年金の申請の流れと必要書類",
      description: PAGE_DESCRIPTION,
      inLanguage: "ja-JP",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@type": "Thing", name: "障害年金の申請" },
      dateModified: LAST_UPDATED,
    },
    {
      "@type": "HowTo",
      "@id": `${SITE_URL}/shinsei#howto`,
      name: "障害年金の申請の流れ(8ステップ)",
      inLanguage: "ja-JP",
      step: STEPS.map((s) => ({
        "@type": "HowToStep",
        position: s.num,
        name: s.title,
        url: `${SITE_URL}/shinsei#${s.id}`,
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/shinsei#faq`,
      inLanguage: "ja-JP",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#application`,
      name: SITE_NAME,
      description:
        "障害年金の申請の現在地と次にすることを確認し、日々の記録・診察メモ・申立書の準備を進めるためのiOSアプリ。",
      operatingSystem: "iOS 15.1以降",
      applicationCategory: "LifestyleApplication",
      inLanguage: "ja-JP",
      url: `${SITE_URL}/`,
      downloadUrl: APP_STORE_URL,
      sameAs: APP_STORE_URL,
      offers: [{
        "@type": "Offer",
        name: "すべての機能が無料(AI機能は月400回まで)",
        price: "0",
        priceCurrency: "JPY",
      }],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* A. ファーストビュー */}
      <section className="guide-hero">
        <p className="guide-eyebrow">はじめての障害年金申請ガイド</p>
        <h1 className="guide-h1">障害年金の申請の流れと必要書類</h1>
        <p className="guide-h1-sub">
          <span className="guide-h1-marker">「いま、なにをすればいいか」</span>
          がわかる<span style={{ whiteSpace: "nowrap" }}>8ステップ</span>
        </p>
        <p className="guide-lead">
          体調がすぐれないなかで、慣れない制度や書類に向き合うのは、それだけで力のいることです。
          このページは、はじめて障害年金を申請する方が「いま、なにをすればいいか」をひとつずつ確かめられるように、
          初診日の確認から結果が届くまでを8つのステップに分けて案内します。
        </p>
        <p className="guide-lead">
          制度の説明だけでなく、実際にどこでつまずきやすいか、どうすればそれを避けられるかも
          あわせて書いています。一度に読み切る必要はありません。あなたのいまの段階から、あなたのペースでどうぞ。
        </p>
        <div className="guide-cta-row">
          <a className="guide-btn guide-btn-primary" href="#steps">
            8つのステップを見る
          </a>
          <a className="guide-btn guide-btn-secondary" href="#traps">
            先につまずきやすい3か所を見る
          </a>
        </div>
        <dl className="guide-facts">
          <div className="guide-fact">
            <dt>ステップ</dt>
            <dd className="guide-fact-value">
              8<span className="guide-fact-unit">段階</span>
            </dd>
            <dd className="guide-fact-note">初診日の確認から結果が届くまで</dd>
          </div>
          <div className="guide-fact">
            <dt>審査の目安</dt>
            <dd className="guide-fact-value">
              約3<span className="guide-fact-unit">か月</span>
            </dd>
            <dd className="guide-fact-note">障害厚生年金は約3か月半</dd>
          </div>
          <div className="guide-fact">
            <dt>納付要件の特例</dt>
            <dd className="guide-fact-value">
              令和18<span className="guide-fact-unit">年3月末まで</span>
            </dd>
            <dd className="guide-fact-note">10年延長されました</dd>
          </div>
        </dl>
        <p className="guide-updated small-note">
          最終更新:{" "}
          <time dateTime={LAST_UPDATED}>{formatDate(LAST_UPDATED)}</time>
          ／令和8年度(2026年度)の年金額に対応
        </p>
      </section>

      {/* このサイトについて */}
      <div
        className="note-box guide-about-note"
        role="note"
        aria-label="このサイトについて"
      >
        <p>
          数値・制度は日本年金機構および厚生労働省の公表情報にもとづいています。
          受給を保証するものではなく、正式な確認先もあわせてご案内しています。
          運営者は社会保険労務士ではなく、申請の代行は行っていません(
          <Link href="/about">運営者情報</Link>)。
        </p>
      </div>

      {/* B. 最初につまずく3か所 */}
      <section
        className="guide-section"
        id="traps"
        aria-labelledby="guide-traps-heading"
      >
        <h2 id="guide-traps-heading" className="guide-heading">
          つまずくのは、たいてい同じ3か所です
        </h2>
        <p>
          障害年金の申請でやり直しになったり、実態より軽く判断されたりする原因は、
          意外なほど決まっています。8ステップを読む前に、ここだけ先に知っておくと、
          あとの手間がかなり減ります。
        </p>
        <ol className="guide-traps">
          {TRAPS.map((trap, i) => (
            <li key={trap.title} className="guide-trap">
              <p className="guide-trap-head">
                <span className="guide-trap-no" aria-hidden="true">
                  {i + 1}
                </span>
                <span>{trap.title}</span>
              </p>
              <p>{trap.body}</p>
              <p className="guide-trap-fix">{trap.fix}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* B2. はじめに、知っておいてほしいこと */}
      <section className="guide-section" aria-labelledby="guide-intro-heading">
        <h2 id="guide-intro-heading" className="guide-heading">
          はじめに、知っておいてほしいこと
        </h2>
        <div className="note-box">
          <ul className="guide-intro-list">
            <li>
              障害年金は、病名だけで決まる制度ではありません。
              <strong>初診日・保険料の納付・障害の状態</strong>
              という条件を、順番に確認していきます。
            </li>
            <li>
              <strong>障害者手帳の等級と、障害年金の等級は別物です。</strong>
              制度も判定の基準も違うので、手帳の等級を根拠に諦める必要はありません。
            </li>
            <li>
              必要な書類は、一人ひとりの状況によって変わります。このページは、
              迷わないための<strong>「全体の地図」</strong>としてお使いください。
            </li>
            <li>
              正式な確認は、年金事務所や日本年金機構で行ってください。相談は無料で、
              何度でもできます。
            </li>
          </ul>
        </div>
      </section>

      {/* B3. 受け取れる金額の目安 */}
      <section className="guide-section" aria-labelledby="guide-amount-heading">
        <p className="guide-section-tag">令和8年度(2026年度)</p>
        <h2 id="guide-amount-heading" className="guide-heading">
          受け取れる金額の目安
        </h2>
        <p>
          これからの生活を考えるうえで、まず気になるところだと思います。
          障害基礎年金は等級ごとに決まった額、障害厚生年金は加入期間と報酬に応じて
          一人ひとり変わります(令和8年4月分・6月支給分から)。
        </p>
        <div className="article-table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">等級</th>
                <th scope="col">障害基礎年金(年額)</th>
                <th scope="col">障害厚生年金(年額)</th>
              </tr>
            </thead>
            <tbody>
              {AMOUNT_ROWS.map((row) => (
                <tr key={row.grade}>
                  <th scope="row">{row.grade}</th>
                  <td>{row.kiso}</td>
                  <td>{row.kousei}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="guide-block-list">
          <li>
            障害基礎年金の額は昭和31年4月2日以後生まれの方のものです。
            それ以前に生まれた方は1級1,056,125円・2級844,900円になります。
          </li>
          <li>
            子の加算額は、2人目まで1人につき243,800円、3人目以降は1人につき81,300円です。
          </li>
          <li>
            障害厚生年金の配偶者加給年金額は243,800円、3級の最低保障額は635,500円
            (昭和31年4月1日以前生まれの方は633,700円)です。
          </li>
          <li>
            障害年金には所得税・住民税がかかりません。ただし健康保険の被扶養者の判定などでは、
            収入として扱われることがあります。
          </li>
        </ul>
        <p className="small-note">
          出典:
          日本年金機構「障害基礎年金の受給要件・請求時期・年金額」「障害厚生年金の受給要件・請求時期・年金額」(2026年4月1日更新)
        </p>
      </section>

      {/* C. 8ステップの全体図 */}
      <section
        className="guide-section"
        id="steps"
        aria-labelledby="guide-overview-heading"
      >
        <h2 id="guide-overview-heading" className="guide-heading">
          申請の流れ 8ステップ
        </h2>
        <p>
          全体像です。いまの自分がどのあたりにいるか、確かめながら進めてください。
          各ステップから詳しい説明へ移動できます。
        </p>
        <ol className="guide-overview">
          {STEPS.map((step) => (
            <li key={step.id}>
              <a href={`#${step.id}`}>
                <span className="guide-overview-num" aria-hidden="true">
                  {step.num}
                </span>
                <span className="guide-overview-text">{step.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* D. 各ステップの詳細 */}
      <div className="guide-steps">
        {STEPS.map((step) => (
          <section
            key={step.id}
            id={step.id}
            className="guide-step"
            aria-labelledby={`${step.id}-title`}
          >
            <div className="guide-step-head">
              <span className="guide-step-num" aria-hidden="true">
                {step.num}
              </span>
              <div>
                <p className="guide-step-label">ステップ{step.num}</p>
                <h2 id={`${step.id}-title`} className="guide-step-title">
                  {step.title}
                </h2>
              </div>
            </div>

            <div className="guide-block">
              <p className="guide-block-label">なぜ必要か</p>
              <p>{step.why}</p>
            </div>

            <div className="guide-block">
              <p className="guide-block-label">この段階ですること</p>
              <ul className="guide-block-list">
                {step.todo.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="guide-block">
              <p className="guide-block-label">準備するもの</p>
              <ul className="guide-block-list">
                {step.prepare.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>

            {/* この段階で実際に起きること。制度の説明よりこちらを厚くする。 */}
            <div className="guide-real">
              <p className="guide-real-label">
                実際につまずくのは、こういうところです
              </p>
              <ul className="guide-real-list">
                {step.real.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>

            {/* 申立書のステップだけ、言い換えの例を具体的に置く */}
            {step.id === "step-6" && (
              <div className="guide-block">
                <p className="guide-block-label">
                  書き方を1行変えるだけで伝わる
                </p>
                <ul className="guide-swap">
                  <li>
                    <span className="guide-swap-bad">
                      つらくて家事ができないことが多い
                    </span>
                    <span className="guide-swap-good">
                      入浴は週2回程度。声をかけないと忘れてしまう
                    </span>
                  </li>
                  <li>
                    <span className="guide-swap-bad">買い物に行くのが大変</span>
                    <span className="guide-swap-good">
                      買い物は一人では難しく、家族の付き添いが必要
                    </span>
                  </li>
                  <li>
                    <span className="guide-swap-bad">
                      働いていますが、かなり大変です
                    </span>
                    <span className="guide-swap-good">
                      週3日勤務。指示がないと次の作業に移れず、欠勤も月に数回ある
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {/* 結果待ちのステップだけ、期限をまとめて置く */}
            {step.id === "step-8" && (
              <div className="guide-block">
                <p className="guide-block-label">覚えておきたい期限</p>
                <ul className="guide-deadlines">
                  <li>
                    <b>審査請求</b>
                    <span>処分があったことを知った日の翌日から3か月以内</span>
                  </li>
                  <li>
                    <b>再審査請求</b>
                    <span>
                      決定書の謄本が送付された日の翌日から2か月以内(1か月短い)
                    </span>
                  </li>
                  <li>
                    <b>事後重症請求</b>
                    <span>65歳の誕生日の前々日まで</span>
                  </li>
                  <li>
                    <b>さかのぼれる上限</b>
                    <span>請求した日から5年分まで</span>
                  </li>
                </ul>
              </div>
            )}

            {step.links.length > 0 && (
              <div className="guide-block">
                <p className="guide-block-label">詳しく知りたいとき</p>
                <ul className="guide-links">
                  {step.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step.moreLinks && step.moreLinks.length > 0 && (
              <details className="guide-more">
                <summary>
                  このステップの記事をすべて見る({step.moreLinks.length}本)
                </summary>
                <ul className="guide-links">
                  {step.moreLinks.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {step.columnsAnchor && (
              <p className="guide-stage-columns">
                <Link href={`/columns#${step.columnsAnchor}`}>
                  この段階の記事一覧を見る
                </Link>
              </p>
            )}

            {step.appNote && (
              <div className="guide-inline-cta">
                <p className="guide-inline-cta-title">
                  アプリで準備を進められます
                </p>
                <p>{step.appNote}</p>
                <p>
                  <a
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer external"
                  >
                    無料の申請ガイドをアプリで使う(App Store)
                  </a>
                </p>
              </div>
            )}

            {step.next && (
              <p className="guide-next">
                <a
                  href={`#${step.id.replace(/\d+$/, (n) => String(Number(n) + 1))}`}
                >
                  次へ {step.next}
                </a>
              </p>
            )}
          </section>
        ))}
      </div>

      {/* D2. 途中から来た人のためのショートカット。
          コラム一覧と同じ WORRY_SHORTCUTS を使う(二重管理しない)。 */}
      <section className="guide-section" aria-labelledby="guide-worries-heading">
        <h2 id="guide-worries-heading" className="guide-heading">
          よくある悩みから探す
        </h2>
        <p className="guide-heading-sub small-note">
          申請の途中でつまずいたときは、ここから。
        </p>
        <nav className="worry-nav" aria-label="よくある悩み">
          {WORRY_SHORTCUTS.map((worry) => (
            <Link key={worry.slug} href={`/columns/${worry.slug}`}>
              {worry.label}
            </Link>
          ))}
        </nav>
      </section>

      {/* E. 自分で進めるか、専門家に頼むか */}
      <section className="guide-section" aria-labelledby="guide-choice-heading">
        <h2 id="guide-choice-heading" className="guide-heading">
          自分で進めるか、専門家に頼むか
        </h2>
        <p>
          どちらが正しいということはありません。判断を分けるのは、症状の重さよりも
          「初診日の証明がどれくらい難しいか」と「窓口とのやりとりを体調的にこなせるか」です。
          あてはまる項目が多いほうを目安にしてください。
        </p>
        <div className="guide-choice">
          <div className="guide-choice-col">
            <h3>自分で進めやすい</h3>
            <ul>
              {SELF_OK.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="guide-choice-col">
            <h3>専門家を考えてもいい</h3>
            <ul>
              {CONSIDER_PRO.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="small-note">
          社会保険労務士に依頼する場合は、着手金と、受給が決まったときの成功報酬という組み合わせが一般的です。
          金額の決め方は事務所ごとに違い、さかのぼって受け取る分にも報酬がかかるかどうかで総額が大きく変わります。
          契約の前に、その点を必ず確認してください。
        </p>
        <p>
          →{" "}
          <Link href="/columns/jibun-de-shinsei">
            自分で申請するか、社会保険労務士に依頼するか
          </Link>
        </p>
      </section>

      {/* しんどくなったら */}
      <section
        className="guide-breather"
        aria-labelledby="guide-breather-heading"
      >
        <h2 id="guide-breather-heading">申請の途中で、しんどくなったら</h2>
        <p>
          書類集めの途中で疲れてしまう日があるのは、あなただけではありません。
          年金事務所に何度も行くこと、病院に書類を頼むこと、過去を思い出しながら申立書を書くこと。
          そのどれもが、体力を使います。
        </p>
        <p>
          書類は逃げません。今日は1件だけ電話する、今日は書き出すだけ。
          それでも十分に前へ進んでいます。
        </p>
        <p>
          →{" "}
          <Link href="/columns/shinsei-shindoi">
            「障害年金の申請がしんどい」— 疲れ果てない小分けの進め方
          </Link>
        </p>
      </section>

      {/* 受給後の案内(更新は結果待ちとは分けて案内する) */}
      <section className="guide-section" aria-labelledby="guide-after-heading">
        <h2 id="guide-after-heading" className="guide-heading">
          受給が決まったあとに
        </h2>
        <div className="note-box">
          <p>
            障害年金は、受け取り始めてからも定期的な更新(障害状態確認届)があります。
            更新のときに前回より軽く書かれて等級が下がる、支給が止まる、ということは実際に起こります。
            更新の診断書も、初回と同じように「いまの生活の実態が伝わっているか」を確認してから出してください。
          </p>
          <p>
            症状が重くなったときは額改定請求という方法があり、支給が止まったあとに障害が残っている場合は
            支給停止事由消滅届という手続きがあります。落ち着いたころで構いませんので、
            そういう道があることだけ頭の片隅に置いておいてください。
          </p>
          <p>
            →{" "}
            <Link href="/columns/koushin-kakuninhodo">
              障害年金の更新(障害状態確認届)— 時期と支給停止への備え
            </Link>
          </p>
        </div>
      </section>

      {/* アプリの導線(主役ではなく、申請準備を進めるための道具として) */}
      <section className="guide-app" aria-labelledby="guide-app-heading">
        <p className="guide-section-tag">申請準備の道具</p>
        <h2 id="guide-app-heading" className="guide-heading">
          申請の現在地と、次の一歩を、いつでも手元に
        </h2>
        <p>
          「障害年金申請サポート」は、申請を代行するアプリではありません。
          いまの段階と次にすることを確かめながら、日々の記録・診察メモ・
          申立書の準備を、自分のペースで進めるための道具です。ログイン不要で、
          記録は端末の中に残ります。
        </p>
        <ul className="guide-app-points">
          {APP_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <AppStoreBadge href={APP_STORE_URL} />
        <p className="guide-app-note small-note">
          iOS対応・ログイン不要。申請ガイドと日々の記録は無料で使えます。
        </p>
      </section>

      {/* よくある質問 */}
      <section className="guide-section" aria-labelledby="guide-faq-heading">
        <h2 id="guide-faq-heading" className="guide-heading">
          よくある質問
        </h2>
        <p className="guide-heading-sub small-note">
          多くの方が最初に不安に感じるところと、誤解されやすいところをまとめました。
        </p>
        <div className="guide-faq">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="guide-faq-item">
              <summary>{item.q}</summary>
              <p className="guide-faq-a">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 主要テーマの柱ページへの導線。公開済みのものだけが並び、
          1本も無いうちはセクションごと出ない。 */}
      {MORE_PILLARS.length > 0 && (
        <section
          className="guide-section"
          aria-labelledby="guide-pillars-heading"
        >
          <h2 id="guide-pillars-heading" className="guide-heading">
            もっと詳しく知る
          </h2>
          <p className="guide-heading-sub small-note">
            申請の流れとは別に、テーマごとの全体像をまとめたページです。
          </p>
          <ul className="guide-links">
            {MORE_PILLARS.map((cluster) => (
              <li key={cluster.id}>
                <Link href={cluster.pillarPath}>{cluster.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 悩み別インデックス(サイト内リンクはここに集約する) */}
      <section className="guide-section" aria-labelledby="guide-index-heading">
        <h2 id="guide-index-heading" className="guide-heading">
          悩み別のくわしい記事
        </h2>
        <p className="guide-heading-sub small-note">
          全{COLUMNS.length}本を、つまずく場面ごとにまとめました。
          いま必要なところだけ開いてください。
        </p>
        <div className="guide-index">
          {CATEGORY_ORDER.map((category) => {
            const items = columnsInCategory(category);
            if (items.length === 0) return null;
            return (
              <details key={category} className="guide-index-group">
                <summary>
                  <span>{category}</span>
                  <span className="guide-index-count">{items.length}本</span>
                </summary>
                <ul className="guide-index-list">
                  {items.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/columns/${c.slug}`}>{c.title}</Link>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
        <p className="lp-columns-more">
          <Link href="/columns" className="lp-columns-more-link">
            コラム一覧を見る
          </Link>
        </p>
      </section>

      {/* 出典・免責 */}
      <div className="note-box">
        <p>
          ※本ページは一般的な情報提供です。必要書類や手続きの詳細は個別の状況により
          異なります。正式な内容は、日本年金機構の「
          <a
            href="https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/index.html"
            target="_blank"
            rel="noopener"
          >
            障害年金の制度
          </a>
          」および年金事務所でご確認ください。
        </p>
        <p className="small-note">
          ステップ8で触れた不支給の割合は、厚生労働省年金局「令和6年度の障害年金の認定状況についての調査報告書」(2025年6月公表)によります。
        </p>
      </div>
    </>
  );
}
