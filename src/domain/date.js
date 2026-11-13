/** 앱의 기준 타임존. 하루는 이 타임존의 자정에 바뀐다. */
export const APP_TIMEZONE = 'America/Toronto';
/** 주어진 시각의 기준 타임존 날짜를 'YYYY-MM-DD'로 돌려준다. */
export function dateKey(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: APP_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(now);
    const get = (type) => parts.find((p) => p.type === type).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
}
/** 'YYYY-MM-DD'에 n일을 더한 날짜. (음수면 과거) */
export function addDays(key, n) {
    const d = new Date(`${key}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}
/** 요일 번호. 일요일=0 ... 토요일=6 */
export function weekdayIndex(key) {
    return new Date(`${key}T12:00:00Z`).getUTCDay();
}
/** 'YYYY-MM-DD' → '11/12' */
export function shortLabel(key) {
    return `${Number(key.slice(5, 7))}/${Number(key.slice(8, 10))}`;
}
/** from부터 to까지(양쪽 포함) 날짜 목록. from이 to보다 뒤면 빈 배열. */
export function dateRange(from, to) {
    const out = [];
    for (let d = from; d <= to; d = addDays(d, 1))
        out.push(d);
    return out;
}
/** 'YYYY-MM-DD' → '목' */
export function weekdayKo(key) {
    return new Intl.DateTimeFormat('ko-KR', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${key}T12:00:00Z`));
}
/** 'YYYY-MM-DD' → '2026.11.12 (목)' */
export function formatDateLabel(key) {
    const d = new Date(`${key}T12:00:00Z`);
    const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'short', timeZone: 'UTC' }).format(d);
    return `${key.replaceAll('-', '.')} (${weekday})`;
}
