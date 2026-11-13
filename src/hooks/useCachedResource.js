import { useCallback, useEffect, useRef, useState } from 'react';
import { isFresh, readCache, writeCache } from '../domain/cache';
/**
 * 외부 API 값을 localStorage에 캐시해서 쓰는 훅.
 * - 캐시가 신선하면(ttl 이내) 요청하지 않는다.
 * - 요청이 실패하면 마지막 값을 그대로 보여주고 status를 'stale'로 바꾼다. (값이 아예 없으면 'error')
 * fetcher는 매번 새로 만들어지지 않는 함수(모듈 수준 함수)를 넘긴다.
 */
export function useCachedResource(key, fetcher, ttlMs) {
    const [state, setState] = useState(() => {
        const cached = readCache(key);
        return cached
            ? { data: cached.data, fetchedAt: cached.fetchedAt, status: 'ok' }
            : { data: null, fetchedAt: null, status: 'loading' };
    });
    const inflight = useRef(false);
    const load = useCallback(async (force = false) => {
        const cached = readCache(key);
        if (!force && cached && isFresh(cached.fetchedAt, ttlMs))
            return;
        if (inflight.current)
            return;
        inflight.current = true;
        try {
            const data = await fetcher();
            const entry = { data, fetchedAt: Date.now() };
            writeCache(key, entry);
            setState({ data, fetchedAt: entry.fetchedAt, status: 'ok' });
        }
        catch {
            setState((s) => ({ ...s, status: s.data ? 'stale' : 'error' }));
        }
        finally {
            inflight.current = false;
        }
    }, [key, fetcher, ttlMs]);
    useEffect(() => {
        void load();
        const id = window.setInterval(() => void load(), 60_000); // 1분마다 캐시 만료 여부만 확인한다
        const onVisible = () => document.visibilityState === 'visible' && void load();
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            window.clearInterval(id);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [load]);
    const refresh = useCallback(() => {
        setState((s) => (s.data ? s : { ...s, status: 'loading' }));
        return load(true);
    }, [load]);
    return { ...state, refresh };
}
