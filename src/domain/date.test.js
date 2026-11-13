import { describe, expect, it } from 'vitest';
import { dateKey, formatDateLabel } from './date';
describe('formatDateLabel', () => {
    it('날짜와 한글 요일을 보여준다', () => {
        expect(formatDateLabel('2026-11-12')).toBe('2026.11.12 (목)');
    });
});
describe('dateKey (America/Toronto)', () => {
    it('토론토 자정 직전은 전날로 본다', () => {
        // 2026-11-12 04:59:59Z = 토론토 2026-11-11 23:59:59 (EST, UTC-5)
        expect(dateKey(new Date('2026-11-12T04:59:59Z'))).toBe('2026-11-11');
    });
    it('토론토 자정이 지나면 다음 날로 본다', () => {
        expect(dateKey(new Date('2026-11-12T05:00:00Z'))).toBe('2026-11-12');
    });
    it('서머타임(EDT, UTC-4)도 반영한다', () => {
        expect(dateKey(new Date('2026-07-15T03:59:59Z'))).toBe('2026-07-14');
        expect(dateKey(new Date('2026-07-15T04:00:00Z'))).toBe('2026-07-15');
    });
});
