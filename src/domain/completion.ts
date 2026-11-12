import type { BoardList, Category, Item } from './types';

export const activeCategories = (list: BoardList): Category[] => list.categories.filter((c) => !c.archived);
export const activeItems = (items: Item[]): Item[] => items.filter((i) => !i.archived);

/**
 * 항목이 체크된 상태인지 계산한다.
 * - 하위 항목이 없으면 자기 id가 체크되어 있어야 한다.
 * - 하위 항목이 있으면 하위 항목(모든 깊이) 중 하나라도 체크되면 체크된 것으로 본다.
 */
export function isItemChecked(item: Item, checked: ReadonlySet<string>): boolean {
  const kids = activeItems(item.children);
  if (kids.length === 0) return checked.has(item.id);
  return kids.some((k) => isItemChecked(k, checked));
}

/** 카테고리 안의 항목 중 하나라도 체크되면 그 카테고리는 "오늘 미션 완료". */
export function isCategoryDone(category: Category, checked: ReadonlySet<string>): boolean {
  return activeItems(category.items).some((i) => isItemChecked(i, checked));
}

/** 완료한 카테고리 수 / 전체 카테고리 수 */
export function progress(list: BoardList, checked: ReadonlySet<string>): { done: number; total: number } {
  const cats = activeCategories(list);
  return { done: cats.filter((c) => isCategoryDone(c, checked)).length, total: cats.length };
}
