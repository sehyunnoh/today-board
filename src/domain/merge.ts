import { buildDayLog } from './log';
import type { BoardList, DayLog } from './types';

/** 목록: 더 나중에 수정한 쪽을 통째로 따른다. (같으면 로컬 유지) */
export function mergeList(local: BoardList, remote: BoardList): BoardList {
  return Date.parse(remote.updatedAt) > Date.parse(local.updatedAt) ? remote : local;
}

/**
 * 하루 기록 병합. 항목마다 마지막 변경 시각(marks)이 더 나중인 쪽의 상태(체크/해제)를 따른다.
 * 시각이 같거나 없으면(옛 기록) 체크된 쪽이 이긴다.
 */
export function mergeDayLog(list: BoardList, local: DayLog | undefined, remote: DayLog | undefined): DayLog | undefined {
  if (!local) return remote;
  if (!remote) return local;

  const ids = new Set([
    ...local.checked,
    ...remote.checked,
    ...Object.keys(local.marks ?? {}),
    ...Object.keys(remote.marks ?? {}),
  ]);
  const checked: string[] = [];
  const marks: Record<string, number> = {};
  for (const id of [...ids].sort()) {
    const lt = local.marks?.[id] ?? 0;
    const rt = remote.marks?.[id] ?? 0;
    const lon = local.checked.includes(id);
    const ron = remote.checked.includes(id);
    const on = lt > rt ? lon : rt > lt ? ron : lon || ron;
    if (on) checked.push(id);
    const t = Math.max(lt, rt);
    if (t > 0) marks[id] = t;
  }

  // 체크 결과가 한쪽과 같으면 그쪽의 통계 스냅샷을 그대로 쓴다. (지난 날의 통계가 현재 목록 때문에 바뀌지 않게)
  const same = (log: DayLog) => log.checked.length === checked.length && checked.every((id) => log.checked.includes(id));
  const snap = same(local) ? local : same(remote) ? remote : buildDayLog(list, checked);
  return {
    checked,
    doneCategories: snap.doneCategories,
    total: snap.total,
    ...(Object.keys(marks).length > 0 ? { marks } : {}),
  };
}

/** 날짜별 기록 전체를 병합한다. 결과의 날짜 키는 정렬된다. */
export function mergeLogs(
  list: BoardList,
  local: Record<string, DayLog>,
  remote: Record<string, DayLog>,
): Record<string, DayLog> {
  const out: Record<string, DayLog> = {};
  for (const date of [...new Set([...Object.keys(local), ...Object.keys(remote)])].sort()) {
    const merged = mergeDayLog(list, local[date], remote[date]);
    if (merged) out[date] = merged;
  }
  return out;
}

/** 객체 키 순서와 무관하게 비교하기 위한 직렬화. (불필요한 저장을 막는 용도) */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return `{${Object.keys(obj)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}
