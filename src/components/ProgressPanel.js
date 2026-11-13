import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './ProgressPanel.module.css';
export default function ProgressPanel({ done, total }) {
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    const complete = total > 0 && done === total;
    return (_jsxs("section", { className: styles.panel, "aria-label": "\uC624\uB298 \uC9C4\uD589\uB960", children: [_jsx("div", { className: styles.ring, style: { '--p': pct }, children: _jsxs("span", { children: [pct, "%"] }) }), _jsx("p", { className: styles.msg, "aria-live": "polite", children: total === 0 ? (_jsx(_Fragment, { children: "\uD560 \uC77C \uBAA9\uB85D\uC744 \uB9CC\uB4E4\uBA74 \uC5EC\uAE30\uC5D0 \uC9C4\uD589\uB960\uC774 \uB098\uC640\uC694." })) : complete ? (_jsxs(_Fragment, { children: [_jsx("b", { children: "\uBAA8\uB4E0 \uBBF8\uC158 \uC644\uB8CC!" }), " \uC624\uB298 \uC815\uB9D0 \uC218\uACE0\uD588\uC5B4\uC694 \uD83C\uDF89"] })) : (_jsxs(_Fragment, { children: ["\uC624\uB298 \uBBF8\uC158 ", _jsxs("b", { children: [done, "/", total] }), " \uC644\uB8CC.", _jsx("br", {}), "\uB0A8\uC740 ", total - done, "\uAC1C, \uCC9C\uCC9C\uD788 \uD574\uC694."] })) })] }));
}
