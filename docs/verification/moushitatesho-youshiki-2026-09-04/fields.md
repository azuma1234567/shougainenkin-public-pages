# 欄ごとの位置(設計 §10-4)

測り方は scripts/verify-moushitatesho-layout.mjs。
digits は「印字の間の空欄の中央」、circle は「囲む文字の中心」を期待値にしている。

| 欄 | 種類 | 期待(様式) | 実測(layout.ts) | 差 |
|---|---|---|---|---|
| main-front:no | digits | 240.33 | 241 | 0.67 |
| main-front:total | digits | 257.6 | 257.5 | -0.1 |
| main-front:hatsubyou.year | digits | 92.03 | 92.3 | 0.27 |
| main-front:hatsubyou.month | digits | 111 | 110.6 | -0.4 |
| main-front:hatsubyou.day | digits | 129.88 | 130 | 0.12 |
| main-front:shoshin.year | digits | 222.72 | 223 | 0.28 |
| main-front:shoshin.month | digits | 241.55 | 241 | -0.55 |
| main-front:shoshin.day | digits | 260.35 | 260.5 | 0.15 |
| main-front:rows.0.from.year | digits | 59.94 | 60.3 | 0.36 |
| main-front:rows.0.from.month | digits | 72.18 | 72.1 | -0.08 |
| main-front:rows.0.from.day | digits | 83.61 | 83.8 | 0.19 |
| main-front:rows.0.to.year | digits | 59.94 | 60.3 | 0.36 |
| main-front:rows.0.to.month | digits | 72.22 | 72.1 | -0.12 |
| main-front:rows.0.to.day | digits | 83.61 | 83.8 | 0.19 |
| main-front:rows.1.from.year | digits | 60.2 | 60.3 | 0.1 |
| main-front:rows.1.from.month | digits | 72.26 | 72.1 | -0.16 |
| main-front:rows.1.from.day | digits | 83.86 | 83.8 | -0.06 |
| main-front:rows.1.to.year | digits | 60.2 | 60.3 | 0.1 |
| main-front:rows.1.to.month | digits | 72.26 | 72.1 | -0.16 |
| main-front:rows.1.to.day | digits | 83.86 | 83.8 | -0.06 |
| main-front:rows.2.from.year | digits | 60.11 | 60.3 | 0.19 |
| main-front:rows.2.from.month | digits | 72.35 | 72.1 | -0.25 |
| main-front:rows.2.from.day | digits | 83.78 | 83.8 | 0.02 |
| main-front:rows.2.to.year | digits | 60.11 | 60.3 | 0.19 |
| main-front:rows.2.to.month | digits | 72.35 | 72.1 | -0.25 |
| main-front:rows.2.to.day | digits | 83.78 | 83.8 | 0.02 |
| main-front:rows.3.from.year | digits | 60.11 | 60.3 | 0.19 |
| main-front:rows.3.from.month | digits | 72.18 | 72.1 | -0.08 |
| main-front:rows.3.from.day | digits | 83.78 | 83.8 | 0.02 |
| main-front:rows.3.to.year | digits | 60.11 | 60.3 | 0.19 |
| main-front:rows.3.to.month | digits | 72.18 | 72.1 | -0.08 |
| main-front:rows.3.to.day | digits | 83.78 | 83.8 | 0.02 |
| main-front:rows.4.from.year | digits | 60.11 | 60.3 | 0.19 |
| main-front:rows.4.from.month | digits | 72.31 | 72.1 | -0.21 |
| main-front:rows.4.from.day | digits | 83.78 | 83.8 | 0.02 |
| main-front:rows.4.to.year | digits | 60.11 | 60.3 | 0.19 |
| main-front:rows.4.to.month | digits | 72.31 | 72.1 | -0.21 |
| main-front:rows.4.to.day | digits | 83.78 | 83.8 | 0.02 |
| main-back:ninteibi.year | digits | 97.41 | 97.5 | 0.09 |
| main-back:ninteibi.month | digits | 116.16 | 115.7 | -0.46 |
| main-back:ninteibi.day | digits | 133.9 | 134 | 0.1 |
| main-back:sections.0.commuteHours | digits | 181.1 | 181.5 | 0.4 |
| main-back:sections.0.commuteMinutes | digits | 207.26 | 207.5 | 0.24 |
| main-back:sections.0.daysPrev | digits | 182.33 | 183 | 0.67 |
| main-back:sections.0.daysPrevPrev | digits | 248.96 | 249.5 | 0.54 |
| main-back:sections.1.commuteHours | digits | 181.1 | 181.5 | 0.4 |
| main-back:sections.1.commuteMinutes | digits | 207.26 | 207.5 | 0.24 |
| main-back:sections.1.daysPrev | digits | 174.03 | 174.5 | 0.47 |
| main-back:sections.1.daysPrevPrev | digits | 236.43 | 237.2 | 0.77 |
| main-back:techou.0.date.year | digits | 178.9 | 179.5 | 0.6 |
| main-back:techou.0.date.month | digits | 196.77 | 196.5 | -0.27 |
| main-back:techou.0.date.day | digits | 213.06 | 213 | -0.06 |
| main-back:techou.0.grade | digits | 241.26 | 241 | -0.26 |
| main-back:techou.1.date.year | digits | 178.86 | 179.5 | 0.64 |
| main-back:techou.1.date.month | digits | 196.77 | 196.5 | -0.27 |
| main-back:techou.1.date.day | digits | 213.02 | 213 | -0.02 |
| main-back:techou.1.grade | digits | 241.22 | 241 | -0.22 |
| main-back:moushitate.year | digits | 40 | 40 | 0 |
| main-back:moushitate.month | digits | 59.44 | 59 | -0.44 |
| main-back:moushitate.day | digits | 78.15 | 78 | -0.15 |
| cont-front:no | digits | 163.32 | 163.17 | -0.15 |
| cont-front:total | digits | 175.68 | 175.85 | 0.17 |
| cont-front:rows.0.from.year | digits | 49.7 | 49.77 | 0.07 |
| cont-front:rows.0.from.month | digits | 57.95 | 57.92 | -0.03 |
| cont-front:rows.0.from.day | digits | 66.46 | 66.47 | 0.01 |
| cont-front:rows.0.to.year | digits | 49.7 | 49.77 | 0.07 |
| cont-front:rows.0.to.month | digits | 57.95 | 57.92 | -0.03 |
| cont-front:rows.0.to.day | digits | 66.46 | 66.47 | 0.01 |
| cont-front:rows.0.num | digits | 24.47 | 24.43 | -0.04 |
| cont-front:rows.1.from.year | digits | 49.7 | 49.77 | 0.07 |
| cont-front:rows.1.from.month | digits | 57.95 | 57.92 | -0.03 |
| cont-front:rows.1.from.day | digits | 66.46 | 66.47 | 0.01 |
| cont-front:rows.1.to.year | digits | 49.7 | 49.77 | 0.07 |
| cont-front:rows.1.to.month | digits | 57.95 | 57.92 | -0.03 |
| cont-front:rows.1.to.day | digits | 66.46 | 66.47 | 0.01 |
| cont-front:rows.1.num | digits | 24.47 | 24.43 | -0.04 |
| cont-front:rows.2.from.year | digits | 49.7 | 49.77 | 0.07 |
| cont-front:rows.2.from.month | digits | 57.95 | 57.92 | -0.03 |
| cont-front:rows.2.from.day | digits | 66.46 | 66.47 | 0.01 |
| cont-front:rows.2.to.year | digits | 49.7 | 49.77 | 0.07 |
| cont-front:rows.2.to.month | digits | 57.95 | 57.92 | -0.03 |
| cont-front:rows.2.to.day | digits | 66.46 | 66.47 | 0.01 |
| cont-front:rows.2.num | digits | 24.47 | 24.43 | -0.04 |
| cont-front:rows.3.from.year | digits | 49.7 | 49.77 | 0.07 |
| cont-front:rows.3.from.month | digits | 57.95 | 57.92 | -0.03 |
| cont-front:rows.3.from.day | digits | 66.46 | 66.47 | 0.01 |
| cont-front:rows.3.to.year | digits | 49.7 | 49.77 | 0.07 |
| cont-front:rows.3.to.month | digits | 57.95 | 57.92 | -0.03 |
| cont-front:rows.3.to.day | digits | 66.46 | 66.47 | 0.01 |
| cont-front:rows.3.num | digits | 24.47 | 24.43 | -0.04 |
| cont-front:rows.4.from.year | digits | 49.7 | 49.77 | 0.07 |
| cont-front:rows.4.from.month | digits | 57.95 | 57.92 | -0.03 |
| cont-front:rows.4.from.day | digits | 66.46 | 66.47 | 0.01 |
| cont-front:rows.4.to.year | digits | 49.7 | 49.77 | 0.07 |
| cont-front:rows.4.to.month | digits | 57.95 | 57.92 | -0.03 |
| cont-front:rows.4.to.day | digits | 66.46 | 66.47 | 0.01 |
| cont-front:rows.4.num | digits | 24.47 | 24.43 | -0.04 |
| cont-back:rows.0.from.year | digits | 49.7 | 49.77 | 0.07 |
| cont-back:rows.0.from.month | digits | 57.95 | 57.92 | -0.03 |
| cont-back:rows.0.from.day | digits | 66.46 | 66.47 | 0.01 |
| cont-back:rows.0.to.year | digits | 49.7 | 49.77 | 0.07 |
| cont-back:rows.0.to.month | digits | 57.95 | 57.92 | -0.03 |
| cont-back:rows.0.to.day | digits | 66.46 | 66.47 | 0.01 |
| cont-back:rows.0.num | digits | 24.47 | 24.43 | -0.04 |
| cont-back:rows.1.from.year | digits | 49.7 | 49.77 | 0.07 |
| cont-back:rows.1.from.month | digits | 57.95 | 57.92 | -0.03 |
| cont-back:rows.1.from.day | digits | 66.46 | 66.47 | 0.01 |
| cont-back:rows.1.to.year | digits | 49.7 | 49.77 | 0.07 |
| cont-back:rows.1.to.month | digits | 57.95 | 57.92 | -0.03 |
| cont-back:rows.1.to.day | digits | 66.46 | 66.47 | 0.01 |
| cont-back:rows.1.num | digits | 24.47 | 24.43 | -0.04 |
| cont-back:rows.2.from.year | digits | 49.7 | 49.77 | 0.07 |
| cont-back:rows.2.from.month | digits | 57.95 | 57.92 | -0.03 |
| cont-back:rows.2.from.day | digits | 66.46 | 66.47 | 0.01 |
| cont-back:rows.2.to.year | digits | 49.7 | 49.77 | 0.07 |
| cont-back:rows.2.to.month | digits | 57.95 | 57.92 | -0.03 |
| cont-back:rows.2.to.day | digits | 66.46 | 66.47 | 0.01 |
| cont-back:rows.2.num | digits | 24.47 | 24.43 | -0.04 |
| cont-back:rows.3.from.year | digits | 49.7 | 49.77 | 0.07 |
| cont-back:rows.3.from.month | digits | 57.95 | 57.92 | -0.03 |
| cont-back:rows.3.from.day | digits | 66.46 | 66.47 | 0.01 |
| cont-back:rows.3.to.year | digits | 49.7 | 49.77 | 0.07 |
| cont-back:rows.3.to.month | digits | 57.95 | 57.92 | -0.03 |
| cont-back:rows.3.to.day | digits | 66.46 | 66.47 | 0.01 |
| cont-back:rows.3.num | digits | 24.47 | 24.43 | -0.04 |
| cont-back:rows.4.from.year | digits | 49.7 | 49.77 | 0.07 |
| cont-back:rows.4.from.month | digits | 57.95 | 57.92 | -0.03 |
| cont-back:rows.4.from.day | digits | 66.46 | 66.47 | 0.01 |
| cont-back:rows.4.to.year | digits | 49.7 | 49.77 | 0.07 |
| cont-back:rows.4.to.month | digits | 57.95 | 57.92 | -0.03 |
| cont-back:rows.4.to.day | digits | 66.46 | 66.47 | 0.01 |
| cont-back:rows.4.num | digits | 24.47 | 24.43 | -0.04 |
| cont-back:rows.5.from.year | digits | 49.7 | 49.77 | 0.07 |
| cont-back:rows.5.from.month | digits | 57.95 | 57.92 | -0.03 |
| cont-back:rows.5.from.day | digits | 66.46 | 66.47 | 0.01 |
| cont-back:rows.5.to.year | digits | 49.7 | 49.77 | 0.07 |
| cont-back:rows.5.to.month | digits | 57.95 | 57.92 | -0.03 |
| cont-back:rows.5.to.day | digits | 66.46 | 66.47 | 0.01 |
| cont-back:rows.5.num | digits | 24.47 | 24.43 | -0.04 |
| cont-back:moushitate.year | digits | 38.1 | 38.15 | 0.05 |
| cont-back:moushitate.month | digits | 52.15 | 52.14 | -0.01 |
| cont-back:moushitate.day | digits | 64.64 | 64.65 | 0.01 |
| main-front:hatsubyou.gengou.showa | circle | 59.12,59.4 | 59.1,59.4 | x-0.02 y0 |
| main-front:hatsubyou.gengou.heisei | circle | 70.15,59.4 | 70.1,59.4 | x-0.05 y0 |
| main-front:hatsubyou.gengou.reiwa | circle | 81.29,59.4 | 81.3,59.4 | x0.01 y0 |
| main-front:shoshin.gengou.showa | circle | 189.93,59.33 | 189.9,59.4 | x-0.03 y0.07 |
| main-front:shoshin.gengou.heisei | circle | 200.95,59.33 | 200.9,59.4 | x-0.04 y0.07 |
| main-front:shoshin.gengou.reiwa | circle | 212.09,59.33 | 212.1,59.4 | x0.01 y0.07 |
| main-front:rows.0.from.gengou.showa | circle | 33.75,127.2 | 33.8,127.22 | x0.05 y0.03 |
| main-front:rows.0.from.gengou.heisei | circle | 43.01,127.2 | 43,127.22 | x-0.01 y0.03 |
| main-front:rows.0.from.gengou.reiwa | circle | 52.36,127.2 | 52.4,127.22 | x0.04 y0.03 |
| main-front:rows.0.to.gengou.showa | circle | 33.75,134.49 | 33.8,134.52 | x0.05 y0.03 |
| main-front:rows.0.to.gengou.heisei | circle | 43.01,134.49 | 43,134.52 | x-0.01 y0.03 |
| main-front:rows.0.to.gengou.reiwa | circle | 52.36,134.49 | 52.4,134.52 | x0.04 y0.03 |
| main-front:rows.0.jushinAri | circle | 42.38,141.82 | 42.4,141.82 | x0.02 y0 |
| main-front:rows.0.jushinNashi | circle | 77.81,141.82 | 77.8,141.82 | x-0.01 y0 |
| main-front:rows.1.from.gengou.showa | circle | 33.99,183.01 | 33.8,183.31 | x-0.2 y0.31 |
| main-front:rows.1.from.gengou.heisei | circle | 43.25,183.01 | 43,183.31 | x-0.25 y0.31 |
| main-front:rows.1.from.gengou.reiwa | circle | 52.6,183.01 | 52.4,183.31 | x-0.2 y0.31 |
| main-front:rows.1.to.gengou.showa | circle | 33.99,190.3 | 33.8,190.61 | x-0.2 y0.31 |
| main-front:rows.1.to.gengou.heisei | circle | 43.25,190.3 | 43,190.61 | x-0.25 y0.31 |
| main-front:rows.1.to.gengou.reiwa | circle | 52.6,190.3 | 52.4,190.61 | x-0.2 y0.31 |
| main-front:rows.1.jushinAri | circle | 42.42,197.91 | 42.4,197.91 | x-0.02 y0 |
| main-front:rows.1.jushinNashi | circle | 77.81,197.91 | 77.8,197.91 | x-0.01 y0 |
| main-front:rows.2.from.gengou.showa | circle | 33.89,239.3 | 33.8,239.4 | x-0.09 y0.1 |
| main-front:rows.2.from.gengou.heisei | circle | 43.15,239.3 | 43,239.4 | x-0.15 y0.1 |
| main-front:rows.2.from.gengou.reiwa | circle | 52.5,239.3 | 52.4,239.4 | x-0.1 y0.1 |
| main-front:rows.2.to.gengou.showa | circle | 33.89,246.6 | 33.8,246.70000000000002 | x-0.09 y0.11 |
| main-front:rows.2.to.gengou.heisei | circle | 43.15,246.6 | 43,246.70000000000002 | x-0.15 y0.11 |
| main-front:rows.2.to.gengou.reiwa | circle | 52.5,246.6 | 52.4,246.70000000000002 | x-0.1 y0.11 |
| main-front:rows.2.jushinAri | circle | 42.38,254 | 42.4,254 | x0.02 y0 |
| main-front:rows.2.jushinNashi | circle | 77.81,254 | 77.8,254 | x-0.01 y0 |
| main-front:rows.3.from.gengou.showa | circle | 33.89,295.24 | 33.8,295.49 | x-0.09 y0.25 |
| main-front:rows.3.from.gengou.heisei | circle | 43.15,295.24 | 43,295.49 | x-0.15 y0.25 |
| main-front:rows.3.from.gengou.reiwa | circle | 52.5,295.24 | 52.4,295.49 | x-0.1 y0.25 |
| main-front:rows.3.to.gengou.showa | circle | 33.89,302.53 | 33.8,302.78999999999996 | x-0.09 y0.26 |
| main-front:rows.3.to.gengou.heisei | circle | 43.15,302.53 | 43,302.78999999999996 | x-0.15 y0.26 |
| main-front:rows.3.to.gengou.reiwa | circle | 52.5,302.53 | 52.4,302.78999999999996 | x-0.1 y0.26 |
| main-front:rows.3.jushinAri | circle | 42.38,310.09 | 42.4,310.09 | x0.02 y0 |
| main-front:rows.3.jushinNashi | circle | 77.81,310.09 | 77.8,310.09 | x-0.01 y0 |
| main-front:rows.4.from.gengou.showa | circle | 33.89,351.41 | 33.8,351.58000000000004 | x-0.09 y0.18 |
| main-front:rows.4.from.gengou.heisei | circle | 43.15,351.41 | 43,351.58000000000004 | x-0.15 y0.18 |
| main-front:rows.4.from.gengou.reiwa | circle | 52.5,351.41 | 52.4,351.58000000000004 | x-0.1 y0.18 |
| main-front:rows.4.to.gengou.showa | circle | 33.89,358.7 | 33.8,358.88 | x-0.09 y0.18 |
| main-front:rows.4.to.gengou.heisei | circle | 43.15,358.7 | 43,358.88 | x-0.15 y0.18 |
| main-front:rows.4.to.gengou.reiwa | circle | 52.5,358.7 | 52.4,358.88 | x-0.1 y0.18 |
| main-front:rows.4.jushinAri | circle | 42.38,366.18 | 42.4,366.18 | x0.02 y0 |
| main-front:rows.4.jushinNashi | circle | 77.81,366.18 | 77.8,366.18 | x-0.01 y0 |
| main-back:ninteibi.gengou.showa | circle | 61.61,37.57 | 61.6,37.6 | x-0.01 y0.03 |
| main-back:ninteibi.gengou.heisei | circle | 73.95,37.57 | 74,37.6 | x0.05 y0.03 |
| main-back:ninteibi.gengou.reiwa | circle | 86.3,37.57 | 86.3,37.6 | x0 y0.03 |
| main-back:sections.0.reasons.0 | circle | 142.79,89.37 | 142.8,89.4 | x0.01 y0.03 |
| main-back:sections.0.reasons.1 | circle | 142.54,95.33 | 142.8,95.4 | x0.26 y0.07 |
| main-back:sections.0.reasons.2 | circle | 142.96,101.39 | 142.8,101.4 | x-0.16 y0.01 |
| main-back:sections.0.reasons.3 | circle | 142.79,107.4 | 142.8,107.3 | x0.01 y-0.1 |
| main-back:sections.0.reasons.4 | circle | 142.92,113.24 | 142.8,113.3 | x-0.12 y0.06 |
| main-back:sections.0.daily.0.0 | circle | 170.31,122.89 | 170.3,122.9 | x-0.01 y0.01 |
| main-back:sections.0.daily.0.1 | circle | 178.65,122.89 | 178.7,122.9 | x0.05 y0.01 |
| main-back:sections.0.daily.0.2 | circle | 186.99,122.89 | 187,122.9 | x0.01 y0.01 |
| main-back:sections.0.daily.0.3 | circle | 195.2,122.89 | 195.3,122.9 | x0.1 y0.01 |
| main-back:sections.0.daily.0.4 | circle | 228.56,122.89 | 228.5,122.9 | x-0.06 y0.01 |
| main-back:sections.0.daily.0.5 | circle | 236.98,122.89 | 237,122.9 | x0.02 y0.01 |
| main-back:sections.0.daily.0.6 | circle | 245.28,122.89 | 245.3,122.9 | x0.02 y0.01 |
| main-back:sections.0.daily.0.7 | circle | 253.53,122.89 | 253.5,122.9 | x-0.03 y0.01 |
| main-back:sections.0.daily.1.0 | circle | 170.31,129.41 | 170.3,129.4 | x-0.01 y-0.01 |
| main-back:sections.0.daily.1.1 | circle | 178.65,129.41 | 178.7,129.4 | x0.05 y-0.01 |
| main-back:sections.0.daily.1.2 | circle | 186.99,129.41 | 187,129.4 | x0.01 y-0.01 |
| main-back:sections.0.daily.1.3 | circle | 195.2,129.41 | 195.3,129.4 | x0.1 y-0.01 |
| main-back:sections.0.daily.1.4 | circle | 228.56,129.41 | 228.5,129.4 | x-0.06 y-0.01 |
| main-back:sections.0.daily.1.5 | circle | 236.98,129.41 | 237,129.4 | x0.02 y-0.01 |
| main-back:sections.0.daily.1.6 | circle | 245.28,129.41 | 245.3,129.4 | x0.02 y-0.01 |
| main-back:sections.0.daily.1.7 | circle | 253.53,129.41 | 253.5,129.4 | x-0.03 y-0.01 |
| main-back:sections.0.daily.2.0 | circle | 170.31,135.97 | 170.3,136 | x-0.01 y0.03 |
| main-back:sections.0.daily.2.1 | circle | 178.65,135.97 | 178.7,136 | x0.05 y0.03 |
| main-back:sections.0.daily.2.2 | circle | 186.99,135.97 | 187,136 | x0.01 y0.03 |
| main-back:sections.0.daily.2.3 | circle | 195.2,135.97 | 195.3,136 | x0.1 y0.03 |
| main-back:sections.0.daily.2.4 | circle | 228.56,135.97 | 228.5,136 | x-0.06 y0.03 |
| main-back:sections.0.daily.2.5 | circle | 236.98,135.97 | 237,136 | x0.02 y0.03 |
| main-back:sections.0.daily.2.6 | circle | 245.28,135.97 | 245.3,136 | x0.02 y0.03 |
| main-back:sections.0.daily.2.7 | circle | 253.53,135.97 | 253.5,136 | x-0.03 y0.03 |
| main-back:sections.0.daily.3.0 | circle | 170.31,142.49 | 170.3,142.5 | x-0.01 y0.01 |
| main-back:sections.0.daily.3.1 | circle | 178.65,142.49 | 178.7,142.5 | x0.05 y0.01 |
| main-back:sections.0.daily.3.2 | circle | 186.99,142.49 | 187,142.5 | x0.01 y0.01 |
| main-back:sections.0.daily.3.3 | circle | 195.2,142.49 | 195.3,142.5 | x0.1 y0.01 |
| main-back:sections.0.daily.3.4 | circle | 228.56,142.49 | 228.5,142.5 | x-0.06 y0.01 |
| main-back:sections.0.daily.3.5 | circle | 236.98,142.49 | 237,142.5 | x0.02 y0.01 |
| main-back:sections.0.daily.3.6 | circle | 245.28,142.49 | 245.3,142.5 | x0.02 y0.01 |
| main-back:sections.0.daily.3.7 | circle | 253.53,142.49 | 253.5,142.5 | x-0.03 y0.01 |
| main-back:sections.0.daily.4.0 | circle | 170.31,149.01 | 170.3,149 | x-0.01 y-0.01 |
| main-back:sections.0.daily.4.1 | circle | 178.65,149.01 | 178.7,149 | x0.05 y-0.01 |
| main-back:sections.0.daily.4.2 | circle | 186.99,149.01 | 187,149 | x0.01 y-0.01 |
| main-back:sections.0.daily.4.3 | circle | 195.2,149.01 | 195.3,149 | x0.1 y-0.01 |
| main-back:sections.0.daily.4.4 | circle | 228.56,149.01 | 228.5,149 | x-0.06 y-0.01 |
| main-back:sections.0.daily.4.5 | circle | 236.98,149.01 | 237,149 | x0.02 y-0.01 |
| main-back:sections.0.daily.4.6 | circle | 245.28,149.01 | 245.3,149 | x0.02 y-0.01 |
| main-back:sections.0.daily.4.7 | circle | 253.53,149.01 | 253.5,149 | x-0.03 y-0.01 |
| main-back:sections.1.reasons.0 | circle | 142.79,232.58 | 142.8,232.63 | x0.01 y0.05 |
| main-back:sections.1.reasons.1 | circle | 142.54,238.59 | 142.8,238.63 | x0.26 y0.04 |
| main-back:sections.1.reasons.2 | circle | 142.96,244.6 | 142.8,244.63 | x-0.16 y0.03 |
| main-back:sections.1.reasons.3 | circle | 142.83,250.57 | 142.8,250.52999999999997 | x-0.03 y-0.04 |
| main-back:sections.1.reasons.4 | circle | 142.92,256.5 | 142.8,256.53 | x-0.12 y0.03 |
| main-back:sections.1.daily.0.0 | circle | 170.31,266.11 | 170.3,266.13 | x-0.01 y0.02 |
| main-back:sections.1.daily.0.1 | circle | 178.65,266.11 | 178.7,266.13 | x0.05 y0.02 |
| main-back:sections.1.daily.0.2 | circle | 186.99,266.11 | 187,266.13 | x0.01 y0.02 |
| main-back:sections.1.daily.0.3 | circle | 195.24,266.11 | 195.3,266.13 | x0.06 y0.02 |
| main-back:sections.1.daily.0.4 | circle | 228.56,266.11 | 228.5,266.13 | x-0.06 y0.02 |
| main-back:sections.1.daily.0.5 | circle | 236.98,266.11 | 237,266.13 | x0.02 y0.02 |
| main-back:sections.1.daily.0.6 | circle | 245.28,266.11 | 245.3,266.13 | x0.02 y0.02 |
| main-back:sections.1.daily.0.7 | circle | 253.53,266.11 | 253.5,266.13 | x-0.03 y0.02 |
| main-back:sections.1.daily.1.0 | circle | 170.31,272.63 | 170.3,272.63 | x-0.01 y0 |
| main-back:sections.1.daily.1.1 | circle | 178.65,272.63 | 178.7,272.63 | x0.05 y0 |
| main-back:sections.1.daily.1.2 | circle | 186.99,272.63 | 187,272.63 | x0.01 y0 |
| main-back:sections.1.daily.1.3 | circle | 195.24,272.63 | 195.3,272.63 | x0.06 y0 |
| main-back:sections.1.daily.1.4 | circle | 228.56,272.63 | 228.5,272.63 | x-0.06 y0 |
| main-back:sections.1.daily.1.5 | circle | 236.98,272.63 | 237,272.63 | x0.02 y0 |
| main-back:sections.1.daily.1.6 | circle | 245.28,272.63 | 245.3,272.63 | x0.02 y0 |
| main-back:sections.1.daily.1.7 | circle | 253.53,272.63 | 253.5,272.63 | x-0.03 y0 |
| main-back:sections.1.daily.2.0 | circle | 170.31,279.15 | 170.3,279.23 | x-0.01 y0.08 |
| main-back:sections.1.daily.2.1 | circle | 178.65,279.15 | 178.7,279.23 | x0.05 y0.08 |
| main-back:sections.1.daily.2.2 | circle | 186.99,279.15 | 187,279.23 | x0.01 y0.08 |
| main-back:sections.1.daily.2.3 | circle | 195.24,279.15 | 195.3,279.23 | x0.06 y0.08 |
| main-back:sections.1.daily.2.4 | circle | 228.56,279.15 | 228.5,279.23 | x-0.06 y0.08 |
| main-back:sections.1.daily.2.5 | circle | 236.98,279.15 | 237,279.23 | x0.02 y0.08 |
| main-back:sections.1.daily.2.6 | circle | 245.28,279.15 | 245.3,279.23 | x0.02 y0.08 |
| main-back:sections.1.daily.2.7 | circle | 253.53,279.15 | 253.5,279.23 | x-0.03 y0.08 |
| main-back:sections.1.daily.3.0 | circle | 170.31,285.67 | 170.3,285.73 | x-0.01 y0.06 |
| main-back:sections.1.daily.3.1 | circle | 178.65,285.71 | 178.7,285.73 | x0.05 y0.02 |
| main-back:sections.1.daily.3.2 | circle | 186.99,285.67 | 187,285.73 | x0.01 y0.06 |
| main-back:sections.1.daily.3.3 | circle | 195.24,285.67 | 195.3,285.73 | x0.06 y0.06 |
| main-back:sections.1.daily.3.4 | circle | 228.56,285.67 | 228.5,285.73 | x-0.06 y0.06 |
| main-back:sections.1.daily.3.5 | circle | 236.98,285.71 | 237,285.73 | x0.02 y0.02 |
| main-back:sections.1.daily.3.6 | circle | 245.28,285.67 | 245.3,285.73 | x0.02 y0.06 |
| main-back:sections.1.daily.3.7 | circle | 253.53,285.67 | 253.5,285.73 | x-0.03 y0.06 |
| main-back:sections.1.daily.4.0 | circle | 170.31,292.23 | 170.3,292.23 | x-0.01 y0 |
| main-back:sections.1.daily.4.1 | circle | 178.65,292.23 | 178.7,292.23 | x0.05 y0 |
| main-back:sections.1.daily.4.2 | circle | 186.99,292.23 | 187,292.23 | x0.01 y0 |
| main-back:sections.1.daily.4.3 | circle | 195.2,292.23 | 195.3,292.23 | x0.1 y0 |
| main-back:sections.1.daily.4.4 | circle | 228.56,292.23 | 228.5,292.23 | x-0.06 y0 |
| main-back:sections.1.daily.4.5 | circle | 236.98,292.23 | 237,292.23 | x0.02 y0 |
| main-back:sections.1.daily.4.6 | circle | 245.28,292.23 | 245.3,292.23 | x0.02 y0 |
| main-back:sections.1.daily.4.7 | circle | 253.53,292.23 | 253.5,292.23 | x-0.03 y0 |
| main-back:techouKofu.0 | circle | 142.88,320.46 | 142.9,320.5 | x0.03 y0.04 |
| main-back:techouKofu.1 | circle | 180.34,320.46 | 180.4,320.5 | x0.06 y0.04 |
| main-back:techouKofu.2 | circle | 221.95,320.46 | 222,320.5 | x0.05 y0.04 |
| main-back:techou.0.kinds.0 | circle | 147.79,329.14 | 148,329.2 | x0.21 y0.06 |
| main-back:techou.0.kinds.1 | circle | 156.13,329.18 | 156.2,329.2 | x0.07 y0.02 |
| main-back:techou.0.kinds.2 | circle | 164.38,329.18 | 164.4,329.2 | x0.02 y0.02 |
| main-back:techou.0.kinds.3 | circle | 172.68,329.27 | 172.6,329.2 | x-0.08 y-0.07 |
| main-back:techou.0.date.gengou.showa | circle | 149.68,335.09 | 149.7,335.1 | x0.02 y0.01 |
| main-back:techou.0.date.gengou.heisei | circle | 158.93,335.09 | 158.9,335.1 | x-0.03 y0.01 |
| main-back:techou.0.date.gengou.reiwa | circle | 168.28,335.09 | 168.3,335.1 | x0.03 y0.01 |
| main-back:techou.1.kinds.0 | circle | 147.79,352.42 | 148,352.5 | x0.21 y0.08 |
| main-back:techou.1.kinds.1 | circle | 156.13,352.47 | 156.2,352.5 | x0.07 y0.03 |
| main-back:techou.1.kinds.2 | circle | 164.38,352.47 | 164.4,352.5 | x0.02 y0.03 |
| main-back:techou.1.kinds.3 | circle | 172.68,352.55 | 172.6,352.5 | x-0.08 y-0.05 |
| main-back:techou.1.date.gengou.showa | circle | 149.6,358.5 | 149.7,358.40000000000003 | x0.1 y-0.1 |
| main-back:techou.1.date.gengou.heisei | circle | 158.86,358.5 | 158.9,358.40000000000003 | x0.04 y-0.1 |
| main-back:techou.1.date.gengou.reiwa | circle | 168.21,358.5 | 168.3,358.40000000000003 | x0.1 y-0.1 |
| cont-front:rows.0.from.gengou.showa | circle | 33.46,81.88 | 33.46,81.9 | x0.01 y0.03 |
| cont-front:rows.0.from.gengou.heisei | circle | 39.31,81.88 | 39.31,81.9 | x0.01 y0.03 |
| cont-front:rows.0.from.gengou.reiwa | circle | 45.16,81.88 | 45.16,81.9 | x0 y0.03 |
| cont-front:rows.0.to.gengou.showa | circle | 33.46,86.36 | 33.46,86.45 | x0.01 y0.09 |
| cont-front:rows.0.to.gengou.heisei | circle | 39.31,86.36 | 39.31,86.45 | x0.01 y0.09 |
| cont-front:rows.0.to.gengou.reiwa | circle | 45.16,86.36 | 45.16,86.45 | x0 y0.09 |
| cont-front:rows.0.jushinAri | circle | 41.34,90.73 | 41.34,90.73 | x0 y0 |
| cont-front:rows.0.jushinNashi | circle | 63.65,90.73 | 63.65,90.73 | x0.01 y0 |
| cont-front:rows.1.from.gengou.showa | circle | 33.46,118.29 | 33.46,118.31 | x0.01 y0.02 |
| cont-front:rows.1.from.gengou.heisei | circle | 39.31,118.29 | 39.31,118.31 | x0.01 y0.02 |
| cont-front:rows.1.from.gengou.reiwa | circle | 45.16,118.29 | 45.16,118.31 | x0 y0.02 |
| cont-front:rows.1.to.gengou.showa | circle | 33.46,122.78 | 33.46,122.86 | x0.01 y0.08 |
| cont-front:rows.1.to.gengou.heisei | circle | 39.31,122.78 | 39.31,122.86 | x0.01 y0.08 |
| cont-front:rows.1.to.gengou.reiwa | circle | 45.16,122.78 | 45.16,122.86 | x0 y0.08 |
| cont-front:rows.1.jushinAri | circle | 41.34,127.15 | 41.34,127.14 | x0 y-0.01 |
| cont-front:rows.1.jushinNashi | circle | 63.65,127.15 | 63.65,127.14 | x0.01 y-0.01 |
| cont-front:rows.2.from.gengou.showa | circle | 33.46,154.7 | 33.46,154.71999999999997 | x0.01 y0.01 |
| cont-front:rows.2.from.gengou.heisei | circle | 39.31,154.7 | 39.31,154.71999999999997 | x0.01 y0.01 |
| cont-front:rows.2.from.gengou.reiwa | circle | 45.16,154.7 | 45.16,154.71999999999997 | x0 y0.01 |
| cont-front:rows.2.to.gengou.showa | circle | 33.46,159.19 | 33.46,159.26999999999998 | x0.01 y0.08 |
| cont-front:rows.2.to.gengou.heisei | circle | 39.31,159.19 | 39.31,159.26999999999998 | x0.01 y0.08 |
| cont-front:rows.2.to.gengou.reiwa | circle | 45.16,159.19 | 45.16,159.26999999999998 | x0 y0.08 |
| cont-front:rows.2.jushinAri | circle | 41.34,163.56 | 41.34,163.54999999999998 | x0 y-0.01 |
| cont-front:rows.2.jushinNashi | circle | 63.65,163.56 | 63.65,163.54999999999998 | x0.01 y-0.01 |
| cont-front:rows.3.from.gengou.showa | circle | 33.46,191.11 | 33.46,191.13 | x0.01 y0.02 |
| cont-front:rows.3.from.gengou.heisei | circle | 39.31,191.11 | 39.31,191.13 | x0.01 y0.02 |
| cont-front:rows.3.from.gengou.reiwa | circle | 45.16,191.11 | 45.16,191.13 | x0 y0.02 |
| cont-front:rows.3.to.gengou.showa | circle | 33.46,195.6 | 33.46,195.68 | x0.01 y0.08 |
| cont-front:rows.3.to.gengou.heisei | circle | 39.31,195.6 | 39.31,195.68 | x0.01 y0.08 |
| cont-front:rows.3.to.gengou.reiwa | circle | 45.16,195.6 | 45.16,195.68 | x0 y0.08 |
| cont-front:rows.3.jushinAri | circle | 41.34,199.97 | 41.34,199.96 | x0 y-0.01 |
| cont-front:rows.3.jushinNashi | circle | 63.65,199.97 | 63.65,199.96 | x0.01 y-0.01 |
| cont-front:rows.4.from.gengou.showa | circle | 33.46,227.53 | 33.46,227.53999999999996 | x0.01 y0.01 |
| cont-front:rows.4.from.gengou.heisei | circle | 39.31,227.53 | 39.31,227.53999999999996 | x0.01 y0.01 |
| cont-front:rows.4.from.gengou.reiwa | circle | 45.16,227.53 | 45.16,227.53999999999996 | x0 y0.01 |
| cont-front:rows.4.to.gengou.showa | circle | 33.46,232.02 | 33.46,232.08999999999997 | x0.01 y0.07 |
| cont-front:rows.4.to.gengou.heisei | circle | 39.31,232.02 | 39.31,232.08999999999997 | x0.01 y0.07 |
| cont-front:rows.4.to.gengou.reiwa | circle | 45.16,232.02 | 45.16,232.08999999999997 | x0 y0.07 |
| cont-front:rows.4.jushinAri | circle | 41.34,236.39 | 41.34,236.36999999999998 | x0 y-0.02 |
| cont-front:rows.4.jushinNashi | circle | 63.65,236.39 | 63.65,236.36999999999998 | x0.01 y-0.02 |
| cont-back:rows.0.from.gengou.showa | circle | 33.46,21.33 | 33.46,21.36 | x0.01 y0.03 |
| cont-back:rows.0.from.gengou.heisei | circle | 39.31,21.33 | 39.31,21.36 | x0.01 y0.03 |
| cont-back:rows.0.from.gengou.reiwa | circle | 45.16,21.33 | 45.16,21.36 | x0 y0.03 |
| cont-back:rows.0.to.gengou.showa | circle | 33.46,25.82 | 33.46,25.91 | x0.01 y0.1 |
| cont-back:rows.0.to.gengou.heisei | circle | 39.31,25.82 | 39.31,25.91 | x0.01 y0.1 |
| cont-back:rows.0.to.gengou.reiwa | circle | 45.16,25.82 | 45.16,25.91 | x0 y0.1 |
| cont-back:rows.0.jushinAri | circle | 41.34,30.19 | 41.34,30.189999999999998 | x0 y0 |
| cont-back:rows.0.jushinNashi | circle | 63.65,30.19 | 63.65,30.189999999999998 | x0.01 y0 |
| cont-back:rows.1.from.gengou.showa | circle | 33.46,57.75 | 33.46,57.769999999999996 | x0.01 y0.02 |
| cont-back:rows.1.from.gengou.heisei | circle | 39.31,57.75 | 39.31,57.769999999999996 | x0.01 y0.02 |
| cont-back:rows.1.from.gengou.reiwa | circle | 45.16,57.75 | 45.16,57.769999999999996 | x0 y0.02 |
| cont-back:rows.1.to.gengou.showa | circle | 33.46,62.23 | 33.46,62.31999999999999 | x0.01 y0.09 |
| cont-back:rows.1.to.gengou.heisei | circle | 39.31,62.23 | 39.31,62.31999999999999 | x0.01 y0.09 |
| cont-back:rows.1.to.gengou.reiwa | circle | 45.16,62.23 | 45.16,62.31999999999999 | x0 y0.09 |
| cont-back:rows.1.jushinAri | circle | 41.34,66.6 | 41.34,66.6 | x0 y0 |
| cont-back:rows.1.jushinNashi | circle | 63.65,66.6 | 63.65,66.6 | x0.01 y0 |
| cont-back:rows.2.from.gengou.showa | circle | 33.46,94.15 | 33.46,94.17999999999999 | x0.01 y0.03 |
| cont-back:rows.2.from.gengou.heisei | circle | 39.31,94.15 | 39.31,94.17999999999999 | x0.01 y0.03 |
| cont-back:rows.2.from.gengou.reiwa | circle | 45.16,94.15 | 45.16,94.17999999999999 | x0 y0.03 |
| cont-back:rows.2.to.gengou.showa | circle | 33.46,98.64 | 33.46,98.72999999999999 | x0.01 y0.09 |
| cont-back:rows.2.to.gengou.heisei | circle | 39.31,98.64 | 39.31,98.72999999999999 | x0.01 y0.09 |
| cont-back:rows.2.to.gengou.reiwa | circle | 45.16,98.64 | 45.16,98.72999999999999 | x0 y0.09 |
| cont-back:rows.2.jushinAri | circle | 41.34,103.02 | 41.34,103.00999999999999 | x0 y-0.01 |
| cont-back:rows.2.jushinNashi | circle | 63.65,103.02 | 63.65,103.00999999999999 | x0.01 y-0.01 |
| cont-back:rows.3.from.gengou.showa | circle | 33.46,130.57 | 33.46,130.58999999999997 | x0.01 y0.02 |
| cont-back:rows.3.from.gengou.heisei | circle | 39.31,130.57 | 39.31,130.58999999999997 | x0.01 y0.02 |
| cont-back:rows.3.from.gengou.reiwa | circle | 45.16,130.57 | 45.16,130.58999999999997 | x0 y0.02 |
| cont-back:rows.3.to.gengou.showa | circle | 33.46,135.06 | 33.46,135.14 | x0.01 y0.08 |
| cont-back:rows.3.to.gengou.heisei | circle | 39.31,135.06 | 39.31,135.14 | x0.01 y0.08 |
| cont-back:rows.3.to.gengou.reiwa | circle | 45.16,135.06 | 45.16,135.14 | x0 y0.08 |
| cont-back:rows.3.jushinAri | circle | 41.34,139.43 | 41.34,139.42 | x0 y-0.01 |
| cont-back:rows.3.jushinNashi | circle | 63.65,139.43 | 63.65,139.42 | x0.01 y-0.01 |
| cont-back:rows.4.from.gengou.showa | circle | 33.46,166.98 | 33.46,166.99999999999997 | x0.01 y0.02 |
| cont-back:rows.4.from.gengou.heisei | circle | 39.31,166.98 | 39.31,166.99999999999997 | x0.01 y0.02 |
| cont-back:rows.4.from.gengou.reiwa | circle | 45.16,166.98 | 45.16,166.99999999999997 | x0 y0.02 |
| cont-back:rows.4.to.gengou.showa | circle | 33.46,171.47 | 33.46,171.54999999999998 | x0.01 y0.08 |
| cont-back:rows.4.to.gengou.heisei | circle | 39.31,171.47 | 39.31,171.54999999999998 | x0.01 y0.08 |
| cont-back:rows.4.to.gengou.reiwa | circle | 45.16,171.47 | 45.16,171.54999999999998 | x0 y0.08 |
| cont-back:rows.4.jushinAri | circle | 41.34,175.84 | 41.34,175.82999999999998 | x0 y-0.01 |
| cont-back:rows.4.jushinNashi | circle | 63.65,175.84 | 63.65,175.82999999999998 | x0.01 y-0.01 |
| cont-back:rows.5.from.gengou.showa | circle | 33.46,203.39 | 33.46,203.40999999999997 | x0.01 y0.02 |
| cont-back:rows.5.from.gengou.heisei | circle | 39.31,203.39 | 39.31,203.40999999999997 | x0.01 y0.02 |
| cont-back:rows.5.from.gengou.reiwa | circle | 45.16,203.39 | 45.16,203.40999999999997 | x0 y0.02 |
| cont-back:rows.5.to.gengou.showa | circle | 33.46,207.89 | 33.46,207.95999999999998 | x0.01 y0.07 |
| cont-back:rows.5.to.gengou.heisei | circle | 39.31,207.89 | 39.31,207.95999999999998 | x0.01 y0.07 |
| cont-back:rows.5.to.gengou.reiwa | circle | 45.16,207.89 | 45.16,207.95999999999998 | x0 y0.07 |
| cont-back:rows.5.jushinAri | circle | 41.34,212.26 | 41.34,212.23999999999998 | x0 y-0.02 |
| cont-back:rows.5.jushinNashi | circle | 63.65,212.26 | 63.65,212.23999999999998 | x0.01 y-0.02 |
