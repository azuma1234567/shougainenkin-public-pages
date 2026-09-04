# 公式様式(病歴・就労状況等申立書)

配布元: 日本年金機構「病歴・就労状況等申立書を提出するとき」
https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/20140516.html (ページ更新日 2025年10月20日)

| ファイル | 中身 | md5 | 取得日 |
|---|---|---|---|
| 01.pdf | 病歴・就労状況等申立書(表・裏、A3) | 557631645dac114a4ab1f56bbc59a47b | 2026-09-04(アプリrepo `assets/申立書.pdf` と同一) |
| 02.xlsx | 同 エクセル版 | b8a88713bfdb1e0487bfd3a20158b6f1 | 2026-09-04 |
| 03.pdf | 続紙(表・裏、A4) | d1272c56462e004f1b150311fda3fbd9 | 2026-09-04 |
| 04.xlsx | 続紙 エクセル版 | 38c7c2d4934e727cc2913edd82c86079 | 2026-09-04 |
| 05.pdf | 記載要領 | c829ec5a88e2b8f765512ed51557719d | 2026-09-04 |

改版に気づけるよう、差し替えたら md5 と取得日を更新すること。
01.pdf・03.pdf の座標を測るには `python3 scripts/measure-form.py <pdf> --page N`。
背景SVGを作り直すには `python3 scripts/forms-to-svg.py`(出力は `public/forms/moushitatesho/`)。

設計: `docs/moushitatesho-youshiki-saigen-2026-09-04-design.md`
続紙の実測: `docs/verification/moushitatesho-youshiki-2026-09-04/measure-cont.md`
