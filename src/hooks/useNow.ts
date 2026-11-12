import { useEffect, useState } from 'react';

/** 일정 간격으로 현재 시각을 갱신한다. ("n분 전" 표시를 최신으로 유지하기 위함) */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
