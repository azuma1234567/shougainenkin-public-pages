/* /ads/sharoushi の申込みフォームの、画面に依存しない部分(検証・メール本文・mailto の組み立て)。
   docs/claude-code-ads-sharoushi-2026-09-16-instructions.md §3。
   components/ads/SharoushiApplyForm.tsx が使い、tests/sharoushi-apply.test.mjs が node で検証する。 */
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";

export type Form = {
  office: string;
  person: string;
  regno: string;
  kai: string;
  pref: string;
  city: string;
  areas: string[];
  ways: string[];
  flags: string[];
  topics: string[];
  kinds: string[];
  fee_start: string;
  fee_success: string;
  fee_note: string;
  fee_fail: string;
  fee_appeal: string;
  tel: string;
  mail: string;
  url: string;
  note: string;
  draft: string;
  source: string;
  agree: boolean;
};

export const EMPTY_FORM: Form = {
  office: "", person: "", regno: "", kai: "", pref: "", city: "",
  areas: [], ways: [], flags: [], topics: [], kinds: [],
  fee_start: "", fee_success: "", fee_note: "", fee_fail: "", fee_appeal: "",
  tel: "", mail: "", url: "", note: "", draft: "", source: "", agree: false,
};

/* 検証の誤り。key は入力欄(または群)と aria-describedby で結ぶための名前。 */
export type FieldError = { key: string; message: string };

export const FEE_LABELS = [
  ["fee_start", "着手金"],
  ["fee_success", "成功報酬の計算方法"],
  ["fee_fail", "不支給のときの費用"],
  ["fee_appeal", "審査請求まで含むか"],
] as const;

export function validate(f: Form): FieldError[] {
  const e: FieldError[] = [];
  const t = (s: string) => s.trim();
  if (!t(f.office)) e.push({ key: "office", message: "事務所名を入力してください" });
  if (!t(f.person)) e.push({ key: "person", message: "代表者名を入力してください" });
  if (!/^[0-9-]{4,}$/.test(t(f.regno))) e.push({ key: "regno", message: "社労士登録番号を半角数字で入力してください" });
  if (!f.kai) e.push({ key: "kai", message: "所属する社労士会を選んでください" });
  if (!f.pref || !t(f.city)) e.push({ key: "address", message: "所在地(都道府県と市区町村)を入力してください" });
  if (f.areas.length === 0) e.push({ key: "areas", message: "対応地域を1つ以上選んでください" });
  if (f.ways.length === 0) e.push({ key: "ways", message: "相談のしかたを1つ以上選んでください" });
  if (f.topics.length === 0) e.push({ key: "topics", message: "対応できる相談を1つ以上選んでください" });
  if (f.kinds.length === 0) e.push({ key: "kinds", message: "得意な障害の種類を1つ以上選んでください" });
  for (const [key, label] of FEE_LABELS) if (!f[key]) e.push({ key, message: `${label}を選んでください` });
  if (!t(f.tel) && !t(f.mail) && !t(f.url)) e.push({ key: "contact", message: "連絡先を1つ以上入力してください" });
  if (t(f.tel) && !/^[0-9-]+$/.test(t(f.tel))) e.push({ key: "tel", message: "電話番号は半角数字とハイフンで入力してください" });
  if (t(f.mail) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t(f.mail))) e.push({ key: "mail", message: "メールアドレスの形式を確認してください" });
  if (t(f.url) && !/^https:\/\//.test(t(f.url))) e.push({ key: "url", message: "事務所サイトのURLは https:// から入力してください" });
  if (!f.draft) e.push({ key: "draft", message: "原稿の作り方を選んでください" });
  if (!f.agree) e.push({ key: "agree", message: "規約への同意にチェックしてください" });
  return e;
}

/* 端末のローカル日付を YYYY-MM-DD で。toISOString は UTC なので日本の深夜に日付がずれる。 */
export function todayYmd(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/* メール本文(§3-3 の形式)。 */
export function buildBody(f: Form, date = todayYmd()): string {
  const t = (s: string) => s.trim();
  const j = (a: string[]) => (a.length ? a.join("、") : "なし");
  return `${SITE_NAME} 掲載申込み

■事務所名: ${t(f.office)}
■代表者名: ${t(f.person)}
■社労士登録番号: ${t(f.regno)}
■所属会: ${f.kai ? `${f.kai}社会保険労務士会` : ""}
■所在地: ${f.pref} ${t(f.city)}
■対応地域: ${j(f.areas)}
■相談のしかた: ${j(f.ways)}
■相談の条件: ${j(f.flags)}
■対応できる相談: ${j(f.topics)}
■得意な障害の種類: ${j(f.kinds)}
■料金の型:
  着手金: ${f.fee_start}
  成功報酬: ${f.fee_success}${t(f.fee_note) ? `(${t(f.fee_note)})` : ""}
  不支給のとき: ${f.fee_fail}
  審査請求: ${f.fee_appeal}
■連絡先:
  電話: ${t(f.tel)}
  メール: ${t(f.mail)}
  サイト: ${t(f.url)}
■一言: ${t(f.note)}
■原稿: ${f.draft}
■知ったきっかけ: ${f.source}
■規約への同意: あり(${date})`;
}

export function buildSubject(f: Form): string {
  return `【掲載申込み】${f.office.trim()}（${f.pref}）`;
}

/* mailto: の URL。改行は %0D%0A(§3-2)。 */
export function buildMailto(subject: string, body: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body).replace(/%0A/g, "%0D%0A")}`;
}

/* 主ボタンで開くメールの本文。入力内容はクリップボードに入れ、メール本文には貼り付けの案内だけを置く
   (日本語は URL 符号化で1文字9文字になり、入力内容を本文に入れると mailto が長すぎるため)。入力値は含めない。 */
export const MAILTO_BODY = `${SITE_NAME} 掲載申込み
この下に、コピー済みの申込み内容を貼り付けてください(Windows: Ctrl+V / Mac: Cmd+V)。
貼り付けられない場合は、ページの「本文をコピーする」からもう一度コピーできます。`;
