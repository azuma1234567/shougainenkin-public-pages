# /sharoushi の計測: GA4 の設定と月次レポートの手順 (2026-09-16)

docs/claude-code-sharoushi-list-2026-09-16-instructions.md §5、v0計画 §3。登録と月次の作業は東さんが行う。自動化はしない。

## 1. サイトが送るイベント(lib/sharoushi-track.ts)

| イベント | いつ | パラメータ |
|---|---|---|
| `sharoushi_list_view` | `/sharoushi`(pref=`all`)と `/sharoushi/[pref]` の表示 | `pref`、`from` |
| `sharoushi_filter` | 都道府県ページのチップ操作 | `pref`、`filter`(チップのラベル)、`on`(true/false)、`result_count` |
| `sharoushi_profile_view` | 事務所ページの表示 | `office_id`、`pref`、`from` |
| `sharoushi_tel_tap` | 電話ボタン | `office_id` |
| `sharoushi_mail_tap` | メールボタン | `office_id` |
| `sharoushi_site_click` | 事務所サイトボタン | `office_id` |

`from` は参照元が自サイトのときの先頭セグメント(`erabu` / `nayami` / `dougu` / `top` / `sharoushi` など)。外部・直接は `external`。パスの全文、氏名、電話番号、URL は送らない。計測を止めている閲覧者(/privacy のボタン)には `window.gtag` が無いので何も送らない。

## 2. GA4 に登録するカスタムディメンション(1回だけ)

GA4 の管理 → データの表示 → カスタム定義 → カスタムディメンションを作成。範囲はすべて「イベント」。

| ディメンション名 | イベント パラメータ |
|---|---|
| office_id | `office_id` |
| pref | `pref` |
| from | `from` |
| filter | `filter` |

登録した日から集計に使える(遡らない)。`on`・`result_count` は登録しない(絞り込みの傾向を見たくなったら追加)。

## 3. 月次レポート(毎月1日)

### 3-1 探索の設定(1回作って保存する)

GA4 の探索 → 空白 → 「自由形式」。

- 名前: `sharoushi 月次`
- 期間: 前月1日〜末日(毎月変える)
- 行: `office_id`
- 列: `イベント名`
- 値: `イベント数`
- フィルタ: イベント名 が次のいずれかに一致 `sharoushi_profile_view`, `sharoushi_tel_tap`, `sharoushi_mail_tap`, `sharoushi_site_click`

もう1枚、都道府県一覧の表示数:

- 名前: `sharoushi 都道府県`
- 行: `pref`
- 値: `イベント数`
- フィルタ: イベント名 が `sharoushi_list_view` に一致

### 3-2 手作業の手順

1. 探索 `sharoushi 月次` の期間を前月に変え、表を CSV で書き出す。
2. 探索 `sharoushi 都道府県` も同じ期間で書き出す。
3. 事務所ごとに、`office_id` の行から「閲覧(profile_view)」「電話タップ(tel_tap)」「メールタップ(mail_tap)」「サイトクリック(site_click)」を読む。無い行は 0。
4. その事務所の所在地の都道府県(`data/sharoushi/offices.json` の `pref`)の `list_view` 数を「都道府県一覧の表示」とする。
5. 各事務所へメールを1通送る(文面は 3-3)。数字が小さくても、0でも送る。
6. サイト全体の材料を `docs/metrics/sharoushi-YYYY-MM.md` に残す: 一覧到達数(`sharoushi_list_view` の合計)、プロフィール閲覧の合計、タップ合計(tel+mail+site)、都道府県別の `list_view`。

### 3-3 メールの文面(v0 §3)

件名: `【障害年金申請サポート】{YYYY年M月}の掲載ページの数字`

```
{事務所名} 様

先月のあなたのページ: 閲覧{n}件 / 電話タップ{n}件 / メールタップ{n}件 / サイトクリック{n}件 / 都道府県一覧の表示{n}件

掲載内容の修正はいつでもこのメールへの返信で受け付けます。
```

数字の出どころは GA4 のイベント数で、閲覧者の情報は含まない。事務所ごとの数字は、その事務所にだけ送る。
