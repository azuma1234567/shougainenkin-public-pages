export const AMOUNTS_2026 = {
  basicGrade1: "1,059,125", basicGrade2: "847,300", childFirstSecond: "243,800", childThird: "81,300",
  spouseAddition: "243,800",             // 配偶者加給年金額(障害厚生年金1・2級のみ)
  employeesGrade3Minimum: "635,500", supportGrade1Monthly: "7,025", supportGrade2Monthly: "5,620",
  incomeHalfBeforeOctober: "3,761,000", incomeFullBeforeOctober: "4,794,000",
  incomeHalfFromOctober: "3,858,000", incomeFullFromOctober: "4,918,000",
  dependentDisabledIncomeLimit: "180", dependentGeneralIncomeLimit: "130",
  /* 同じ線を円で(道具の表示用。上の万円表記と二重にならないよう、計算はこちらから) */
  dependentDisabledIncomeLimitYen: "1,800,000", dependentGeneralIncomeLimitYen: "1,300,000",
  /* 20歳前傷病の所得制限の線に足す扶養親族等の加算(国民年金法施行令 第5条の4) */
  incomeLimitDependentAddition: "380,000", incomeLimitElderlyAddition: "480,000", incomeLimitSpecifiedAddition: "630,000",
  /* 所得から引ける障害者控除の額(施行令 第6条の2。本人の分は引けない) */
  incomeLimitDisabledDeduction: "270,000", incomeLimitSpecialDisabledDeduction: "400,000",
  basicGrade1Old: "1,056,125",           // 昭和31年4月1日以前生まれの1級
  basicGrade2Old: "844,900",             // 同 2級
  employeesGrade3MinimumOld: "633,700",  // 同 3級最低保障
  disabilityAllowanceMinimum: "1,271,000", // 障害手当金の最低保障(3級最低保障×2)
} as const;

/* 年額を12で割って百円で丸めた「月にならすと」の目安(/okane/ikura の一覧表)。
   上の年額トークンから計算するので、4月の改定で上の表を差し替えれば月額も一緒に変わる。 */
const monthlyApprox = (formatted: string): string =>
  (Math.round(Number(formatted.replaceAll(",", "")) / 12 / 100) * 100).toLocaleString("en-US");
export const MONTHLY_APPROX_2026 = {
  basicGrade1Monthly: monthlyApprox(AMOUNTS_2026.basicGrade1),
  basicGrade2Monthly: monthlyApprox(AMOUNTS_2026.basicGrade2),
  childFirstSecondMonthly: monthlyApprox(AMOUNTS_2026.childFirstSecond),
  childThirdMonthly: monthlyApprox(AMOUNTS_2026.childThird),
  spouseAdditionMonthly: monthlyApprox(AMOUNTS_2026.spouseAddition),
  employeesGrade3MinimumMonthly: monthlyApprox(AMOUNTS_2026.employeesGrade3Minimum),
} as const;

const values = Object.values(AMOUNTS_2026);
export function apply2026Amounts(text: string): string {
  const tokenized = [...Object.entries(AMOUNTS_2026), ...Object.entries(MONTHLY_APPROX_2026)].reduce(
    (result, [key, amount]) => result.replaceAll(`{{${key}}}`, amount),
    text,
  );
  return values.reduce((result, amount) => result.replaceAll(amount, amount), tokenized);
}

// 表示している年度。4月の改定でこの1行と上の表を差し替える。
export const FISCAL_YEAR = "令和8年度";

// 計算に使う数値。上の表(本文用の文字列)から導出するので、数字を二重に持たない。
const yen = (formatted: string): number => Number(formatted.replaceAll(",", ""));

// 報酬比例部分の乗率と300月みなし。年度改定ではなく法令で決まる値だが、
// 金額の一次情報をこのファイルに集めるため、ここに置く(docs/kingaku-tool-design-2026-09-02.md §4)。
export const KINGAKU_2026 = {
  fiscalYear: FISCAL_YEAR,
  basicGrade1: yen(AMOUNTS_2026.basicGrade1),
  basicGrade2: yen(AMOUNTS_2026.basicGrade2),
  childFirstSecond: yen(AMOUNTS_2026.childFirstSecond),
  childThird: yen(AMOUNTS_2026.childThird),
  spouseAddition: yen(AMOUNTS_2026.spouseAddition),
  employeesGrade3Minimum: yen(AMOUNTS_2026.employeesGrade3Minimum),
  supportGrade1Monthly: yen(AMOUNTS_2026.supportGrade1Monthly),
  supportGrade2Monthly: yen(AMOUNTS_2026.supportGrade2Monthly),
  rateOld: 7.125 / 1000,   // 平成15年3月以前
  rateNew: 5.481 / 1000,   // 平成15年4月以降
  minashiMonths: 300,      // 300月みなし
  grade1Rate: 1.25,        // 1級の報酬比例部分
} as const;

/* /dougu/kougin(工賃・賃金と年金の計算)で使う値。docs/dougu-2hon-2026-09-06-instructions.md §A-3。
   数字は必ずここに置き、部品や lib に直書きしない。 */
export const KOUGIN_2026 = {
  fiscalYear: FISCAL_YEAR,
  /* 給与所得控除。国税庁 タックスアンサー No.1410「給与所得控除」の令和7年分以降の表
     (令和8年分も同じ。令和7年4月1日現在法令等。確認日 2026-09-06)。
     upTo は収入金額の上限(円)、控除額 = 収入 × rate + add。 */
  salaryDeduction: [
    { upTo: 1_900_000, rate: 0, add: 650_000 },
    { upTo: 3_600_000, rate: 0.3, add: 80_000 },
    { upTo: 6_600_000, rate: 0.2, add: 440_000 },
    { upTo: 8_500_000, rate: 0.1, add: 1_100_000 },
    { upTo: Number.POSITIVE_INFINITY, rate: 0, add: 1_950_000 },
  ] as const,
  /* 20歳前傷病の障害基礎年金の所得制限の基準額(扶養親族等が無いとき)。
     国民年金法施行令 第5条の4(376万1千円・479万4千円)と、令和8年7月15日
     障発0715第2号・年発0715第1号(10月分から 385万8千円・491万8千円)。 */
  halfBeforeOctober: yen(AMOUNTS_2026.incomeHalfBeforeOctober),
  fullBeforeOctober: yen(AMOUNTS_2026.incomeFullBeforeOctober),
  halfFromOctober: yen(AMOUNTS_2026.incomeHalfFromOctober),
  fullFromOctober: yen(AMOUNTS_2026.incomeFullFromOctober),
  /* 扶養親族等の加算(施行令 第5条の4 第1項): 1人につき38万円、70歳以上の同一生計配偶者・
     老人扶養親族は48万円、特定扶養親族・19歳未満の控除対象扶養親族は63万円。
     全額停止の線(同条 第2項)は、扶養親族等1人につき38万円だけを加算する。 */
  dependentAddition: yen(AMOUNTS_2026.incomeLimitDependentAddition),
  dependentElderlyAddition: yen(AMOUNTS_2026.incomeLimitElderlyAddition),
  dependentSpecifiedAddition: yen(AMOUNTS_2026.incomeLimitSpecifiedAddition),
  fullLineDependentAddition: yen(AMOUNTS_2026.incomeLimitDependentAddition),
  /* 所得から引けるもの(施行令 第6条の2 第2項)。この道具で入力させるのは社会保険料控除だけ。
     障害者控除(27万円・特別障害者40万円)は「法第30条の4の障害基礎年金の受給権者を除く」と
     あり、本人の分は引けないので入力させない。 */
  deductionDisabled: yen(AMOUNTS_2026.incomeLimitDisabledDeduction),
  deductionSpecialDisabled: yen(AMOUNTS_2026.incomeLimitSpecialDisabledDeduction),
  /* 健康保険の被扶養者の収入の線(厚生労働省通知「収入がある者についての被扶養者の認定について」)。
     障害年金を受けられる程度の障害者は年収180万円未満、一般は130万円未満。年金も収入に数える。 */
  dependentLimitDisabled: yen(AMOUNTS_2026.dependentDisabledIncomeLimitYen),
  dependentLimitGeneral: yen(AMOUNTS_2026.dependentGeneralIncomeLimitYen),
} as const;

/* 統計値(制度の額ではなく、調査の結果)。年度・出典・確認日を必ず添える。
   本文の数字の出どころを検証(scripts/lib/amounts-derive.mjs)が確かめるための表で、
   画面に出す目安は下の KOUGIN_REFERENCE がここから読む(数字を二重に持たない)。 */
export const STATISTICS = {
  kouginBTypeMonthly2024: { value: "24,141", label: "就労継続支援B型 平均工賃(月額)", fiscalYear: "令和6年度", source: "厚生労働省「令和6年度 工賃(賃金)の実績について」", checkedOn: "2026-09-13" },
  kouginATypeMonthly2024: { value: "91,451", label: "就労継続支援A型 平均賃金(月額)", fiscalYear: "令和6年度", source: "厚生労働省「令和6年度 工賃(賃金)の実績について」", checkedOn: "2026-09-13" },
  kouginBTypeMonthly2023: { value: "22,649", label: "就労継続支援B型 平均工賃(月額)", fiscalYear: "令和5年度", source: "厚生労働省「令和6年度 工賃(賃金)の実績について」(前年度の欄)", checkedOn: "2026-09-13" },
  kouginATypeMonthly2023: { value: "86,752", label: "就労継続支援A型 平均賃金(月額)", fiscalYear: "令和5年度", source: "厚生労働省「令和6年度 工賃(賃金)の実績について」(前年度の欄)", checkedOn: "2026-09-13" },
} as const;

/* 目安の表(入力前に見せる)。幹10の原稿と同じ数字。値は STATISTICS から読む。 */
export const KOUGIN_REFERENCE = {
  bTypeMonthly: STATISTICS.kouginBTypeMonthly2024.value, bTypeYearlyApprox: "約29万",
  aTypeMonthly: STATISTICS.kouginATypeMonthly2024.value, aTypeYearlyApprox: "約110万",
  source: STATISTICS.kouginBTypeMonthly2024.source,
} as const;

/* 年金額ではない制度の公式額。本文に出てくる数字の出どころを検証が確かめるためだけに持つ。
   金額計算機(KINGAKU_2026・KOUGIN_2026)と画面表示からは参照しないこと(2026-09-13 の取り決め)。
   年度・出典・確認日を必ず添える。年度が変わって額が改定されたら、この表と本文の両方を見直す。 */
export const REFERENCE_AMOUNTS = {
  kokuminNenkinPremiumMonthly: { value: "17,920", label: "国民年金保険料(月額)", fiscalYear: "令和8年度", source: "日本年金機構「国民年金保険料」", checkedOn: "2026-09-13" },
  /* 特別障害者手当は令和8年4月分から 30,450円(令和7年度 29,590円)。previous は前年度の履歴(本文には出さない) */
  specialDisabilityAllowanceMonthly: { value: "30,450", label: "特別障害者手当(月額)", fiscalYear: "令和8年度", source: "厚生労働省「特別障害者手当について」", sourceUrl: "https://www.mhlw.go.jp/bunya/shougaihoken/jidou/tokubetsu.html", checkedOn: "2026-09-13", previous: { value: "29,590", fiscalYear: "令和7年度" } },
  /* 障害児福祉手当・特別児童扶養手当も令和8年4月分から改定 */
  childDisabilityWelfareAllowanceMonthly: { value: "16,560", label: "障害児福祉手当(月額)", fiscalYear: "令和8年度", source: "東京都心身障害者福祉センター「手当額の改定について」・奈良市「令和8年度 特別障害者手当等の支給額について」", sourceUrl: "https://www.fukushi.metro.tokyo.lg.jp/shisetsu/jigyosyo/shinsho/teate/gakukaitei", checkedOn: "2026-09-13", previous: { value: "16,100", fiscalYear: "令和7年度" } },
  specialChildRearingAllowanceGrade1Monthly: { value: "58,450", label: "特別児童扶養手当 1級(月額)", fiscalYear: "令和8年度", source: "厚生労働省「制度変更(令和8年4月)」(令和8年4月からの手当額改定)", sourceUrl: "https://www.mhlw.go.jp/stf/newpage_71570.html", checkedOn: "2026-09-13", previous: { value: "56,800", fiscalYear: "令和7年度" } },
  specialChildRearingAllowanceGrade2Monthly: { value: "38,930", label: "特別児童扶養手当 2級(月額)", fiscalYear: "令和8年度", source: "厚生労働省「制度変更(令和8年4月)」(令和8年4月からの手当額改定)", sourceUrl: "https://www.mhlw.go.jp/stf/newpage_71570.html", checkedOn: "2026-09-13", previous: { value: "37,830", fiscalYear: "令和7年度" } },
  serviceCopayCapLowTaxable: { value: "9,300", label: "障害福祉サービスの利用者負担上限(市町村民税課税世帯・所得割16万円未満、月額)", fiscalYear: "—(法令の額)", source: "厚生労働省「障害者の利用者負担」", sourceUrl: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/shougaishahukushi/service/hutan1.html", checkedOn: "2026-09-13" },
  serviceCopayCapGeneral: { value: "37,200", label: "障害福祉サービスの利用者負担上限(一般、月額)", fiscalYear: "—(法令の額)", source: "厚生労働省「障害者の利用者負担」", sourceUrl: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/shougaishahukushi/service/hutan1.html", checkedOn: "2026-09-13" },
  /* 特別障害給付金は令和8年度 1級相当 58,650円・2級相当 46,920円(令和7年度 56,850円・45,480円)。年額は月額×12 */
  specialDisabilityBenefitGrade1Monthly: { value: "58,650", label: "特別障害給付金 1級相当(月額)", fiscalYear: "令和8年度", source: "日本年金機構「特別障害給付金制度」", sourceUrl: "https://www.nenkin.go.jp/service/jukyu/seido/sonota-kyufu/tokubetsu-kyufu/tokubetsu-kyufu.html", checkedOn: "2026-09-13", previous: { value: "56,850", fiscalYear: "令和7年度" } },
  specialDisabilityBenefitGrade1Yearly: { value: "703,800", label: "特別障害給付金 1級相当(年額 = 月額×12)", fiscalYear: "令和8年度", source: "日本年金機構「特別障害給付金制度」", sourceUrl: "https://www.nenkin.go.jp/service/jukyu/seido/sonota-kyufu/tokubetsu-kyufu/tokubetsu-kyufu.html", checkedOn: "2026-09-13", previous: { value: "682,200", fiscalYear: "令和7年度" } },
  specialDisabilityBenefitGrade2Monthly: { value: "46,920", label: "特別障害給付金 2級相当(月額)", fiscalYear: "令和8年度", source: "日本年金機構「特別障害給付金制度」", sourceUrl: "https://www.nenkin.go.jp/service/jukyu/seido/sonota-kyufu/tokubetsu-kyufu/tokubetsu-kyufu.html", checkedOn: "2026-09-13", previous: { value: "45,480", fiscalYear: "令和7年度" } },
  specialDisabilityBenefitGrade2Yearly: { value: "563,040", label: "特別障害給付金 2級相当(年額 = 月額×12)", fiscalYear: "令和8年度", source: "日本年金機構「特別障害給付金制度」", sourceUrl: "https://www.nenkin.go.jp/service/jukyu/seido/sonota-kyufu/tokubetsu-kyufu/tokubetsu-kyufu.html", checkedOn: "2026-09-13", previous: { value: "545,760", fiscalYear: "令和7年度" } },
} as const;
