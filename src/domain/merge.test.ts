import { describe, expect, it } from 'vitest';
import { TEST_LIST } from '../test/fixture';
import { mergeDayLog, mergeList, mergeLogs, stableStringify } from './merge';
import { buildDayLog, toggleWithMark } from './log';
import type { DayLog } from './types';

const day = (checked: string[], marks: Record<string, number> = {}): DayLog => buildDayLog(TEST_LIST, checked, marks);

describe('목록 병합', () => {
  it('더 나중에 수정한 쪽을 따른다', () => {
    const older = { ...TEST_LIST, updatedAt: '2026-11-12T10:00:00Z' };
    const newer = { ...TEST_LIST, updatedAt: '2026-11-12T11:00:00Z', categories: [] };
    expect(mergeList(older, newer)).toBe(newer);
    expect(mergeList(newer, older)).toBe(newer);
    expect(mergeList(older, { ...older })).toBe(older); // 같으면 로컬
  });
  it('시간대 표기가 달라도 실제 시각으로 비교한다', () => {
    const a = { ...TEST_LIST, updatedAt: '2026-11-12T00:00:00-05:00' }; // = 05:00Z
    const b = { ...TEST_LIST, updatedAt: '2026-11-12T04:00:00Z' };
    expect(mergeList(a, b)).toBe(a);
  });
});

describe('하루 기록 병합', () => {
  it('서로 다른 항목을 체크했으면 둘 다 남는다', () => {
    const m = mergeDayLog(TEST_LIST, day(['i_a4'], { i_a4: 100 }), day(['i_d1'], { i_d1: 200 }))!;
    expect(m.checked).toEqual(['i_a4', 'i_d1']);
    expect(m.doneCategories).toEqual(['c_a', 'c_d']);
  });
  it('더 나중에 한 해제가 전달된다', () => {
    const local = day([], { i_a4: 300 }); // 로컬에서 나중에 해제
    const remote = day(['i_a4'], { i_a4: 100 });
    expect(mergeDayLog(TEST_LIST, local, remote)!.checked).toEqual([]);
    expect(mergeDayLog(TEST_LIST, remote, local)!.checked).toEqual([]); // 순서를 바꿔도 같다
  });
  it('더 나중에 한 체크가 이전 해제를 이긴다', () => {
    const local = day(['i_a4'], { i_a4: 500 });
    const remote = day([], { i_a4: 400 });
    expect(mergeDayLog(TEST_LIST, local, remote)!.checked).toEqual(['i_a4']);
  });
  it('시각 정보가 없는 옛 기록은 체크된 쪽이 이긴다', () => {
    const m = mergeDayLog(TEST_LIST, day(['i_a4']), day([]))!;
    expect(m.checked).toEqual(['i_a4']);
  });
  it('교환법칙/멱등: 어느 쪽에서 합쳐도, 여러 번 합쳐도 같은 결과', () => {
    const a = day(['i_a4', 'i_d1'], { i_a4: 10, i_d1: 50 });
    const b = day(['i_a4'], { i_a4: 10, i_d1: 60 });
    const ab = mergeDayLog(TEST_LIST, a, b)!;
    const ba = mergeDayLog(TEST_LIST, b, a)!;
    expect(stableStringify(ab)).toBe(stableStringify(ba));
    expect(stableStringify(mergeDayLog(TEST_LIST, ab, b))).toBe(stableStringify(ab));
  });
  it('한쪽에만 있는 날짜는 그대로 남는다', () => {
    const local = { '2026-11-11': day(['i_a4']) };
    const remote = { '2026-11-12': day(['i_d1']) };
    const m = mergeLogs(TEST_LIST, local, remote);
    expect(Object.keys(m)).toEqual(['2026-11-11', '2026-11-12']);
  });
  it('체크 결과가 한쪽과 같으면 그쪽의 통계 스냅샷을 유지한다 (지난 통계 보존)', () => {
    const past: DayLog = { checked: ['i_a4'], doneCategories: ['c_a'], total: 12, marks: { i_a4: 1 } };
    const m = mergeDayLog(TEST_LIST, past, { checked: ['i_a4'], doneCategories: ['c_a'], total: 9, marks: { i_a4: 1 } })!;
    expect(m.total).toBe(12);
  });
});

describe('toggleWithMark', () => {
  it('토글하고 변경 시각을 남긴다', () => {
    const a = toggleWithMark(undefined, 'x', 1000);
    expect(a).toEqual({ checked: ['x'], marks: { x: 1000 } });
    const b = toggleWithMark(buildDayLog(TEST_LIST, a.checked, a.marks), 'x', 2000);
    expect(b).toEqual({ checked: [], marks: { x: 2000 } });
  });
});
