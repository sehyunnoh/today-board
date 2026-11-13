import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatAgo } from '../domain/cache';
import { useNow } from '../hooks/useNow';
import { useSyncStore } from '../store/useSyncStore';
import styles from './SyncBadge.module.css';
const DOT = {
    off: styles.gray,
    synced: styles.green,
    pending: styles.orange,
    syncing: styles.orange,
    offline: styles.gray,
    error: styles.red,
};
/** 동기화 상태를 작은 점과 문구로 보여준다. 누르면 설정 창이 열린다. */
export default function SyncBadge({ onClick }) {
    const status = useSyncStore((s) => s.status);
    const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt);
    const now = useNow();
    const label = status === 'off'
        ? 'GitHub 동기화 연결하기'
        : status === 'synced'
            ? `동기화됨${lastSyncedAt ? ` · ${formatAgo(lastSyncedAt, now)}` : ''}`
            : status === 'pending'
                ? '저장 대기 중'
                : status === 'syncing'
                    ? '저장 중…'
                    : status === 'offline'
                        ? '오프라인 · 연결되면 저장해요'
                        : '동기화 오류 · 눌러서 확인';
    return (_jsxs("button", { type: "button", className: styles.badge, onClick: onClick, "aria-label": `동기화 상태: ${label}. 설정 열기`, children: [_jsx("i", { className: `${styles.dot} ${DOT[status]}`, "aria-hidden": "true" }), label] }));
}
