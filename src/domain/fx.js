/** Frankfurter 응답을 FxRate로 바꾼다. 형식이 다르면 예외를 던진다. */
export function parseFx(json) {
    const j = json;
    const rate = j?.rates?.KRW;
    if (typeof rate !== 'number' || !(rate > 0) || typeof j.date !== 'string') {
        throw new Error('환율 응답 형식이 올바르지 않아요');
    }
    return { cadToKrw: rate, date: j.date };
}
export const cadToKrw = (cad, rate) => cad * rate;
export const krwToCad = (krw, rate) => krw / rate;
/** 입력 문자열('1,000', '12.5')을 숫자로 바꾼다. 숫자가 아니면 null. */
export function parseAmount(text) {
    const n = Number(text.replaceAll(',', '').trim());
    return text.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : null;
}
