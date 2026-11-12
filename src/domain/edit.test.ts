import { describe, expect, it } from 'vitest';
import { TEST_LIST } from '../test/fixture';
import { activeCategories, activeItems, progress } from './completion';
import {
  addCategory,
  addItem,
  archiveCategory,
  archiveItem,
  arrayMove,
  renameItem,
  reorderCategories,
  reorderItems,
  updateCategory,
} from './edit';

const NOW = new Date('2026-11-12T12:00:00Z');
const cat = (list: typeof TEST_LIST, id: string) => list.categories.find((c) => c.id === id)!;
const names = (items: { name: string }[]) => items.map((i) => i.name);

describe('목록 편집', () => {
  it('arrayMove', () => {
    expect(arrayMove([1, 2, 3, 4], 0, 2)).toEqual([2, 3, 1, 4]);
  });

  it('카테고리 추가와 수정', () => {
    let list = addCategory(TEST_LIST, { id: 'c_new', name: '새 카테고리', emoji: '🍎' }, NOW);
    expect(list.categories).toHaveLength(10);
    expect(list.updatedAt).toBe(NOW.toISOString());
    list = updateCategory(list, 'c_new', { name: '새 카테고리 수정' });
    expect(cat(list, 'c_new').name).toBe('새 카테고리 수정');
    expect(cat(list, 'c_new').emoji).toBe('🍎');
    expect(TEST_LIST.categories).toHaveLength(9); // 원본은 바뀌지 않는다
  });

  it('항목 추가: 카테고리 바로 아래와 하위(중첩)', () => {
    let list = addItem(TEST_LIST, 'c_e', null, { id: 'i_x', name: '새 항목' }, NOW);
    expect(names(cat(list, 'c_e').items)).toContain('새 항목');
    list = addItem(list, 'c_i', 'i_i1', { id: 'i_y', name: '새 하위 항목' });
    expect(names(cat(list, 'c_i').items[0].children)).toEqual(['하위 항목 가', '하위 항목 나', '새 하위 항목']);
  });

  it('항목 이름 수정은 id를 유지한다 (중첩 포함)', () => {
    const list = renameItem(TEST_LIST, 'i_i1a', '이름 변경됨', NOW);
    const child = cat(list, 'c_i').items[0].children[0];
    expect(child).toMatchObject({ id: 'i_i1a', name: '이름 변경됨' });
  });

  it('삭제는 숨김 처리라 데이터가 남고 화면/완료 계산에서만 빠진다', () => {
    const list = archiveItem(TEST_LIST, 'i_a4', NOW);
    expect(cat(list, 'c_a').items.find((i) => i.id === 'i_a4')?.archived).toBe(true);
    expect(activeItems(cat(list, 'c_a').items)).toHaveLength(8);
    expect(progress(list, new Set(['i_a4']))).toEqual({ done: 0, total: 9 });

    const list2 = archiveCategory(TEST_LIST, 'c_d', NOW);
    expect(list2.categories).toHaveLength(9);
    expect(activeCategories(list2)).toHaveLength(8);
    expect(progress(list2, new Set(['i_d1']))).toEqual({ done: 0, total: 8 });
  });

  it('카테고리 순서 변경', () => {
    const list = reorderCategories(TEST_LIST, 'c_i', 'c_a', NOW);
    expect(list.categories[0].id).toBe('c_i');
    expect(list.categories[1].id).toBe('c_a');
    expect(reorderCategories(TEST_LIST, 'c_i', 'c_i')).toBe(TEST_LIST);
  });

  it('항목 순서 변경은 같은 부모 안에서만 (중첩 포함)', () => {
    const list = reorderItems(TEST_LIST, 'i_a9', 'i_a1', NOW);
    expect(cat(list, 'c_a').items[0].id).toBe('i_a9');

    const nested = reorderItems(TEST_LIST, 'i_i1b', 'i_i1a');
    expect(names(cat(nested, 'c_i').items[0].children)).toEqual(['하위 항목 나', '하위 항목 가']);

    // 다른 부모의 항목과는 바뀌지 않는다
    expect(reorderItems(TEST_LIST, 'i_a4', 'i_d1')).toBe(TEST_LIST);
  });
});
