// 日本年金機構の公式PDFをpt座標で測り、mmへ換算した印字領域。
export const PAPER = { main: { width: 297, height: 420 }, continuation: { width: 210, height: 297 } } as const;
export const MAIN_FRONT = {
  byoumei: { x: 90, y: 42, w: 187, h: 8 }, hatsubyou: { x: 90, y: 51, w: 187, h: 8 }, shoshin: { x: 90, y: 60, w: 187, h: 8 },
  rows: Array.from({ length: 5 }, (_, i) => ({ meta: { x: 29, y: 128 + i * 55.4, w: 73, h: 52 }, text: { x: 105, y: 128 + i * 55.4, w: 170, h: 52 } })),
} as const;
export const MAIN_BACK = { byoumei: { x: 92, y: 22, w: 136, h: 8 }, sonota: { x: 28, y: 347, w: 246, h: 32 }, name: { x: 194, y: 393, w: 81, h: 9 } } as const;
export const CONTINUATION = { number: { x: 183, y: 10, w: 16, h: 8 }, rows: Array.from({ length: 5 }, (_, i) => ({ meta: { x: 13, y: 35 + i * 49, w: 54, h: 45 }, text: { x: 69, y: 35 + i * 49, w: 126, h: 45 } })) } as const;
