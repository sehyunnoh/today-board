import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useDialogFocus } from '../hooks/useDialogFocus';
import styles from './ConfirmDialog.module.css';
export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
    const dialogRef = useDialogFocus();
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onCancel();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onCancel]);
    return (_jsx("div", { className: styles.scrim, onMouseDown: (e) => e.target === e.currentTarget && onCancel(), children: _jsxs("div", { ref: dialogRef, className: styles.dialog, role: "alertdialog", "aria-modal": "true", "aria-label": title, children: [_jsx("h2", { className: styles.title, children: title }), _jsx("p", { className: styles.msg, children: message }), _jsxs("div", { className: styles.btns, children: [_jsx("button", { type: "button", className: styles.btn, onClick: onCancel, autoFocus: true, children: "\uCDE8\uC18C" }), _jsx("button", { type: "button", className: `${styles.btn} ${styles.del}`, onClick: onConfirm, children: confirmLabel })] })] }) }));
}
