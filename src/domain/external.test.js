import { describe, expect, it } from 'vitest';
import { formatAgo, isFresh } from './cache';
import { cadToKrw, krwToCad, parseAmount, parseFx } from './fx';
import { parseWeather, weatherInfo } from './weather';
import { weekdayKo } from './date';
// 실제 Open-Meteo 응답(2026-11-12 오크빌)을 줄인 샘플
const WEATHER_JSON = {
    current: { temperature_2m: 5.1, apparent_temperature: 0.5, relative_humidity_2m: 85, weather_code: 3, is_day: 1 },
    daily: {
        time: ['2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'],
        weather_code: [3, 61, 2, 0],
        temperature_2m_max: [6.2, 7.0, 9.5, 11.1],
        temperature_2m_min: [1.0, 2.2, 3.0, 4.4],
    },
};
describe('날씨', () => {
    it('Open-Meteo 응답을 파싱한다', () => {
        const w = parseWeather(WEATHER_JSON);
        expect(w).toMatchObject({ temp: 5.1, feelsLike: 0.5, humidity: 85, code: 3, isDay: true });
        expect(w.daily).toHaveLength(4);
        expect(w.daily[1]).toEqual({ date: '2026-11-13', code: 61, max: 7.0, min: 2.2 });
    });
    it('형식이 다르면 예외를 던진다', () => {
        expect(() => parseWeather({})).toThrow();
        expect(() => parseWeather(null)).toThrow();
    });
    it('날씨 코드를 아이콘/설명으로 바꾼다', () => {
        expect(weatherInfo(3)).toEqual({ icon: '☁️', label: '흐림' });
        expect(weatherInfo(0, false).icon).toBe('🌙');
        expect(weatherInfo(63).label).toBe('비');
        expect(weatherInfo(73).label).toBe('눈');
        expect(weatherInfo(95).label).toBe('뇌우');
        expect(weatherInfo(999).label).toBe('날씨');
    });
    it('요일 표시', () => {
        expect(weekdayKo('2026-11-13')).toBe('금');
    });
});
describe('환율', () => {
    it('Frankfurter 응답을 파싱한다', () => {
        expect(parseFx({ amount: 1, base: 'CAD', date: '2026-11-11', rates: { KRW: 939.18 } })).toEqual({
            cadToKrw: 939.18,
            date: '2026-11-11',
        });
    });
    it('형식이 다르거나 값이 이상하면 예외', () => {
        expect(() => parseFx({ rates: {} })).toThrow();
        expect(() => parseFx({ date: '2026-11-11', rates: { KRW: 0 } })).toThrow();
    });
    it('양방향 변환', () => {
        expect(cadToKrw(100, 939.18)).toBeCloseTo(93918);
        expect(krwToCad(93918, 939.18)).toBeCloseTo(100);
    });
    it('금액 입력 파싱', () => {
        expect(parseAmount('1,000')).toBe(1000);
        expect(parseAmount(' 12.5 ')).toBe(12.5);
        expect(parseAmount('')).toBeNull();
        expect(parseAmount('abc')).toBeNull();
        expect(parseAmount('-5')).toBeNull();
    });
});
describe('캐시 유틸', () => {
    it('isFresh', () => {
        expect(isFresh(1000, 500, 1400)).toBe(true);
        expect(isFresh(1000, 500, 1500)).toBe(false);
    });
    it('formatAgo', () => {
        const now = 10_000_000;
        expect(formatAgo(now - 20_000, now)).toBe('방금 전');
        expect(formatAgo(now - 5 * 60_000, now)).toBe('5분 전');
        expect(formatAgo(now - 3 * 3_600_000, now)).toBe('3시간 전');
        expect(formatAgo(now - 49 * 3_600_000, now)).toBe('2일 전');
    });
});
