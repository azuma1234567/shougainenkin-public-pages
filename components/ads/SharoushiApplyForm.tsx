"use client";
/* /ads/sharoushi の申込みフォーム(docs/claude-code-ads-sharoushi-2026-09-16-instructions.md §3)。
   見た目と動作の正は docs/site-mock-2026-09-16-ads-sharoushi/AdsSharoushi.html。
   サーバーも DB も持たない。入力内容から mailto: を組み立てて、事務所自身のメールソフトで
   送ってもらう。主ボタンは本文をクリップボードにコピーしてから、貼り付けの案内だけを本文にした
   mailto を開く。副ボタンで本文だけをコピーすることもできる。入力値はどこにも保存せず、Analytics にも送らない
   (送るのは送信ボタンのクリック1回 ads_sharoushi_apply_click だけ)。 */
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { CONTACT_EMAIL } from "@/lib/constants";
import { buildBody, buildMailto, buildSubject, EMPTY_FORM, FEE_LABELS, MAILTO_BODY, validate, type FieldError, type Form } from "@/lib/sharoushi-apply";
import {
  PREFECTURES,
  PREFECTURE_REGIONS,
  SHAROUSHI_DRAFT_OPTIONS,
  SHAROUSHI_FEE_APPEAL,
  SHAROUSHI_FEE_FAIL,
  SHAROUSHI_FEE_START,
  SHAROUSHI_FEE_SUCCESS,
  SHAROUSHI_FLAGS,
  SHAROUSHI_KINDS,
  SHAROUSHI_NATIONWIDE,
  SHAROUSHI_SOURCES,
  SHAROUSHI_TOPICS,
  SHAROUSHI_WAYS,
} from "@/data/sharoushi/options";

const NOTE_MAX = 200;
const FEE_NOTE_MAX = 60;

/* 送信ボタンのクリックだけを既存の Analytics(gtag)へ送る。入力値は渡さない。
   計測を止めている人は window.gtag が無いので、何も送らない。 */
function trackApplyClick() {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "ads_sharoushi_apply_click", { page_path: window.location.pathname });
}

export default function SharoushiApplyForm() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const errId = (key: string) => `${uid}-err-${key}`;
  const [f, setF] = useState<Form>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [toast, setToast] = useState("");
  const [copyText, setCopyText] = useState<string | null>(null);

  const errorFor = (...keys: string[]) => errors.find((e) => keys.includes(e.key));
  /* aria-describedby: 補足(help)と誤り(err)の id を並べる。無ければ undefined。 */
  const describedBy = (help: string | null, ...keys: string[]) => {
    const ids = [help ? id(`help-${help}`) : null, ...keys.map((k) => (errorFor(k) ? errId(k) : null))].filter(Boolean);
    return ids.length ? ids.join(" ") : undefined;
  };
  const invalid = (...keys: string[]) => (errorFor(...keys) ? true : undefined);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setF((prev) => ({ ...prev, [key]: value }));
  const toggle = (key: "areas" | "ways" | "flags" | "topics" | "kinds", value: string, on: boolean) =>
    setF((prev) => ({ ...prev, [key]: on ? [...prev[key], value] : prev[key].filter((v) => v !== value) }));

  const areaCount = useMemo(() => {
    const set = new Set(f.areas);
    return Object.fromEntries(PREFECTURE_REGIONS.map((r) => [r.region, r.prefectures.filter((p) => set.has(p)).length]));
  }, [f.areas]);

  const runValidate = (): boolean => {
    const e = validate(f);
    setErrors(e);
    if (e.length) {
      /* 誤りの一覧まで戻す(モックと同じ)。 */
      requestAnimationFrame(() => document.getElementById(id("errors"))?.scrollIntoView({ block: "center" }));
    }
    return e.length === 0;
  };

  const flash = (message: string, ms: number) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? "" : current)), ms);
  };

  /* 本文をクリップボードへ。使えない環境では false を返す(呼び出し側が textarea を出す)。 */
  const copyBody = async (body: string): Promise<boolean> => {
    try {
      if (!navigator.clipboard?.writeText) return false;
      await navigator.clipboard.writeText(body);
      return true;
    } catch {
      return false;
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!runValidate()) return;
    trackApplyClick();
    const body = buildBody(f);
    if (await copyBody(body)) {
      setCopyText(null);
      setToast("申込み内容をコピーしました。開いたメールに貼り付けて送信してください");
    } else {
      /* クリップボードが使えない環境: 先に本文を出してから、メールソフトを開く。 */
      setCopyText(body);
      setToast("下の本文を選択してコピーし、開いたメールに貼り付けてください");
    }
    window.location.href = buildMailto(buildSubject(f), MAILTO_BODY);
  };

  const onCopy = async () => {
    if (!runValidate()) return;
    const body = buildBody(f);
    if (await copyBody(body)) {
      flash(`コピーしました。${CONTACT_EMAIL} へ貼り付けて送ってください`, 2000);
    } else {
      setCopyText(body);
      setToast("下の本文を選択してコピーしてください");
    }
  };

  const Req = () => <span className="ads-req">必須</span>;
  const Opt = () => <span className="ads-opt">任意</span>;
  const Err = ({ k }: { k: string }) => {
    const e = errorFor(k);
    return e ? <p className="ads-field-error" id={errId(k)}>{e.message}</p> : null;
  };

  return (
    <form className="ads-form" noValidate onSubmit={onSubmit} aria-label="掲載申込みフォーム">
      <div className="ads-field">
        <label className="ads-lbl" htmlFor={id("office")}>事務所名<Req /></label>
        <input type="text" id={id("office")} name="office" maxLength={100} autoComplete="organization" value={f.office}
          onChange={(e) => set("office", e.target.value)} aria-invalid={invalid("office")} aria-describedby={describedBy(null, "office")} />
        <Err k="office" />
      </div>

      <div className="ads-field">
        <label className="ads-lbl" htmlFor={id("person")}>代表者名(社会保険労務士の氏名)<Req /></label>
        <input type="text" id={id("person")} name="person" maxLength={100} autoComplete="name" value={f.person}
          onChange={(e) => set("person", e.target.value)} aria-invalid={invalid("person")} aria-describedby={describedBy(null, "person")} />
        <Err k="person" />
      </div>

      <div className="ads-field">
        <label className="ads-lbl" htmlFor={id("regno")}>社労士登録番号<Req /></label>
        <input type="text" id={id("regno")} name="regno" inputMode="numeric" placeholder="例: 12345678" value={f.regno}
          onChange={(e) => set("regno", e.target.value)} aria-invalid={invalid("regno")} aria-describedby={describedBy("regno", "regno")} />
        <p className="ads-help" id={id("help-regno")}>法人の場合は法人番号でも構いません。運営者が公開情報で確認します。</p>
        <Err k="regno" />
      </div>

      <div className="ads-field">
        <label className="ads-lbl" htmlFor={id("kai")}>所属する都道府県社労士会<Req /></label>
        <select id={id("kai")} name="kai" value={f.kai} onChange={(e) => set("kai", e.target.value)}
          aria-invalid={invalid("kai")} aria-describedby={describedBy(null, "kai")}>
          <option value="">選んでください</option>
          {PREFECTURES.map((p) => <option key={p} value={p}>{p}社会保険労務士会</option>)}
        </select>
        <Err k="kai" />
      </div>

      <fieldset className="ads-field" aria-describedby={describedBy("address", "address")}>
        <legend className="ads-lbl">所在地<Req /></legend>
        <div className="ads-grid2">
          <div>
            <label className="ads-sub" htmlFor={id("pref")}>都道府県</label>
            <select id={id("pref")} name="pref" value={f.pref} onChange={(e) => set("pref", e.target.value)} aria-invalid={invalid("address")}>
              <option value="">都道府県</option>
              {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="ads-sub" htmlFor={id("city")}>市区町村</label>
            <input type="text" id={id("city")} name="city" maxLength={100} placeholder="市区町村(番地は任意)" value={f.city}
              onChange={(e) => set("city", e.target.value)} aria-invalid={invalid("address")} />
          </div>
        </div>
        <p className="ads-help" id={id("help-address")}>番地は任意です。</p>
        <Err k="address" />
      </fieldset>

      <fieldset className="ads-field" aria-describedby={describedBy("areas", "areas")}>
        <legend className="ads-lbl">対応地域<Req /></legend>
        <p className="ads-help" id={id("help-areas")}>1つ以上。全国(オンライン・郵送)にも対応する場合は先頭にチェック。</p>
        <div className="ads-checks">
          <label><input type="checkbox" name="areas" value={SHAROUSHI_NATIONWIDE} checked={f.areas.includes(SHAROUSHI_NATIONWIDE)}
            onChange={(e) => toggle("areas", SHAROUSHI_NATIONWIDE, e.target.checked)} />{SHAROUSHI_NATIONWIDE}</label>
        </div>
        <div className="ads-regions">
          {PREFECTURE_REGIONS.map((r) => (
            <details className="ads-pref" key={r.region}>
              <summary>{r.region}({areaCount[r.region]}/{r.prefectures.length})</summary>
              <div className="ads-checks">
                {r.prefectures.map((p) => (
                  <label key={p}><input type="checkbox" name="areas" value={p} checked={f.areas.includes(p)}
                    onChange={(e) => toggle("areas", p, e.target.checked)} />{p}</label>
                ))}
              </div>
            </details>
          ))}
        </div>
        <Err k="areas" />
      </fieldset>

      <fieldset className="ads-field" aria-describedby={describedBy(null, "ways")}>
        <legend className="ads-lbl">相談のしかた<Req /></legend>
        <div className="ads-checks">
          {SHAROUSHI_WAYS.map((v) => (
            <label key={v}><input type="checkbox" name="ways" value={v} checked={f.ways.includes(v)} onChange={(e) => toggle("ways", v, e.target.checked)} />{v}</label>
          ))}
        </div>
        <Err k="ways" />
      </fieldset>

      <fieldset className="ads-field">
        <legend className="ads-lbl">相談の条件<Opt /></legend>
        <div className="ads-checks">
          {SHAROUSHI_FLAGS.map((v) => (
            <label key={v}><input type="checkbox" name="flags" value={v} checked={f.flags.includes(v)} onChange={(e) => toggle("flags", v, e.target.checked)} />{v}</label>
          ))}
        </div>
      </fieldset>

      <fieldset className="ads-field" aria-describedby={describedBy("topics", "topics")}>
        <legend className="ads-lbl">対応できる相談<Req /></legend>
        <p className="ads-help" id={id("help-topics")}>当サイトの困りごとの入口と同じ9分類です。1つ以上。</p>
        <div className="ads-checks">
          {SHAROUSHI_TOPICS.map((t) => (
            <label key={t.label}><input type="checkbox" name="topics" value={t.label} checked={f.topics.includes(t.label)} onChange={(e) => toggle("topics", t.label, e.target.checked)} />{t.label}</label>
          ))}
        </div>
        <Err k="topics" />
      </fieldset>

      <fieldset className="ads-field" aria-describedby={describedBy(null, "kinds")}>
        <legend className="ads-lbl">得意な障害の種類<Req /></legend>
        <div className="ads-checks">
          {SHAROUSHI_KINDS.map((v) => (
            <label key={v}><input type="checkbox" name="kinds" value={v} checked={f.kinds.includes(v)} onChange={(e) => toggle("kinds", v, e.target.checked)} />{v}</label>
          ))}
        </div>
        <Err k="kinds" />
      </fieldset>

      <fieldset className="ads-field" aria-describedby={describedBy("fee", "fee_start", "fee_success", "fee_fail", "fee_appeal")}>
        <legend className="ads-lbl">料金の型<Req /></legend>
        <p className="ads-help" id={id("help-fee")}>金額は書かなくて構いません。読者が契約前に確認する4点と同じ軸です。</p>
        <div className="ads-grid2">
          <div>
            <label className="ads-sub" htmlFor={id("fee_start")}>着手金</label>
            <select id={id("fee_start")} name="fee_start" value={f.fee_start} onChange={(e) => set("fee_start", e.target.value)} aria-invalid={invalid("fee_start")} aria-describedby={describedBy(null, "fee_start")}>
              <option value="">選んでください</option>
              {SHAROUSHI_FEE_START.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="ads-sub" htmlFor={id("fee_success")}>成功報酬の計算方法</label>
            <select id={id("fee_success")} name="fee_success" value={f.fee_success} onChange={(e) => set("fee_success", e.target.value)} aria-invalid={invalid("fee_success")} aria-describedby={describedBy(null, "fee_success")}>
              <option value="">選んでください</option>
              {SHAROUSHI_FEE_SUCCESS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="ads-sub" htmlFor={id("fee_fail")}>不支給のときの費用</label>
            <select id={id("fee_fail")} name="fee_fail" value={f.fee_fail} onChange={(e) => set("fee_fail", e.target.value)} aria-invalid={invalid("fee_fail")} aria-describedby={describedBy(null, "fee_fail")}>
              <option value="">選んでください</option>
              {SHAROUSHI_FEE_FAIL.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="ads-sub" htmlFor={id("fee_appeal")}>審査請求まで含むか</label>
            <select id={id("fee_appeal")} name="fee_appeal" value={f.fee_appeal} onChange={(e) => set("fee_appeal", e.target.value)} aria-invalid={invalid("fee_appeal")} aria-describedby={describedBy(null, "fee_appeal")}>
              <option value="">選んでください</option>
              {SHAROUSHI_FEE_APPEAL.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <label className="ads-sub" htmlFor={id("fee_note")}>成功報酬の補足(任意・{FEE_NOTE_MAX}字まで)</label>
        <input type="text" id={id("fee_note")} name="fee_note" maxLength={FEE_NOTE_MAX} placeholder="例: 年金額の2か月分、遡及分は10%" value={f.fee_note} onChange={(e) => set("fee_note", e.target.value)} />
        {FEE_LABELS.map(([key]) => <Err key={key} k={key} />)}
      </fieldset>

      <fieldset className="ads-field" aria-describedby={describedBy(null, "contact")}>
        <legend className="ads-lbl">連絡先<span className="ads-req">最低1つ</span></legend>
        <div className="ads-grid2">
          <div>
            <label className="ads-sub" htmlFor={id("tel")}>電話番号</label>
            <input type="tel" id={id("tel")} name="tel" autoComplete="tel" placeholder="例: 03-0000-0000" value={f.tel} onChange={(e) => set("tel", e.target.value)} aria-invalid={invalid("tel", "contact")} aria-describedby={describedBy(null, "tel")} />
          </div>
          <div>
            <label className="ads-sub" htmlFor={id("mail")}>メールアドレス</label>
            <input type="email" id={id("mail")} name="mail" autoComplete="email" value={f.mail} onChange={(e) => set("mail", e.target.value)} aria-invalid={invalid("mail", "contact")} aria-describedby={describedBy(null, "mail")} />
          </div>
        </div>
        <label className="ads-sub" htmlFor={id("url")}>事務所サイトのURL</label>
        <input type="url" id={id("url")} name="url" autoComplete="url" placeholder="https://から" value={f.url} onChange={(e) => set("url", e.target.value)} aria-invalid={invalid("url", "contact")} aria-describedby={describedBy(null, "url")} />
        <Err k="contact" /><Err k="tel" /><Err k="mail" /><Err k="url" />
      </fieldset>

      <div className="ads-field">
        <label className="ads-lbl" htmlFor={id("note")}>一言<Opt /></label>
        <textarea id={id("note")} name="note" maxLength={NOTE_MAX} placeholder={`事務所の言葉のまま載せます(${NOTE_MAX}字まで)`} value={f.note} onChange={(e) => set("note", e.target.value)} aria-describedby={id("help-note")} />
        <p className="ads-count" id={id("help-note")} aria-live="polite">残り {NOTE_MAX - f.note.length} 字({f.note.length} / {NOTE_MAX})</p>
      </div>

      <fieldset className="ads-field" aria-describedby={describedBy(null, "draft")}>
        <legend className="ads-lbl">原稿の作り方<Req /></legend>
        <div className="ads-checks">
          {SHAROUSHI_DRAFT_OPTIONS.map((v) => (
            <label key={v}><input type="radio" name="draft" value={v} checked={f.draft === v} onChange={() => set("draft", v)} />{v}</label>
          ))}
        </div>
        <Err k="draft" />
      </fieldset>

      <div className="ads-field">
        <label className="ads-lbl" htmlFor={id("source")}>どこで知ったか<Opt /></label>
        <select id={id("source")} name="source" value={f.source} onChange={(e) => set("source", e.target.value)}>
          <option value="">選んでください</option>
          {SHAROUSHI_SOURCES.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div className="ads-field">
        <div className="ads-checks ads-agree">
          <label>
            <input type="checkbox" id={id("agree")} name="agree" checked={f.agree} onChange={(e) => set("agree", e.target.checked)} aria-invalid={invalid("agree")} aria-describedby={describedBy(null, "agree")} />
            <span><Link href="/ads">広告掲載規約</Link>と、このページの「載せないもの」「掲載事務所へのお願い」を読み、同意します<Req /></span>
          </label>
        </div>
        <Err k="agree" />
      </div>

      {errors.length > 0 && (
        <div className="ads-errors" id={id("errors")} role="alert">
          <ul>
            {errors.map((e) => <li key={e.key + e.message}>{e.message}</li>)}
          </ul>
        </div>
      )}

      <div className="ads-actions">
        <button type="submit" className="ads-btn ads-btn-primary">メールを作成する</button>
        <button type="button" className="ads-btn" onClick={onCopy}>本文をコピーする</button>
        <span className="ads-toast" role="status" aria-live="polite">{toast}</span>
      </div>

      {copyText !== null && (
        <div className="ads-copybox">
          <label className="ads-help" htmlFor={id("copytext")}>この本文を {CONTACT_EMAIL} へお送りください。</label>
          <textarea readOnly id={id("copytext")} value={copyText} onFocus={(e) => e.currentTarget.select()} />
        </div>
      )}
    </form>
  );
}
