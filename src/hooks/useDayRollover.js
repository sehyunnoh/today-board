import { useEffect } from 'react';
import { useBoardStore } from '../store/useBoardStore';
/** 앱이 열려 있는 동안 자정(오크빌 시간)을 넘기면 새 날로 전환한다. */
export function useDayRollover() {
    const syncToday = useBoardStore((s) => s.syncToday);
    useEffect(() => {
        syncToday();
        const id = window.setInterval(syncToday, 30_000);
        document.addEventListener('visibilitychange', syncToday);
        window.addEventListener('focus', syncToday);
        return () => {
            window.clearInterval(id);
            document.removeEventListener('visibilitychange', syncToday);
            window.removeEventListener('focus', syncToday);
        };
    }, [syncToday]);
}
