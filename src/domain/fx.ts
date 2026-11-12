export interface FxRate {
  /** 1 CAD = ? KRW */
  cadToKrw: number;
  /** 환율 기준일 (YYYY-MM-DD) */
  date: string;
}

/** Frankfurter 응답을 FxRate로 바꾼다. 형식이 다르면 예외를 던진다. */
export function parseFx(json: unknown): FxRate {
  const j = json as { date?: string; rates?: { KRW?: number } };
  const rate = j?.rates?.KRW;
  if (typeof rate !== 'number' || !(rate > 0) || typeof j.date !== 'string') {
    throw new Error('환율 응답 형식이 올바르지 않아요');
  }
  return { cadToKrw: rate, date: j.date };
}

export const cadToKrw = (cad: number, rate: number): number => cad * rate;
export const krwToCad = (krw: number, rate: number): number => krw / rate;

/** 입력 문자열('1,000', '12.5')을 숫자로 바꾼다. 숫자가 아니면 null. */
export function parseAmount(text: string): number | null {
  const n = Number(text.replaceAll(',', '').trim());
  return text.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : null;
}
