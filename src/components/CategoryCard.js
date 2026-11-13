import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { isCategoryDone } from '../domain/completion';
import DragHandle from './DragHandle';
import { EditContext } from './EditContext';
import EditTools from './EditTools';
import ItemTree from './ItemTree';
import styles from './CategoryCard.module.css';
export default function CategoryCard({ category, checked, onToggle, defaultOpen = false }) {
    const edit = useContext(EditContext);
    const [open, setOpen] = useState(defaultOpen);
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id: category.id,
        disabled: !edit.editing,
    });
    const done = isCategoryDone(category, checked);
    const showBody = open || edit.editing; // 편집 중에는 항목을 모두 보여준다
    return (_jsxs("section", { ref: setNodeRef, className: `${styles.card} ${done ? styles.done : ''}`, style: { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }, children: [_jsxs("div", { className: styles.headRow, children: [edit.editing && _jsx(DragHandle, { ref: setActivatorNodeRef, ...attributes, ...listeners }), _jsxs("button", { className: styles.head, "aria-expanded": showBody, onClick: () => !edit.editing && setOpen((o) => !o), disabled: edit.editing, children: [_jsx("span", { className: styles.emoji, "aria-hidden": "true", children: done ? '✓' : category.emoji }), _jsx("span", { className: styles.name, children: category.name }), !edit.editing && (_jsxs(_Fragment, { children: [_jsx("span", { className: styles.badge, children: done ? '✓ 완료' : '' }), _jsx("span", { className: `${styles.chev} ${open ? styles.open : ''}`, "aria-hidden": "true", children: "\u203A" })] }))] }), edit.editing && (_jsx(EditTools, { name: category.name, onEdit: () => edit.editCategory(category), onDelete: () => edit.deleteCategory(category) }))] }), showBody && (_jsxs("div", { className: styles.body, children: [_jsx(ItemTree, { categoryId: category.id, items: category.items, checked: checked, onToggle: onToggle }), edit.editing && (_jsx("button", { type: "button", className: styles.addRow, onClick: () => edit.addItem(category.id, null), children: "\uFF0B \uD56D\uBAA9 \uCD94\uAC00" }))] }))] }));
}
