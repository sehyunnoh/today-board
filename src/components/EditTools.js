import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './EditTools.module.css';
export default function EditTools({ name, onEdit, onDelete, onAddChild }) {
    return (_jsxs("div", { className: styles.tools, children: [_jsx("button", { type: "button", className: styles.btn, onClick: onEdit, "aria-label": `${name} 이름 수정`, children: "\u270E" }), onAddChild && (_jsx("button", { type: "button", className: styles.btn, onClick: onAddChild, "aria-label": `${name} 하위 항목 추가`, children: "\uFF0B" })), _jsx("button", { type: "button", className: `${styles.btn} ${styles.del}`, onClick: onDelete, "aria-label": `${name} 삭제`, children: "\uD83D\uDDD1" })] }));
}
