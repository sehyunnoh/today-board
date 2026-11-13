import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatAgo } from '../domain/cache';
import { useNow } from '../hooks/useNow';
import styles from './InfoCard.module.css';
/** 카드 맨 아래에 갱신 시각과 오류 상태를 보여준다. */
export default function StatusLine({ status, fetchedAt, onRetry }) {
    const now = useNow();
    if (status === 'loading')
        return _jsx("p", { className: styles.status, children: "\uBD88\uB7EC\uC624\uB294 \uC911\u2026" });
    const ago = fetchedAt ? formatAgo(fetchedAt, now) : '';
    if (status === 'stale') {
        return (_jsxs("p", { className: `${styles.status} ${styles.warn}`, children: ["\u26A0 \uC0C8\uB85C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD574 \uC774\uC804 \uAC12\uC774\uC5D0\uC694 \u00B7 ", ago, _jsx("button", { type: "button", className: styles.retry, onClick: onRetry, children: "\uB2E4\uC2DC \uC2DC\uB3C4" })] }));
    }
    return _jsxs("p", { className: styles.status, children: [ago, " \uAC31\uC2E0"] });
}
