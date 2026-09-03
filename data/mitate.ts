/* 「等級の目安をしらべる」= /dougu/mitate の定数。
   出典: 精神の障害に係る等級判定ガイドライン(平成28年9月・厚生労働省/日本年金機構)
        https://www.mhlw.go.jp/file/04-Houdouhappyou-12512000-Nenkinkyoku-Jigyoukanrika/0000130045.pdf
   目安表・7項目・程度は、アプリ repo の src/lib/mitateCore.ts をそのまま移植した
   (docs/mitate-tool-design-2026-09-02.md §5-1。定数名・関数名を変えないこと)。
   §7 の引用は原本PDFから転記し、scripts/verify-mitate/ で1字一致を機械検査している。
   このファイルは判定しない。国が公表している表と本文を持つだけ。 */

/* ================= 日常生活能力の判定(7項目) =================
   診断書様式の並び順そのまま。**あとから並べ替えない**。 */
export const MITATE_ABILITY_ITEMS = [
  { id: 'meal', label: '適切な食事' },
  { id: 'hygiene', label: '身辺の清潔保持' },
  { id: 'money', label: '金銭管理と買い物' },
  { id: 'medical', label: '通院と服薬' },
  { id: 'communication', label: '他人との意思伝達及び対人関係' },
  { id: 'safety', label: '身辺の安全保持及び危機対応' },
  { id: 'social', label: '社会性' },
] as const;

export type MitateAbilityItemId = (typeof MITATE_ABILITY_ITEMS)[number]['id'];

/* 4段階。ガイドラインの「程度の軽いほうから1〜4の数値に置き換え」(表1《表の見方》2)。
   数値の向きを反転させない。 */
export type MitateAbilityValue = 1 | 2 | 3 | 4;

export const MITATE_ABILITY_CHOICES: { value: MitateAbilityValue; label: string }[] = [
  { value: 1, label: 'できる' },
  { value: 2, label: 'おおむねできるが時には助言や指導を必要とする' },
  { value: 3, label: '助言や指導があればできる' },
  { value: 4, label: '助言や指導をしてもできない若しくは行わない' },
];

/* ================= 日常生活能力の程度(5段階) ================= */
export type MitateDegree = 1 | 2 | 3 | 4 | 5;

export const MITATE_DEGREE_CHOICES: { value: MitateDegree; label: string }[] = [
  { value: 1, label: '(1) 精神障害を認めるが、社会生活は普通にできる' },
  { value: 2, label: '(2) 家庭内での日常生活は普通にできるが、社会生活には援助が必要' },
  { value: 3, label: '(3) 家庭内での単純な日常生活はできるが、時に応じて援助が必要' },
  { value: 4, label: '(4) 日常生活における身のまわりのことも、多くの援助が必要' },
  { value: 5, label: '(5) 身のまわりのことはほとんどできないため、常時の援助が必要' },
];

/* ================= 表1「障害等級の目安」 =================
   原本 PDF(7ページ目 / 紙面 -5-)の表1と全セルを座標で照合済み。
   PDFのテキスト抽出は空欄セルが落ちて行が左へ詰まるため、抽出結果をそのまま信じない。
   照合方法: PyMuPDF で語の x 座標を取り、列の中心
   (5)=172.6 / (4)=253.9 / (3)=335.2 / (2)=416.6 / (1)=497.9 に割り当てる。
   再現: npm run verify:mitate (scripts/verify-mitate/table.py)

   null = 原表の空欄。空欄は情報が無いのではなく「判定と程度の整合性が低い」ことを意味する
   (ガイドライン 第3-3-(1)-① が診断書作成医への内容確認等を求めている)。 */
export type MitateGrade =
  | '1級'
  | '1級又は2級'
  | '2級'
  | '2級又は3級'
  | '3級'
  | '3級又は3級非該当'
  | '3級非該当';

/* 行の区分。min は以上(含む)、max は未満(含まない)。max が null の行は上限なし。 */
export const MITATE_AVERAGE_BANDS: { label: string; min: number; max: number | null }[] = [
  { label: '3.5以上', min: 3.5, max: null },
  { label: '3.0以上3.5未満', min: 3.0, max: 3.5 },
  { label: '2.5以上3.0未満', min: 2.5, max: 3.0 },
  { label: '2.0以上2.5未満', min: 2.0, max: 2.5 },
  { label: '1.5以上2.0未満', min: 1.5, max: 2.0 },
  { label: '1.5未満', min: 0, max: 1.5 },
];

/* 各行 [程度(1), 程度(2), 程度(3), 程度(4), 程度(5)]。原本の列は (5)〜(1) の並びだが、
   添字と程度の数値をそろえるため昇順で持つ。 */
export const MITATE_GRADE_TABLE: Record<string, (MitateGrade | null)[]> = {
  //                 程度(1)      程度(2)              程度(3)        程度(4)       程度(5)
  '3.5以上': [null, null, null, '1級又は2級', '1級'],
  '3.0以上3.5未満': [null, null, '2級', '2級', '1級又は2級'],
  '2.5以上3.0未満': [null, null, '2級又は3級', '2級', null],
  '2.0以上2.5未満': [null, '3級又は3級非該当', '2級又は3級', '2級', null],
  '1.5以上2.0未満': [null, '3級又は3級非該当', '3級', null, null],
  '1.5未満': ['3級非該当', '3級非該当', null, null, null],
};

/* ================= 障害の種類(入口のふるい分け) ================= */
export type MitateKind = 'seishin' | 'chiteki' | 'hattatsu' | 'other';

export const MITATE_KINDS: { value: MitateKind; label: string }[] = [
  { value: 'seishin', label: '精神の障害(うつ病・双極性障害・統合失調症・不安障害 など)' },
  { value: 'chiteki', label: '知的障害' },
  { value: 'hattatsu', label: '発達障害(ASD・ADHD など)' },
  { value: 'other', label: 'それ以外(身体・内部疾患・がん・難病 など)' },
];

/* A=診断書が手元にある / B=まだない */
export type MitateMode = 'A' | 'B';
/* 初診日に加入していた制度(任意) */
export type MitateSeido = 'kokumin' | 'kousei' | 'fumei';

export const MITATE_SEIDO_CHOICES: { value: MitateSeido; label: string }[] = [
  { value: 'kokumin', label: '国民年金(自営・学生・無職・扶養に入っていた など)' },
  { value: 'kousei', label: '厚生年金(会社員・公務員)' },
  { value: 'fumei', label: 'わからない' },
];

/* ================= 総合評価の質問 =================
   quote は〔表２〕総合評価の際に考慮すべき要素の例からの**原文**。
   全角の数字・記号も原本のまま(1字一致を機械検査するため)。省略はしていない。 */
export type MitateGuideDirection = 'up' | 'eq';
export type MitateGuideItem = {
  id: string;
  question: string;
  quote: string;
  source: string;
  direction: MitateGuideDirection;
};

export const MITATE_GUIDE_COMMON: MitateGuideItem[] = [
  { id: 'g1', question: '就労継続支援A型・B型、就労移行支援、障害者雇用制度を利用して働いている',
    quote: '就労系障害福祉サービス（就労継続支援Ａ型、就労継続支援Ｂ型）及び障害者雇用制度による就労については、１級または２級の可能性を検討する。就労移行支援についても同様とする。',
    source: '第3 総合評価 ④就労状況(共通事項)', direction: 'up' },
  { id: 'g2', question: '一般企業だが、障害者雇用と同じくらいの援助・配慮を受けている',
    quote: '障害者雇用制度を利用しない一般企業や自営・家業等で就労している場合でも、就労系障害福祉サービスや障害者雇用制度における支援と同程度の援助を受けて就労している場合は、２級の可能性を検討する。',
    source: '第3 総合評価 ④就労状況(共通事項)', direction: 'up' },
  { id: 'g3', question: 'ひとり暮らしだが、家族や福祉サービスの援助を受けている(いまは受けていないが、必要な状態も含む)',
    quote: '独居であっても、日常的に家族等の援助や福祉サービスを受けることによって生活できている場合（現に家族等の援助や福祉サービスを受けていなくても、その必要がある状態の場合も含む）は、それらの支援の状況（または必要性）を踏まえて、２級の可能性を検討する。',
    source: '第3 総合評価 ③生活環境(共通事項)', direction: 'up' },
  { id: 'g4', question: '施設・グループホーム・援助できる家族との同居で、生活が安定している',
    quote: '入所施設やグループホーム、日常生活上の援助を行える家族との同居など、支援が常態化した環境下では日常生活が安定している場合でも、単身で生活するとしたときに必要となる支援の状況を考慮する。',
    source: '第3 総合評価 ③生活環境(共通事項)', direction: 'up' },
  { id: 'g5', question: '在宅で、家族や重度訪問介護などから常時の援助を受けている',
    quote: '在宅で、家族や重度訪問介護等から常時援助を受けて療養している場合は、１級または２級の可能性を検討する。',
    source: '第3 総合評価 ②療養状況(精神障害)', direction: 'up' },
  { id: 'g6', question: '入院していて、安全の確保のために常時の個別の援助が必要',
    quote: '病棟内で、本人の安全確保などのために、常時個別の援助が継続して必要な場合は、１級の可能性を検討する。',
    source: '第3 総合評価 ②療養状況(精神障害)', direction: 'up' },
  { id: 'g7', question: '欠勤・早退・遅刻が多い',
    quote: '精神障害による出勤状況への影響（頻回の欠勤・早退・遅刻など）を考慮する。',
    source: '第3 総合評価 ④就労状況(精神障害)', direction: 'up' },
  { id: 'g8', question: '仕事のあと、家では何もできない状態が続く',
    quote: '就労の影響により、就労以外の場面での日常生活能力が著しく低下していることが客観的に確認できる場合は、就労の場面及び就労以外の場面の両方の状況を考慮する。',
    source: '第3 総合評価 ④就労状況(共通事項)', direction: 'up' },
];

export const MITATE_GUIDE_SEISHIN: MitateGuideItem[] = [
  { id: 's1', question: '意欲の低下や感情の平板化(陰性症状)が長く続いている',
    quote: '陰性症状（残遺状態）が長期間持続し、自己管理能力や社会的役割遂行能力に著しい制限が認められれば、１級または２級の可能性を検討する。',
    source: '第3 総合評価 ①現在の病状又は状態像(精神障害)', direction: 'up' },
  { id: 's2', question: '治療をしても、重いうつや躁が長く続く/何度もくり返している',
    quote: '適切な治療を行っても症状が改善せずに、重篤なそうやうつの症状が長期間持続したり、頻繁に繰り返している場合は、１級または２級の可能性を検討する。',
    source: '第3 総合評価 ①現在の病状又は状態像(精神障害)', direction: 'up' },
  { id: 's3', question: '1年以上働いているが、休みがちだったり援助を受け続けている',
    quote: '１年を超えて就労を継続できていたとしても、その間における就労の頻度や就労を継続するために受けている援助や配慮の状況も踏まえ、就労の実態が不安定な場合は、それを考慮する。',
    source: '第3 総合評価 ④就労状況(精神障害)', direction: 'up' },
  { id: 's4', question: '職場で臨機応変な対応や意思疎通が難しい',
    quote: '仕事場での臨機応変な対応や意思疎通に困難な状況が見られる場合は、それを考慮する。',
    source: '第3 総合評価 ④就労状況(精神障害)', direction: 'up' },
];

export const MITATE_GUIDE_CHITEKI: MitateGuideItem[] = [
  { id: 'c1', question: '療育手帳の判定区分が中度以上(知能指数おおむね50以下)',
    quote: '療育手帳の判定区分が中度以上（知能指数がおおむね５０以下）の場合は、１級または２級の可能性を検討する。',
    source: '第3 総合評価 ⑤その他(知的障害)', direction: 'up' },
  { id: 'c2', question: '軽度だが、不適応行動などで日常生活に著しい制限がある',
    quote: 'それより軽度の判定区分である場合は、不適応行動等により日常生活に著しい制限が認められる場合は、２級の可能性を検討する。',
    source: '第3 総合評価 ⑤その他(知的障害)', direction: 'up' },
  { id: 'c3', question: '療育手帳はないが、養護学校・特殊学級の在籍や通知表で幼少期の状況が分かる',
    quote: '療育手帳がない場合、幼少期から知的障害があることが、養護学校や特殊学級の在籍状況、通知表などから客観的に確認できる場合は、２級の可能性を検討する。',
    source: '第3 総合評価 ⑤その他(知的障害)', direction: 'up' },
  { id: 'c4', question: '仕事が、保護的な環境での単純・反復的な業務',
    quote: '一般企業で就労している場合（障害者雇用制度による就労を含む）でも、仕事の内容が保護的な環境下での専ら単純かつ反復的な業務であれば、２級の可能性を検討する。',
    source: '第3 総合評価 ④就労状況(知的障害)', direction: 'up' },
  { id: 'c5', question: '意思疎通が難しく、常時の管理・指導が必要',
    quote: '一般企業で就労している場合（障害者雇用制度による就労を含む）でも、他の従業員との意思疎通が困難で、かつ不適切な行動がみられることなどにより、常時の管理・指導が必要な場合は、２級の可能性を検討する。',
    source: '第3 総合評価 ④就労状況(知的障害)', direction: 'up' },
  { id: 'c6', question: '入所施設で、常時の個別の援助が必要',
    quote: '入所施設において、常時個別の援助が必要な場合は、１級の可能性を検討する。',
    source: '第3 総合評価 ③生活環境(知的障害・発達障害)', direction: 'up' },
];

export const MITATE_GUIDE_HATTATSU: MitateGuideItem[] = [
  { id: 'h1', question: '知能指数は高いが、日常生活の能力が低い',
    quote: '知能指数が高くても日常生活能力が低い（特に対人関係や意思疎通を円滑に行うことができない）場合は、それを考慮する。',
    source: '第3 総合評価 ①現在の病状又は状態像(発達障害)', direction: 'up' },
  { id: 'h2', question: 'におい・光・音・気温などの感覚過敏で、生活に制限がある',
    quote: '臭気、光、音、気温などの感覚過敏があり、日常生活に制限が認められれば、それを考慮する。',
    source: '第3 総合評価 ①現在の病状又は状態像(発達障害)', direction: 'up' },
  { id: 'h3', question: '執着が強く、臨機応変な対応が難しくて常時の管理・指導が必要',
    quote: '一般企業で就労している場合（障害者雇用制度による就労を含む）でも、執着が強く、臨機応変な対応が困難であることなどにより、常時の管理・指導が必要な場合は、２級の可能性を検討する。',
    source: '第3 総合評価 ④就労状況(発達障害)', direction: 'up' },
  { id: 'h4', question: '仕事が、保護的な環境での単純・反復的な業務',
    quote: '一般企業で就労している場合（障害者雇用制度による就労を含む）でも、仕事の内容が保護的な環境下での専ら単純かつ反復的な業務であれば、２級の可能性を検討する。',
    source: '第3 総合評価 ④就労状況(発達障害)', direction: 'up' },
  { id: 'h5', question: '療育手帳が中度より軽いが、発達障害の症状で日常生活に著しい制限がある',
    quote: '療育手帳の判定区分が中度より軽い場合は、発達障害の症状により日常生活に著しい制限が認められれば、１級または２級の可能性を検討する。',
    source: '第3 総合評価 ⑤その他(発達障害)', direction: 'up' },
];

/* 回答からではなく、当てはめの結果から自動で立つ2件。 */
export const MITATE_GUIDE_AUTO: Record<'bias' | 'gap', MitateGuideItem> = {
  bias: { id: 'auto1', question: '特定の項目に著しい偏りがある',
    quote: '「日常生活能力の判定」の平均が低い場合であっても、各障害の特性に応じて特定の項目に著しく偏りがあり、日常生活に大きな支障が生じていると考えられる場合は、その状況を考慮する。',
    source: '第3 総合評価 ⑤その他(共通事項)', direction: 'up' },
  gap: { id: 'auto2', question: '判定と程度に開きがある',
    quote: '「日常生活能力の程度」と「日常生活能力の判定」に齟齬があれば、それを考慮する。',
    source: '第3 総合評価 ⑤その他(共通事項)', direction: 'eq' },
};

export const MITATE_GUIDE_LIMIT = 6;

export const MITATE_SOURCE = {
  name: '精神の障害に係る等級判定ガイドライン(平成28年9月・厚生労働省/日本年金機構)',
  url: 'https://www.mhlw.go.jp/file/04-Houdouhappyou-12512000-Nenkinkyoku-Jigyoukanrika/0000130045.pdf',
} as const;
