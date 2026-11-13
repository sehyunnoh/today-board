import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useDialogFocus } from '../hooks/useDialogFocus';
import styles from './EditSheet.module.css';
const EMOJIS = ['💪', '📚', '💻', '✍️', '💰', '🚶', '🎯', '🍎', '🧘', '🎵', '🏠', '🌱'];
export default function EditSheet({ state, onClose, onSubmit }) {
    useEffect(() => {
        if (!state)
            return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [state, onClose]);
    if (!state)
        return null;
    // 열릴 때마다 새 폼 상태로 시작하도록 key를 준다.
    return _jsx(SheetForm, { state: state, onClose: onClose, onSubmit: onSubmit }, JSON.stringify(state));
}
function SheetForm({ state, onClose, onSubmit }) {
    const dialogRef = useDialogFocus();
    const isCategory = state.kind === 'addCategory' || state.kind === 'editCategory';
    const [name, setName] = useState(state.kind === 'editCategory' || state.kind === 'editItem' ? state.name : '');
    const [emoji, setEmoji] = useState(state.kind === 'editCategory' ? state.emoji : '📌');
    const title = state.kind === 'addCategory'
        ? '카테고리 추가'
        : state.kind === 'editCategory'
            ? '카테고리 수정'
            : state.kind === 'addItem'
                ? state.parentName
                    ? `“${state.parentName}” 하위 항목 추가`
                    : '항목 추가'
                : '항목 수정';
    const trimmed = name.trim();
    const submit = (e) => {
        e.preventDefault();
        if (!trimmed)
            return;
        onSubmit({ name: trimmed, emoji: emoji.trim() || '📌' });
    };
    return (_jsx("div", { className: styles.scrim, onMouseDown: (e) => e.target === e.currentTarget && onClose(), children: _jsx("div", { ref: dialogRef, className: styles.sheet, role: "dialog", "aria-modal": "true", "aria-label": title, children: _jsxs("form", { onSubmit: submit, children: [_jsx("h2", { className: styles.title, children: title }), isCategory && (_jsxs(_Fragment, { children: [_jsx("label", { className: styles.label, htmlFor: "sheet-emoji", children: "\uC544\uC774\uCF58" }), _jsxs("div", { className: styles.emojiRow, children: [_jsx("input", { id: "sheet-emoji", className: `${styles.input} ${styles.emojiInput}`, value: emoji, onChange: (e) => setEmoji(e.target.value), maxLength: 4, "aria-label": "\uC544\uC774\uCF58 \uC774\uBAA8\uC9C0" }), _jsx("div", { className: styles.presets, children: EMOJIS.map((em) => (_jsx("button", { type: "button", className: styles.preset, onClick: () => setEmoji(em), "aria-label": `아이콘 ${em}`, children: em }, em))) })] })] })), _jsx("label", { className: styles.label, htmlFor: "sheet-name", children: isCategory ? '카테고리 이름' : '할 일 이름' }), _jsx("input", { id: "sheet-name", className: styles.input, value: name, onChange: (e) => setName(e.target.value), placeholder: isCategory ? '예: 건강' : '예: 스트레칭 10분', maxLength: 80, autoFocus: true }), _jsxs("div", { className: styles.btns, children: [_jsx("button", { type: "button", className: styles.btn, onClick: onClose, children: "\uCDE8\uC18C" }), _jsx("button", { type: "submit", className: `${styles.btn} ${styles.pri}`, disabled: !trimmed, children: "\uC800\uC7A5" })] })] }) }) }));
}
