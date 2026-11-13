import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { cadToKrw, krwToCad, parseAmount } from '../domain/fx';
import StatusLine from './StatusLine';
import styles from './InfoCard.module.css';
const nf = (max) => new Intl.NumberFormat('ko-KR', { maximumFractionDigits: max });
export default function FxCard({ resource }) {
    const { data, status, fetchedAt, refresh } = resource;
    const [open, setOpen] = useState(false);
    const [fromCad, setFromCad] = useState(true); // true: CAD → 원, false: 원 → CAD
    const [text, setText] = useState('100');
    if (!data) {
        return (_jsxs("section", { className: `${styles.card} ${styles.fx}`, children: [_jsx("small", { className: styles.label, children: "\uD83D\uDCB1 \uD658\uC728" }), status === 'loading' ? (_jsx("p", { className: styles.status, children: "\uD658\uC728\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\u2026" })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: styles.sub, children: "\uD658\uC728\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694." }), _jsx("button", { type: "button", className: styles.retry, onClick: () => void refresh(), children: "\uB2E4\uC2DC \uC2DC\uB3C4" })] }))] }));
    }
    const amount = parseAmount(text);
    const result = amount === null ? null : fromCad ? `${nf(0).format(cadToKrw(amount, data.cadToKrw))} 원` : `${nf(2).format(krwToCad(amount, data.cadToKrw))} CAD`;
    return (_jsxs("section", { className: `${styles.card} ${styles.fx} ${open ? styles.open : ''}`, "aria-label": "\uD658\uC728", children: [_jsx("small", { className: styles.label, children: "\uD83D\uDCB1 1 CAD" }), _jsxs("b", { className: styles.big, children: [nf(2).format(data.cadToKrw), "\uC6D0"] }), _jsxs("em", { className: styles.sub, children: ["100\uC6D0 = ", nf(3).format(krwToCad(100, data.cadToKrw)), " CAD"] }), _jsxs("div", { className: styles.details, children: [_jsxs("div", { className: styles.conv, children: [_jsx("input", { inputMode: "decimal", value: text, onChange: (e) => setText(e.target.value), "aria-label": fromCad ? '변환할 CAD 금액' : '변환할 원화 금액', "aria-invalid": amount === null }), _jsx("span", { children: fromCad ? 'CAD' : '원' }), _jsx("button", { type: "button", className: styles.swap, onClick: () => setFromCad((v) => !v), "aria-label": "\uBCC0\uD658 \uBC29\uD5A5 \uBC14\uAFB8\uAE30", children: "\u21C4" })] }), _jsxs("p", { className: styles.result, "aria-live": "polite", children: ["= ", result ?? '숫자를 입력해 주세요'] }), _jsxs("p", { className: styles.sub, children: ["\uAE30\uC900\uC77C ", data.date, " \u00B7 \uCC38\uACE0\uC6A9 \uD658\uC728\uC774\uB77C \uC2E4\uC81C \uC740\uD589 \uD658\uC728\uACFC \uB2EC\uB77C\uC694"] })] }), _jsx("button", { type: "button", className: styles.more, "aria-expanded": open, onClick: () => setOpen((o) => !o), children: open ? '접기 ▴' : '계산기 ▾' }), _jsx(StatusLine, { status: status, fetchedAt: fetchedAt, onRetry: () => void refresh() })] }));
}
