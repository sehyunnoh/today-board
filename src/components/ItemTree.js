import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { activeItems, isItemChecked } from '../domain/completion';
import { useBoardStore } from '../store/useBoardStore';
import DragHandle from './DragHandle';
import { EditContext } from './EditContext';
import EditTools from './EditTools';
import { koDndAccessibility } from './dndAccessibility';
import styles from './ItemTree.module.css';
/** 같은 부모를 가진 항목들(한 단계)을 그린다. 편집 모드에서는 이 안에서만 순서를 바꿀 수 있다. */
export default function ItemTree({ categoryId, items, checked, onToggle, depth = 0 }) {
    const reorderItems = useBoardStore((s) => s.reorderItems);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    const visible = activeItems(items);
    return (_jsx(DndContext, { sensors: sensors, collisionDetection: closestCenter, accessibility: koDndAccessibility, onDragEnd: ({ active, over }) => {
            if (over && active.id !== over.id)
                reorderItems(String(active.id), String(over.id));
        }, children: _jsx(SortableContext, { items: visible.map((i) => i.id), strategy: verticalListSortingStrategy, children: visible.map((item) => (_jsx(ItemRow, { item: item, categoryId: categoryId, checked: checked, onToggle: onToggle, depth: depth }, item.id))) }) }));
}
function ItemRow({ item, categoryId, checked, onToggle, depth }) {
    const edit = useContext(EditContext);
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id: item.id,
        disabled: !edit.editing,
    });
    const kids = activeItems(item.children);
    const isChecked = isItemChecked(item, checked);
    return (_jsxs("div", { ref: setNodeRef, style: { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }, children: [_jsxs("div", { className: styles.row, style: { paddingLeft: depth * 22 }, children: [edit.editing && _jsx(DragHandle, { ref: setActivatorNodeRef, ...attributes, ...listeners }), kids.length === 0 ? (_jsxs("label", { className: styles.item, children: [_jsx("input", { type: "checkbox", checked: isChecked, disabled: edit.editing, onChange: () => onToggle(item.id) }), _jsx("span", { className: styles.text, children: item.name })] })) : (_jsxs("div", { className: styles.item, children: [_jsx("span", { className: `${styles.indicator} ${isChecked ? styles.on : ''}`, "aria-hidden": "true" }), _jsxs("span", { className: styles.text, children: [item.name, !edit.editing && _jsx("span", { className: styles.hint, children: " \u00B7 \uC544\uB798 \uD56D\uBAA9 \uC911 \uD558\uB098\uB9CC \uD574\uB3C4 \uC644\uB8CC" })] })] })), edit.editing && (_jsx(EditTools, { name: item.name, onEdit: () => edit.editItem(item), onDelete: () => edit.deleteItem(item), onAddChild: depth === 0 ? () => edit.addItem(categoryId, item.id, item.name) : undefined }))] }), kids.length > 0 && (_jsx(ItemTree, { categoryId: categoryId, items: kids, checked: checked, onToggle: onToggle, depth: depth + 1 }))] }));
}
