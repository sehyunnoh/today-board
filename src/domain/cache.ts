export interface CacheEntry<T> {
  data: T;
  fetchedAt: number; // epoch ms
}

export const isFresh = (fetchedAt: number, ttlMs: number, now: number = Date.now()): boolean =>
  now - fetchedAt < ttlMs;

/** 'n분 전' 같은 상대 시간 문구 */
export function formatAgo(fetchedAt: number, now: number = Date.now()): string {
  const min = Math.floor(Math.max(0, now - fetchedAt) / 60_000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  return `${Math.floor(hour / 24)}일 전`;
}

export function readCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    return typeof entry?.fetchedAt === 'number' && 'data' in entry ? entry : null;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, entry: CacheEntry<T>): void {
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    /* 저장 공간이 없거나 막혀 있어도 앱은 계속 동작한다 */
  }
}
