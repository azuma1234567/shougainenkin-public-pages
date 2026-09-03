/* /dougu/shorui「必要書類チェックリスト」の質問・書類データ。
   docs/shorui-tool-design-2026-09-02.md と docs/site-mock-2026-09-02-tools/Shorui.html が正。
   分岐(when)はモックのまま。1行も変えていない。

   §6 の照合(2026-09-03、日本年金機構の公式ページから転記):
   - 年金請求書は制度で様式が2つある。様式第107号(障害基礎年金)/様式第104号(障害厚生年金)。
   - 診断書8種の正式名称と対象は公式ページから転記した。
     **様式番号は機構の公式ページにもPDFのテキストにも記載がない**ため、空欄のままにした(推測で書かない)。
   - 様式PDFは自サイトに置かず、機構の公式ページへ直リンクする(改定時に古い様式が残る事故を防ぐ)。
     PDFの直リンクではなくページへリンクしているのは、PDFのファイル名が改定で変わるため。 */

export type ShoruiAnswers = {
  seido?: 'kokumin' | 'kousei' | 'fumei';
  hatachi?: 'mae' | 'ato' | 'fumei';
  /* 'honrai' は 2026-09-03 に選択肢から外れて到達しなくなったので型からも消した。
     when の === 'sokyuu' は変えていない。 */
  kata?: 'jigo' | 'sokyuu' | 'mitei';
  shurui?: 'seishin' | 'shitai' | 'me' | 'kikaku' | 'naibu' | 'ketsueki' | 'sonota';
  byouin?: 'onaji' | 'chigau' | 'karute' | 'fumei';
  kazoku: string[];
  jiko?: 'hai' | 'iie';
};

export const emptyShoruiAnswers = (): ShoruiAnswers => ({ kazoku: [] });

export type ShoruiQuestion = {
  id: keyof ShoruiAnswers;
  t: string;
  multi?: boolean;
  o: [string, string][];
};

export const SHORUI_QUESTIONS: ShoruiQuestion[] = [
  { id: 'seido', t: '初診日のとき、会社員でしたか(厚生年金)', o: [['kousei', 'はい'], ['kokumin', 'いいえ'], ['fumei', 'わからない']] },
  { id: 'shurui', t: '診断書を書いてもらう障害は', o: [['seishin', '精神'], ['shitai', '肢体'], ['me', '眼'], ['kikaku', '聴覚・言語'], ['naibu', '内部(心臓・腎臓など)'], ['ketsueki', '血液'], ['sonota', 'その他']] },
  { id: 'byouin', t: '初診の病院と、いま診断書を書いてもらう病院は', o: [['onaji', '同じ'], ['chigau', '違う'], ['karute', '違ううえ、カルテが無いと言われた'], ['fumei', 'わからない']] },
  { id: 'kazoku', t: '家族(あてはまるものすべて)', multi: true, o: [['ko', '18歳までの子がいる'], ['haigu', '65歳未満の配偶者がいる'], ['nashi', 'どちらもいない']] },
  { id: 'kata', t: '初診日から1年6か月たった頃の状態も書いて、さかのぼって請求しますか', o: [['sokyuu', 'する'], ['jigo', 'しない'], ['mitei', 'まだ決めていない']] },
  { id: 'jiko', t: '交通事故など、ほかの人の行為が原因ですか', o: [['hai', 'はい'], ['iie', 'いいえ']] },
  { id: 'hatachi', t: '初診日は20歳より前ですか', o: [['mae', '20歳より前'], ['ato', '20歳以降'], ['fumei', 'わからない']] },
];

/* 機構の公式ページ。PDFではなくページへ張る(様式改定でPDF名が変わるため)。 */
const NENKIN = 'https://www.nenkin.go.jp/shinsei/jukyu/shougai/';
export const SHORUI_URLS = {
  kisoSeikyuu: `${NENKIN}20180305.html`,          // 年金請求書(国民年金障害基礎年金) 様式第107号
  kouseiSeikyuu: `${NENKIN}shougaikousei.html`,   // 年金請求書(国民年金・厚生年金保険障害給付) 様式第104号
  moushitate: `${NENKIN}shindansho/20140516.html`,
  jushinjokyo: `${NENKIN}shindansho/20140421-20.html`, // 受診状況等証明書 / 同・添付できない申立書
  daisansha: `${NENKIN}shindansho/2018042601.html`,
  shindanshoIndex: `${NENKIN}shindansho/index.html`,
} as const;

/* 診断書8種。正式名称・対象・公式ページは §6 で転記。様式番号は公式に記載が無いので持たない。 */
export const SHINDANSHO_FORMS: { key: ShoruiAnswers['shurui']; name: string; url: string }[] = [
  { key: 'me', name: '診断書(眼の障害用)', url: `${NENKIN}shindansho/20140421-22.html` },
  { key: 'kikaku', name: '診断書(聴覚・鼻腔機能・平衡感覚・そしゃく・嚥下・言語機能の障害用)', url: `${NENKIN}shindansho/20140421-17.html` },
  { key: 'shitai', name: '診断書(肢体の障害用)', url: `${NENKIN}shindansho/20140421-18.html` },
  { key: 'seishin', name: '診断書(精神の障害用)', url: `${NENKIN}shindansho/20140421-23.html` },
  { key: 'ketsueki', name: '診断書(血液・造血器・その他の障害用)', url: `${NENKIN}shindansho/20140421-16.html` },
];
/* 内部(心臓・腎臓・肝臓・呼吸器・糖尿病)は公式でも3つの様式に分かれている。 */
export const SHINDANSHO_NAIBU: { name: string; url: string }[] = [
  { name: '診断書(呼吸器疾患の障害用)', url: `${NENKIN}shindansho/20140421-21.html` },
  { name: '診断書(循環器疾患の障害用)', url: `${NENKIN}shindansho/20140603.html` },
  { name: '診断書(腎疾患・肝疾患・糖尿病の障害用)', url: `${NENKIN}shindansho/20150416.html` },
];

export type ShoruiDoc = {
  id: string; sec: string; n: string; where: string;
  fee: 'byouin' | 'yakusho' | null;
  wait: 'byouin' | null;
  stuck: string;
  url?: string;
  tool?: [string, string];
  always?: true;
  when?: (s: ShoruiAnswers) => boolean;
  why?: string;
};

export const SHORUI_DOCS: ShoruiDoc[] = [
  { id: 'seikyuusho', sec: '年金事務所・市区町村でもらう', n: '年金請求書(障害給付)',
    where: '年金事務所・市区町村の窓口', fee: null, wait: null,
    stuck: '様式が複数あります。窓口で「障害年金の請求書」と伝えると出してもらえます。', url: SHORUI_URLS.kisoSeikyuu, always: true },
  { id: 'moushitate', sec: '自分で書く', n: '病歴・就労状況等申立書',
    where: '様式は年金事務所・機構のサイト', fee: null, wait: null,
    stuck: 'いちばん重い書類です。発病から今日まで、期間をあけずに書きます。',
    tool: ['申立書をつくる', '/dougu/moushitatesho'], url: SHORUI_URLS.moushitate, always: true },
  { id: 'shindansho', sec: '病院でもらう', n: '診断書',
    where: 'いま診てもらっている病院', fee: 'byouin', wait: 'byouin',
    stuck: '障害の種類ごとに様式が違います。先に様式を確定してから依頼してください。', url: SHORUI_URLS.shindanshoIndex, always: true },
  { id: 'shindansho2', sec: '病院でもらう', n: '診断書(障害認定日ころのもの・2通目)',
    where: '当時かかっていた病院', fee: 'byouin', wait: 'byouin',
    stuck: '当時の病院に依頼します。カルテが残っているかを先に電話で確認してください。', url: SHORUI_URLS.shindanshoIndex,
    when: (s) => s.kata === 'sokyuu', why: 'さかのぼる請求のため' },
  { id: 'jushinjokyo', sec: '病院でもらう', n: '受診状況等証明書',
    where: 'いちばん最初にかかった病院', fee: 'byouin', wait: 'byouin',
    stuck: '初診の病院と診断書の病院が同じなら要りません。', url: SHORUI_URLS.jushinjokyo,
    when: (s) => ['chigau', 'karute', 'fumei'].includes(s.byouin ?? ''), why: '初診の病院が違うため' },
  { id: 'tenpudekinai', sec: '自分で書く', n: '受診状況等証明書が添付できない申立書',
    where: '様式は機構のサイト', fee: null, wait: null,
    stuck: 'お薬手帳・診察券・領収書など、当時が分かる資料を一緒に出します。', url: SHORUI_URLS.jushinjokyo,
    when: (s) => s.byouin === 'karute', why: 'カルテが残っていないため' },
  { id: 'daisansha', sec: '人に書いてもらう', n: '第三者証明',
    where: '当時を知る、三親等以内でない人', fee: null, wait: null,
    stuck: '親・きょうだいには頼めません。友人・隣人・先生・同僚・民生委員などに、原則2人分。', url: SHORUI_URLS.daisansha,
    when: (s) => s.byouin === 'karute', why: 'カルテが残っていないため' },
  { id: 'nenkintechou', sec: '手元にあるもの', n: '基礎年金番号がわかるもの',
    where: '基礎年金番号通知書・年金手帳・マイナンバーカード', fee: null, wait: null,
    stuck: '見つからないときは、年金事務所で調べてもらえます。', always: true },
  { id: 'kouza', sec: '手元にあるもの', n: '受取先の口座がわかるもの',
    where: '通帳・キャッシュカード', fee: null, wait: null,
    stuck: '本人名義の口座です。', always: true },
  { id: 'honnin', sec: '手元にあるもの', n: '本人確認書類',
    where: 'マイナンバーカード・運転免許証など', fee: null, wait: null, stuck: '', always: true },
  { id: 'koseki', sec: '役所でもらう', n: '戸籍謄本',
    where: '本籍地の市区町村', fee: 'yakusho', wait: null,
    stuck: '請求日より前6か月以内のものを求められることがあります。取る時期に注意。',
    when: (s) => s.kazoku.includes('ko') || s.kazoku.includes('haigu'), why: '子・配偶者の加算のため' },
  { id: 'juminhyou', sec: '役所でもらう', n: '世帯全員の住民票',
    where: 'お住まいの市区町村', fee: 'yakusho', wait: null,
    stuck: 'マイナンバーの記載の有無を、窓口で確認してください。',
    when: (s) => s.kazoku.includes('ko') || s.kazoku.includes('haigu'), why: '生計を同じくしていることの確認' },
  { id: 'zaigaku', sec: '学校でもらう', n: '在学証明書または学生証の写し',
    where: '子が通っている学校', fee: null, wait: null,
    stuck: '高校生の子がいる場合です。',
    when: (s) => s.kazoku.includes('ko'), why: '子の加算のため' },
  { id: 'haigushotoku', sec: '役所でもらう', n: '配偶者の所得を証明するもの',
    where: 'お住まいの市区町村', fee: 'yakusho', wait: null,
    stuck: '',
    when: (s) => s.kazoku.includes('haigu'), why: '配偶者の加算のため' },
  { id: 'honninshotoku', sec: '役所でもらう', n: '本人の所得を確認する書類',
    where: 'お住まいの市区町村', fee: 'yakusho', wait: null,
    stuck: '20歳前に初診日がある場合は、本人の前年所得に制限があります(親や配偶者の収入は関係ありません)。',
    when: (s) => s.hatachi === 'mae', why: '20歳前傷病の所得制限のため' },
  { id: 'jikojoukyou', sec: '年金事務所でもらう', n: '第三者行為事故状況届 ほか',
    where: '年金事務所', fee: null, wait: null,
    stuck: '事故証明書などが一緒に必要になります。窓口で一式を確認してください。',
    when: (s) => s.jiko === 'hai', why: '第三者の行為が原因のため' },
  { id: 'kanyuukikan', sec: '年金事務所でもらう', n: '年金加入期間確認通知書',
    where: '共済組合', fee: null, wait: null,
    stuck: '公務員・私学共済などの加入歴がある場合です。',
    when: (s) => s.seido === 'kousei', why: '共済の加入歴がある場合' },
];

export const SHORUI_MOCHIMONO = [
  '予約した日時のメモ(予約は電話かネットで。当日いきなり行くと待つことがあります)',
  '基礎年金番号がわかるもの',
  '本人確認書類',
  '印鑑(原則不要になりましたが、念のため)',
  'このチェックリストを印刷したもの',
  '書きかけの申立書(そのままでかまいません。見てもらえます)',
  'お薬手帳・診察券(初診日の手がかりになります)',
  '聞きたいことを書いたメモ',
];

/* §7 窓口で聞くこと。そのまま実装する。 */
export const SHORUI_ASK: { text: string; strong?: true }[] = [
  { text: '私の初診日は、この日で問題ありませんか' },
  { text: '納付要件は満たしていますか(記録を見てもらう)' },
  { text: '診断書はどの様式になりますか' },
  { text: 'さかのぼる請求と、いまの請求の両方の形で出せますか', strong: true },
  { text: 'この書類で、足りないものはありますか' },
  { text: '提出したあと、結果はいつごろ、どう届きますか' },
  { text: '年金生活者支援給付金の請求書は入っていますか' },
];

export const SHORUI_STORAGE_KEY = 'shougainenkin-note:shorui:v1';
