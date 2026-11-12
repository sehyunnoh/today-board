/** 새 카테고리/항목 id를 만든다. 한번 만든 id는 바꾸지 않는다. (기록과 연결되는 키) */
export function newId(prefix: 'c' | 'i'): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
