import type { Metadata } from "next";
import DiseaseHub, { type DiseaseHubData } from "@/components/platform/DiseaseHub";
import { SAIKETSU_CASES } from "@/lib/saiketsu";
import { pageMetadata } from "@/lib/seo";

const TITLE = "うつ病・双極性障害の障害年金｜審査のポイントと実例";
const DESCRIPTION = "うつ病・双極性障害は障害年金の対象です。審査で見られる生活の実態、働いている場合の考え方、公開裁決例、よくあるつまずきをまとめました。";
const SHOW_LISTINGS = false;

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/byoki/utsu-soukyoku" });

const caseIds = ["h28_29-07_09", "r02_03-12_08", "h30_r01-07_01"];
const cases = caseIds.flatMap((id) => SAIKETSU_CASES.filter((item) => item.id === id));

const data: DiseaseHubData = {
  name: "うつ病・双極性障害",
  answer: "うつ病も双極性障害も、障害年金の対象です。",
  intro: "新しく受け取り始める人の約7割は、精神の障害の診断書で申請しています。精神疾患での申請は特別なことではなく、いちばん標準的なケースです。働いていても対象になる場合があります。",
  source: "厚生労働省・認定状況調査（令和6年度）",
  points: [
    { title: "「今日の状態」だけでは決まらない", copy: "気分障害は波のある病気として、良いときと悪いときの両方を含む「経過」で判断されます。診察の日にたまたま調子が良くても、それだけで軽いとはされません。普段の大変なときも伝わっていることが前提です。" },
    { title: "診断書は「ひとり暮らし・援助なし」を想定して評価される", copy: "家族に助けてもらって「できている」ことは、「援助があればできる」として評価されます。誰が・何を・どのくらい助けているかを、診察で具体的に伝えてください。" },
    { title: "働いていることだけで、等級は決まらない", copy: "国のガイドラインに「労働に従事していることをもって、直ちに日常生活能力が向上したものと捉えない」と明記されています。見られるのは仕事の中身——職場の配慮、勤務日数、帰宅後の消耗です。", source: "精神の障害に係る等級判定ガイドライン" },
    { title: "薬を飲んでいない理由は、必ず伝える", copy: "「服薬なし」とだけ書かれると事情が伝わりません。医師の方針・副作用・体質などの理由があるなら、診察でも書類でも明示を。双極性障害では「躁のとき」の様子も伝わってこそ全体像を評価できます。" },
  ],
  cases,
  stumbles: [
    { title: "調子のいい日に診察へ行き、「大丈夫です」と答えてしまう。", copy: "診断書は診察室で把握できた情報をもとに書かれます。普段の大変なときを、紙に書いて手元で見るだけでも伝えやすくなります。" },
    { title: "双極性障害で、躁のときのことを話していない。", copy: "躁を「調子がいい」と感じて伝えないと、病気の全体像が診断書に反映されません。家族のメモも材料になります。" },
    { title: "できあがった診断書を、確認せずに提出してしまう。", copy: "チェック項目が実態と合っているか、提出前に確認するのはあなたの権利です。事実と違う場合は主治医へ確認できます。" },
    { title: "最初に行ったのが内科だったので、関係ないと思っていた。", copy: "不眠や頭痛での内科受診が「初診日」になることがあります。初診日は精神科とは限りません。" },
  ],
  faqs: [
    { question: "精神障害者保健福祉手帳を持っていませんが、申請できますか？", answer: "できます。手帳と年金は別の制度で、審査も等級も連動しません。" },
    { question: "傷病手当金をもらっています。障害年金と両方もらえますか？", answer: "同時に満額は受け取れず、調整があります。ただし傷病手当金の受給中でも障害年金の申請はできます。" },
    { question: "休職中です。退職してから申請すべきですか？", answer: "退職を待つ必要はありません。休職中でも申請でき、手続きに勤務先は関与しません。会社に自動的に伝わることもありません。" },
  ],
  related: [
    { href: "/columns/hitsuyou-shorui-seishin", label: "精神疾患の申請に必要な書類" },
    { href: "/columns/shindansho-ishi-ni-tsutaeru", label: "生活の実態を主治医に伝える" },
    { href: "/columns/nichijo-seikatsu-7koumoku", label: "診断書の「日常生活能力」7項目" },
    { href: "/columns/tokyu-hantei-guideline", label: "精神の障害の等級判定ガイドライン" },
    { href: "/columns/moushitatesho-kakikata", label: "精神疾患の申立書の書き方" },
    { href: "/columns/hatarakinagara", label: "働きながら申請するときの見られ方" },
    { href: "/columns/shindansho-kakunin", label: "診断書を受け取ったあとの確認" },
  ],
};

export default function UtsuSoukyokuPage() {
  return <DiseaseHub data={data} showListings={SHOW_LISTINGS} />;
}
