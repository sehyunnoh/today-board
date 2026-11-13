import { describe, expect, it } from 'vitest';
import { TEST_LIST } from '../test/fixture';
import { addDays, dateRange, shortLabel, weekdayIndex } from './date';
import { averageRate, categoryRates, dayStat, firstDate, heatLevel, heatmap, monthsBack, recentDays, streaks } from './stats';
const TODAY = '2026-11-12'; // 목요일
/** n개 카테고리를 완료한 날의 기록 (총 9개 기준) */
const log = (doneCount, ids = []) => ({
    checked: [],
    doneCategories: ids.length ? ids : Array.from({ length: doneCount }, (_, i) => `c${i}`),
    total: 9,
});
describe('날짜 도우미', () => {
    it('addDays는 월/연 경계를 넘는다', () => {
        expect(addDays('2026-11-12', 1)).toBe('2026-11-13');
        expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
        expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    });
    it('요일과 짧은 표기', () => {
        expect(weekdayIndex('2026-11-12')).toBe(4); // 목
        expect(weekdayIndex('2026-11-08')).toBe(0); // 일
        expect(shortLabel('2026-11-02')).toBe('11/2');
    });
    it('dateRange는 양쪽을 포함한다', () => {
        expect(dateRange('2026-11-10', '2026-11-12')).toEqual(['2026-11-10', '2026-11-11', '2026-11-12']);
        expect(dateRange('2026-11-12', '2026-11-10')).toEqual([]);
    });
});
describe('하루 통계', () => {
    it('기록 시작 전은 null, 시작 후 기록 없는 날은 0', () => {
        const logs = { '2026-11-10': log(5) };
        const first = firstDate(logs, TODAY);
        expect(first).toBe('2026-11-10');
        expect(dayStat('2026-11-09', logs, first).rate).toBeNull();
        expect(dayStat('2026-11-11', logs, first)).toMatchObject({ rate: 0, done: 0 });
        expect(dayStat('2026-11-10', logs, first)).toMatchObject({ rate: 5 / 9, done: 5, total: 9 });
    });
    it('최근 n일은 오늘로 끝나고 길이가 n이다', () => {
        const days = recentDays({ '2026-11-10': log(3) }, TODAY, 14);
        expect(days).toHaveLength(14);
        expect(days.at(-1).date).toBe(TODAY);
        expect(days[0].rate).toBeNull();
    });
    it('평균은 오늘(진행 중)과 기록 이전 날을 뺀다', () => {
        const logs = { '2026-11-10': log(9), '2026-11-11': log(0), '2026-11-12': log(1) };
        const days = recentDays(logs, TODAY, 14);
        expect(averageRate(days, TODAY)).toBeCloseTo(0.5); // (1 + 0) / 2
        expect(averageRate(recentDays({}, TODAY, 14), TODAY)).toBeNull();
    });
});
describe('연속 달성일 (완료율 50% 이상)', () => {
    it('이어진 달성일을 센다', () => {
        const logs = { '2026-11-10': log(5), '2026-11-11': log(6), '2026-11-12': log(9) };
        expect(streaks(logs, TODAY)).toEqual({ current: 3, best: 3 });
    });
    it('오늘이 아직 미달이어도 어제까지의 연속은 유지된다', () => {
        const logs = { '2026-11-10': log(5), '2026-11-11': log(6), '2026-11-12': log(1) };
        expect(streaks(logs, TODAY)).toEqual({ current: 2, best: 2 });
    });
    it('어제가 미달이면 끊긴다', () => {
        const logs = { '2026-11-09': log(9), '2026-11-10': log(9), '2026-11-11': log(2), '2026-11-12': log(5) };
        expect(streaks(logs, TODAY)).toEqual({ current: 1, best: 2 });
    });
    it('기록이 없으면 0', () => {
        expect(streaks({}, TODAY)).toEqual({ current: 0, best: 0 });
    });
    it('기록 없는 날은 연속을 끊는다', () => {
        const logs = { '2026-11-08': log(9), '2026-11-09': log(9), '2026-11-12': log(9) };
        expect(streaks(logs, TODAY)).toEqual({ current: 1, best: 2 });
    });
});
describe('히트맵', () => {
    it('색 단계', () => {
        expect(heatLevel(null)).toBe(0);
        expect(heatLevel(0)).toBe(0);
        expect(heatLevel(0.2)).toBe(1);
        expect(heatLevel(0.5)).toBe(2);
        expect(heatLevel(0.9)).toBe(3);
    });
    it('13주 × 7일, 일요일로 시작하고 오늘이 있는 주로 끝난다', () => {
        const cells = heatmap({ '2026-11-12': log(9) }, TODAY, 13);
        expect(cells).toHaveLength(91);
        expect(weekdayIndex(cells[0].date)).toBe(0);
        expect(cells[0].date).toBe('2026-08-16');
        expect(cells.at(-1).date).toBe('2026-11-14'); // 오늘이 속한 주의 토요일
        expect(cells.filter((c) => c.future).map((c) => c.date)).toEqual(['2026-11-13', '2026-11-14']);
        expect(cells.find((c) => c.date === TODAY)).toMatchObject({ level: 3, done: 9, total: 9 });
    });
});
describe('카테고리별', () => {
    it('최근 7일 중 미션을 달성한 날 수를 센다', () => {
        const logs = {
            '2026-11-10': log(0, ['c_a']),
            '2026-11-11': log(0, ['c_a', 'c_d']),
            '2026-11-12': log(0, ['c_a']),
        };
        const rates = categoryRates(TEST_LIST, logs, TODAY, 7);
        const ex = rates.find((r) => r.id === 'c_a');
        expect(ex).toMatchObject({ done: 3, days: 3, rate: 1 }); // 기록을 시작한 11/10부터만 센다
        expect(rates.find((r) => r.id === 'c_d')).toMatchObject({ done: 1, days: 3 });
        expect(rates.find((r) => r.id === 'c_g')).toMatchObject({ done: 0, rate: 0 });
    });
    it('숨긴(삭제한) 카테고리는 빠진다', () => {
        const list = { ...TEST_LIST, categories: TEST_LIST.categories.map((c) => (c.id === 'c_e' ? { ...c, archived: true } : c)) };
        expect(categoryRates(list, {}, TODAY).some((r) => r.id === 'c_e')).toBe(false);
    });
});
describe('불러올 달 범위', () => {
    it('오늘 기준 91일 전까지 걸친 달을 모두 돌려준다', () => {
        expect(monthsBack(TODAY, 91)).toEqual(['2026-08', '2026-09', '2026-10', '2026-11']);
    });
});
