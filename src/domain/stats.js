import { activeCategories } from './completion';
import { addDays, dateRange, weekdayIndex } from './date';
/** 하루 완료율이 이 값 이상이면 "달성한 날"로 본다. (연속 달성일 계산 기준) */
export const GOOD_DAY_RATE = 0.5;
/** 첫 기록 날짜. 기록이 없으면 오늘. 이 날짜 이전은 "기록 없음"으로 다룬다. */
export function firstDate(logs, today) {
    const dates = Object.keys(logs);
    return dates.length === 0 ? today : dates.reduce((a, b) => (a < b ? a : b));
}
export function dayStat(date, logs, first) {
    if (date < first)
        return { date, rate: null, done: 0, total: 0 };
    const log = logs[date];
    if (!log || log.total <= 0)
        return { date, rate: 0, done: 0, total: log?.total ?? 0 };
    const done = Math.min(log.doneCategories.length, log.total);
    return { date, rate: done / log.total, done, total: log.total };
}
/** 오늘로 끝나는 최근 n일(오래된 날부터) */
export function recentDays(logs, today, n) {
    const first = firstDate(logs, today);
    return dateRange(addDays(today, -(n - 1)), today).map((d) => dayStat(d, logs, first));
}
/** 오늘을 뺀(아직 진행 중이라) 완료된 날들의 평균 완료율. 대상이 없으면 null. */
export function averageRate(days, today) {
    const rates = days.filter((d) => d.date !== today && d.rate !== null).map((d) => d.rate);
    return rates.length === 0 ? null : rates.reduce((a, b) => a + b, 0) / rates.length;
}
const isGood = (s) => (s.rate ?? 0) >= GOOD_DAY_RATE;
/**
 * 연속 달성일.
 * - current: 오늘(또는 오늘이 아직 기준 미달이면 어제)부터 거꾸로 이어진 달성일 수. 오늘은 진행 중이라 끊기지 않는다.
 * - best: 가진 기록 전체에서 가장 길었던 연속 달성일 수
 */
export function streaks(logs, today) {
    const first = firstDate(logs, today);
    const stats = dateRange(first, today).map((d) => dayStat(d, logs, first));
    let run = 0;
    let best = 0;
    for (const s of stats) {
        run = isGood(s) ? run + 1 : 0;
        best = Math.max(best, run);
    }
    let i = stats.length - 1;
    if (i >= 0 && !isGood(stats[i]))
        i--; // 오늘이 아직 미달이어도 연속은 유지
    let current = 0;
    while (i >= 0 && isGood(stats[i])) {
        current++;
        i--;
    }
    return { current, best };
}
/** 히트맵 색 단계 0~3 (0=기록 없음/0%) */
export function heatLevel(rate) {
    if (rate === null || rate <= 0)
        return 0;
    if (rate < 0.4)
        return 1;
    if (rate < 0.7)
        return 2;
    return 3;
}
/**
 * 최근 weeks주 달력 히트맵. 일요일 시작, 세로 7칸(일~토) × 가로 weeks칸이고
 * 배열은 열 단위(한 주씩)로 채워져 있다. 마지막 열은 오늘이 있는 주.
 */
export function heatmap(logs, today, weeks = 13) {
    const first = firstDate(logs, today);
    const thisSunday = addDays(today, -weekdayIndex(today));
    const start = addDays(thisSunday, -(weeks - 1) * 7);
    return dateRange(start, addDays(thisSunday, 6)).map((date) => {
        const s = dayStat(date, logs, first);
        return { date, level: heatLevel(s.rate), rate: s.rate, done: s.done, total: s.total, future: date > today };
    });
}
/** 최근 n일 동안 카테고리별로 미션을 달성한 날의 비율 */
export function categoryRates(list, logs, today, n = 7) {
    const first = firstDate(logs, today);
    const dates = dateRange(addDays(today, -(n - 1)), today).filter((d) => d >= first);
    return activeCategories(list).map((c) => {
        const done = dates.filter((d) => logs[d]?.doneCategories.includes(c.id)).length;
        return { id: c.id, name: c.name, emoji: c.emoji, done, days: dates.length, rate: dates.length ? done / dates.length : null };
    });
}
/** today 기준 days일 전까지 걸치는 달('YYYY-MM') 목록. 기록을 불러올 범위를 정할 때 쓴다. */
export function monthsBack(today, days) {
    const months = new Set();
    for (const d of dateRange(addDays(today, -days), today))
        months.add(d.slice(0, 7));
    return [...months];
}
