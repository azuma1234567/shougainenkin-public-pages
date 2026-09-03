import type { Metadata } from "next";
import Link from "next/link";
import { AnalyticsConsentSettingsButton } from "@/components/AnalyticsConsent";
import { ADSENSE_ENABLED, AFFILIATE_ASPS, SHOW_LISTINGS } from "@/lib/ads";
import { CONTACT_EMAIL, SITE_LEGAL_UPDATED } from "@/lib/constants";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "「障害年金ノート」(shougainenkin-note.net)のプライバシーポリシーです。閲覧・お問い合わせ・広告掲載に関する情報の取扱い、アクセス解析と広告配信について説明します。";

export const metadata: Metadata = pageMetadata({
  title: "プライバシーポリシー",
  description: DESCRIPTION,
  path: "/privacy",
});

const breadcrumb = breadcrumbJsonLd([
  { name: "トップ", path: "/" },
  { name: "プライバシーポリシー", path: "/privacy" },
]);

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <aside className="legal-crosslink">
        iPhoneアプリ「障害年金申請サポート」の記録・AI機能に関するプライバシーポリシーは、
        <Link href="/app/privacy">アプリのプライバシーポリシー</Link>
        をご覧ください。このページは、ウェブサイト shougainenkin-note.net
        の閲覧・お問い合わせ・広告に関する取扱いを説明するものです。
      </aside>

      <h1>プライバシーポリシー</h1>

      <p className="meta-line">最終更新日: {SITE_LEGAL_UPDATED}</p>

      <p>
        本ポリシーは、「障害年金ノート」(shougainenkin-note.net、以下「本サイト」)を閲覧・利用する方の情報を、
        運営者がどのように取り扱うかを説明するものです。
      </p>

      <h2>1. 運営者</h2>
      <p>本サイトは、個人(あずまたいすけ)が運営しています。連絡先は第14条をご覧ください。</p>

      <h2>2. このポリシーの範囲</h2>
      <p>
        本ポリシーは、本サイトの閲覧、お問い合わせ、広告掲載の申込みに関する情報の取扱いに適用されます。
        iPhoneアプリ「障害年金申請サポート」で入力する記録やAI機能の取扱いは、別に定める
        <Link href="/app/privacy">アプリのプライバシーポリシー</Link>に従います。
        本サイトからリンクする外部サイト(日本年金機構、社会保険労務士事務所、広告主のサイトなど)での情報の取扱いは、
        各サイトのポリシーに従います。
      </p>

      <h2>3. 本サイトが取得する情報</h2>
      <p>本サイトでは、次の情報を取得することがあります。</p>
      <ul>
        <li>お問い合わせフォームまたはメールでいただく、お名前(任意)、メールアドレス、お問い合わせの内容</li>
        <li>広告掲載の申込みでいただく、事務所名、担当者名、社会保険労務士の登録番号、所在地、連絡先、掲載内容</li>
        <li>
          アクセス情報(閲覧したページ、参照元、閲覧日時、ブラウザや端末の種類、おおまかな地域、Cookieや広告識別子など)。
          これらは第5条から第7条の仕組みにより、自動で取得されます。
        </li>
      </ul>
      <p>
        本サイトは会員登録の仕組みを持たず、閲覧のために個人情報の入力を求めることはありません。
        お問い合わせの際に、病歴や症状などの詳しい内容を書く必要はありません。
      </p>

      <h2>4. 利用目的</h2>
      <p>取得した情報は、次の目的で利用します。</p>
      <ul>
        <li>お問い合わせへの回答</li>
        <li>広告掲載の可否の判断、掲載内容の確認、料金の請求、掲載に関する連絡</li>
        <li>本サイトの利用状況の把握と、記事や導線の改善</li>
        <li>広告の配信と、その効果の測定</li>
        <li>不正アクセスやスパムへの対処</li>
        <li>法令に基づく対応</li>
      </ul>

      <h2>5. アクセス解析(Google アナリティクス)</h2>
      <p>
        本サイトは、利用状況の把握のために Google LLC が提供する Google アナリティクス(GA4)を利用しています。
        Google アナリティクスは Cookie や類似の技術を使って閲覧情報を収集しますが、
        氏名やメールアドレスなど、個人を直接特定する情報は含みません。収集された情報は Google のサーバーで処理され、
        Google のプライバシーポリシーに基づいて管理されます。
      </p>
      <ul>
        <li>
          Google のプライバシーポリシー:{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer external">
            https://policies.google.com/privacy
          </a>
        </li>
        <li>
          Google アナリティクスによるデータの利用:{" "}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer external">
            https://policies.google.com/technologies/partner-sites
          </a>
        </li>
        <li>
          収集を停止するには、Google アナリティクス オプトアウト アドオン(
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer external">
            https://tools.google.com/dlpage/gaoptout
          </a>
          )を利用するか、ブラウザで Cookie を無効にしてください。
        </li>
      </ul>
      <p>
        本サイトでは、初回訪問時の同意バナーからアクセス解析を許可または拒否できます。
        同意しない場合および拒否した場合は、Google アナリティクスのタグを読み込まず、通信も行いません。
        選択後も、下のボタンからいつでも変更できます。
      </p>
      <p>
        <AnalyticsConsentSettingsButton />
      </p>

      <h2>6. 広告配信(Google AdSense)</h2>
      {ADSENSE_ENABLED ? (
        <>
          <p>
            本サイトは、第三者配信の広告サービス Google AdSense を利用しています。
            Google などの第三者配信事業者は、利用者の興味に応じた広告を表示するために Cookie を使用します。
            この Cookie により、利用者が本サイトや他のサイトにアクセスした際の情報が利用されることがありますが、
            氏名、住所、メールアドレス、電話番号は含まれません。
          </p>
          <ul>
            <li>
              パーソナライズ広告を無効にするには、Google の広告設定(
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer external">
                https://www.google.com/settings/ads
              </a>
              )で設定を変更してください。
            </li>
            <li>
              その他の第三者配信事業者の Cookie を無効にするには、www.aboutads.info(
              <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer external">
                https://www.aboutads.info/choices/
              </a>
              )をご利用ください。
            </li>
            <li>
              Google の広告における Cookie の利用について:{" "}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer external">
                https://policies.google.com/technologies/ads
              </a>
            </li>
          </ul>
        </>
      ) : (
        <p>
          本サイトは現在、第三者配信の広告(Google AdSense など)を利用していません。
          導入する場合は、本ポリシーを改定し、最終更新日とともにお知らせします。
        </p>
      )}

      <h2>7. アフィリエイトプログラム</h2>
      <p>
        本サイトの記事には、成果報酬型の広告(アフィリエイト広告)を含むことがあります。
        該当する記事には、その旨を記事内に表示します。
        本サイトが参加しているアフィリエイト・サービス・プロバイダ(ASP)は次のとおりです。
      </p>
      {AFFILIATE_ASPS.length > 0 ? (
        <ul>
          {AFFILIATE_ASPS.map((asp) => (
            <li key={asp}>{asp}</li>
          ))}
        </ul>
      ) : (
        <p>
          現在、参加している ASP はありません。参加した時点で、この条に事業者名を記載します。
        </p>
      )}
      <p>
        ASP は、リンクの経由や成果の判定のために Cookie を使用します。Cookie の取扱いは各 ASP
        のプライバシーポリシーに従います。本サイトから商品やサービスを紹介する場合も、
        購入や申込みの契約は利用者と販売者・提供者との間で成立し、本サイトは契約の当事者にはなりません。
      </p>

      <h2>8. 社会保険労務士事務所などの掲載</h2>
      {SHOW_LISTINGS ? (
        <>
          <p>
            本サイトには、社会保険労務士事務所や関連サービスの情報を、掲載料を受け取って、
            または無料で掲載する枠があります。掲載枠には「広告」または「PR」の表示を付けます。
          </p>
          <ul>
            <li>
              本サイトは、掲載している事務所を推薦、選定、または保証するものではありません。
              掲載の有無や順序は、事務所の実績や質を示すものではありません。
            </li>
            <li>
              本サイトは、閲覧者と事務所との間の依頼、契約、費用のやり取りを仲介・斡旋しません。
              事務所への相談や依頼は、閲覧者ご自身が事務所へ直接行い、その内容や結果について本サイトは関与しません。
            </li>
            <li>
              本サイトが閲覧者の情報を事務所へ提供することはありません。
              事務所のサイトや問い合わせフォームへ移動した後の情報は、各事務所の取扱いに従います。
            </li>
            <li>
              掲載を申し込んだ事務所の情報(第3条)は、掲載の審査、連絡、請求のために利用し、
              掲載内容として公開することに同意いただいた範囲で本サイトに表示します。
            </li>
          </ul>
        </>
      ) : (
        <p>
          本サイトでは今後、社会保険労務士事務所や関連サービスの情報を、掲載料を受け取って、
          または無料で掲載する枠を設ける予定です。掲載を始める際は、本ポリシーを改定し、
          最終更新日とともにお知らせします。掲載枠には「広告」または「PR」の表示を付け、
          本サイトが特定の事務所を推薦・選定しないこと、閲覧者と事務所との依頼・契約を仲介・斡旋しないこと、
          閲覧者の情報を事務所へ提供しないことは、掲載開始後も変わりません。
        </p>
      )}

      <h2>9. 第三者への提供</h2>
      <p>運営者は、次の場合を除き、取得した個人情報を第三者に提供しません。</p>
      <ul>
        <li>ご本人の同意がある場合</li>
        <li>第5条から第7条の各サービスが、それぞれのポリシーに基づいて情報を取得・処理する場合</li>
        <li>料金の請求や決済のために、決済事業者へ必要な範囲の情報を渡す場合</li>
        <li>法令に基づく場合</li>
      </ul>
      <p>運営者が、お問い合わせの内容や個人情報を販売することはありません。</p>

      <h2>10. 安全管理</h2>
      <p>
        運営者は、取得した情報への不正アクセス、紛失、漏えいを防ぐため、
        アクセス権の限定やパスワード管理などの措置を講じます。
        お問い合わせの内容は、対応が終わってから一定期間の後に削除します。
      </p>

      <h2>11. 開示・訂正・削除の請求</h2>
      <p>
        ご本人から、自身の情報の開示、訂正、利用停止、削除のご依頼があった場合は、本人確認のうえ、
        法令に従って対応します。第14条の連絡先へご連絡ください。
      </p>

      <h2>12. 未成年の方へ</h2>
      <p>
        本サイトは年齢を問わず閲覧できますが、お問い合わせや広告掲載の申込みを未成年の方が行う場合は、
        保護者の同意を得てください。
      </p>

      <h2>13. 改定</h2>
      <p>
        本ポリシーは、利用するサービスの変更、広告の追加、法令の変更などに応じて見直すことがあります。
        改定した場合は、本ページで最終更新日とともに公開します。重要な変更がある場合は、トップページでもお知らせします。
      </p>

      <h2>14. お問い合わせ</h2>
      <p>
        本ポリシーに関するご質問は、下記までご連絡ください。
        <br />
        メール: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </>
  );
}
