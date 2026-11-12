import { activeCategories, isCategoryDone } from './completion';
import type { BoardList, DayLog } from './types';

/** 체크 목록에서 id를 토글한 새 배열을 돌려준다. */
export function applyToggle(checked: readonly string[], id: string): string[] {
  return checked.includes(id) ? checked.filter((x) => x !== id) : [...checked, id];
}

/** 기록에서 id를 토글하고, 그 항목의 변경 시각(marks)을 갱신한다. */
export function toggleWithMark(
  prev: DayLog | undefined,
  id: string,
  now: number,
): { checked: string[]; marks: Record<string, number> } {
  return {
    checked: applyToggle(prev?.checked ?? [], id),
    marks: { ...(prev?.marks ?? {}), [id]: now },
  };
}

/** 체크 목록으로부터 저장용 하루 기록(통계 스냅샷 포함)을 만든다. */
export function buildDayLog(list: BoardList, checked: string[], marks?: Record<string, number>): DayLog {
  const set = new Set(checked);
  const cats = activeCategories(list);
  return {
    checked,
    doneCategories: cats.filter((c) => isCategoryDone(c, set)).map((c) => c.id),
    total: cats.length,
    ...(marks && Object.keys(marks).length > 0 ? { marks } : {}),
  };
}
