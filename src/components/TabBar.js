import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './TabBar.module.css';
/** 화면 아래에 떠 있는 탭. 설정은 화면 이동 없이 설정 창을 연다. */
export default function TabBar({ tab, onTab, onSettings }) {
    return (_jsxs("nav", { className: styles.bar, "aria-label": "\uC8FC \uBA54\uB274", children: [_jsx("button", { type: "button", className: tab === 'today' ? styles.on : '', "aria-current": tab === 'today' ? 'page' : undefined, onClick: () => onTab('today'), children: "\uC624\uB298" }), _jsx("button", { type: "button", className: tab === 'history' ? styles.on : '', "aria-current": tab === 'history' ? 'page' : undefined, onClick: () => onTab('history'), children: "\uAE30\uB85D" }), _jsx("button", { type: "button", "aria-haspopup": "dialog", onClick: onSettings, children: "\uC124\uC815" })] }));
}
