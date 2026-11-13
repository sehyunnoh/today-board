import { describe, expect, it } from 'vitest';
import { TEST_LIST } from '../test/fixture';
import { isCategoryDone, isItemChecked, progress } from './completion';
import { applyToggle, buildDayLog } from './log';
const set = (...ids) => new Set(ids);
const exercise = TEST_LIST.categories.find((c) => c.id === 'c_a');
const goal = TEST_LIST.categories.find((c) => c.id === 'c_i');
describe('카테고리 완료 규칙 (하나라도 체크하면 완료)', () => {
    it('아무것도 체크하지 않으면 미완료', () => {
        expect(isCategoryDone(exercise, set())).toBe(false);
    });
    it('항목 하나만 체크해도 완료', () => {
        expect(isCategoryDone(exercise, set('i_a4'))).toBe(true);
    });
    it('다른 카테고리의 체크는 영향을 주지 않는다', () => {
        expect(isCategoryDone(exercise, set('i_d1'))).toBe(false);
    });
    it('중첩된 하위 항목 하나만 체크해도 상위 항목과 카테고리가 완료', () => {
        const parent = goal.items[0];
        expect(isItemChecked(parent, set())).toBe(false);
        expect(isItemChecked(parent, set('i_i1a'))).toBe(true);
        expect(isCategoryDone(goal, set('i_i1b'))).toBe(true);
    });
    it('보관(삭제)된 항목의 체크는 무시한다', () => {
        const list = {
            ...TEST_LIST,
            categories: [
                {
                    id: 'c1',
                    name: 'x',
                    emoji: 'x',
                    items: [
                        { id: 'a', name: 'a', archived: true, children: [] },
                        { id: 'b', name: 'b', children: [] },
                    ],
                },
            ],
        };
        expect(progress(list, set('a'))).toEqual({ done: 0, total: 1 });
        expect(progress(list, set('b'))).toEqual({ done: 1, total: 1 });
    });
    it('진행률은 완료한 카테고리 수 / 전체 카테고리 수', () => {
        expect(progress(TEST_LIST, set())).toEqual({ done: 0, total: 9 });
        expect(progress(TEST_LIST, set('i_a4', 'i_a2', 'i_d1'))).toEqual({ done: 2, total: 9 });
    });
});
describe('하루 기록', () => {
    it('applyToggle은 체크/해제를 번갈아 한다', () => {
        expect(applyToggle([], 'a')).toEqual(['a']);
        expect(applyToggle(['a', 'b'], 'a')).toEqual(['b']);
    });
    it('buildDayLog는 완료 카테고리와 전체 수를 스냅샷으로 남긴다', () => {
        const log = buildDayLog(TEST_LIST, ['i_a4', 'i_i1a']);
        expect(log.doneCategories).toEqual(['c_a', 'c_i']);
        expect(log.total).toBe(9);
    });
});
