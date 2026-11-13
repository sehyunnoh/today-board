import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo, useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import CategoryCard from '../components/CategoryCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { koDndAccessibility } from '../components/dndAccessibility';
import EmptyBoard from '../components/EmptyBoard';
import { EditContext } from '../components/EditContext';
import EditSheet from '../components/EditSheet';
import FxCard from '../components/FxCard';
import ProgressPanel from '../components/ProgressPanel';
import SyncBadge from '../components/SyncBadge';
import WeatherCard from '../components/WeatherCard';
import { FX_TTL_MS, WEATHER_TTL_MS } from '../config';
import { activeCategories, progress } from '../domain/completion';
import { useCachedResource } from '../hooks/useCachedResource';
import { fetchFx } from '../services/fx';
import { fetchWeather } from '../services/weather';
import { formatDateLabel } from '../domain/date';
import { useBoardStore } from '../store/useBoardStore';
import styles from './TodayPage.module.css';
export default function TodayPage({ onOpenSettings }) {
    const store = useBoardStore();
    const { list, today, toggleItem } = store;
    const checkedIds = useBoardStore((s) => s.logs[s.today]?.checked);
    const [editing, setEditing] = useState(false);
    const [sheet, setSheet] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const weather = useCachedResource('today-board:weather', fetchWeather, WEATHER_TTL_MS);
    const fx = useCachedResource('today-board:fx', fetchFx, FX_TTL_MS);
    const [refreshing, setRefreshing] = useState(false);
    const refreshInfo = async () => {
        setRefreshing(true);
        try {
            await Promise.all([weather.refresh(), fx.refresh()]);
        }
        finally {
            setRefreshing(false);
        }
    };
    const checked = useMemo(() => new Set(checkedIds ?? []), [checkedIds]);
    const { done, total } = progress(list, checked);
    const categories = activeCategories(list);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    const editApi = {
        editing,
        editCategory: (c) => setSheet({ kind: 'editCategory', id: c.id, name: c.name, emoji: c.emoji }),
        deleteCategory: (c) => setDeleting({ kind: 'category', id: c.id, name: c.name }),
        addItem: (categoryId, parentId, parentName) => setSheet({ kind: 'addItem', categoryId, parentId, parentName }),
        editItem: (i) => setSheet({ kind: 'editItem', id: i.id, name: i.name }),
        deleteItem: (i) => setDeleting({ kind: 'item', id: i.id, name: i.name }),
    };
    const closeSheet = useCallback(() => setSheet(null), []);
    const cancelDelete = useCallback(() => setDeleting(null), []);
    const submitSheet = ({ name, emoji }) => {
        if (!sheet)
            return;
        if (sheet.kind === 'addCategory')
            store.addCategory(name, emoji);
        else if (sheet.kind === 'editCategory')
            store.updateCategory(sheet.id, { name, emoji });
        else if (sheet.kind === 'addItem')
            store.addItem(sheet.categoryId, sheet.parentId, name);
        else
            store.renameItem(sheet.id, name);
        setSheet(null);
    };
    const confirmDelete = () => {
        if (!deleting)
            return;
        if (deleting.kind === 'category')
            store.archiveCategory(deleting.id);
        else
            store.archiveItem(deleting.id);
        setDeleting(null);
    };
    return (_jsxs(EditContext.Provider, { value: editApi, children: [_jsxs("div", { className: styles.layout, children: [_jsxs("header", { className: styles.head, children: [_jsxs("div", { className: styles.headTop, children: [_jsxs("div", { children: [_jsx("div", { className: styles.date, children: formatDateLabel(today) }), _jsx("h1", { className: styles.title, children: "\uC624\uB298\uB3C4 \uCC9C\uCC9C\uD788, \uD558\uB098\uC529 \u2615" }), _jsx(SyncBadge, { onClick: onOpenSettings })] }), _jsx("button", { type: "button", className: `${styles.pill} ${editing ? styles.pillOn : ''}`, "aria-pressed": editing, onClick: () => setEditing((e) => !e), children: editing ? '완료' : '편집' })] }), editing && (_jsx("p", { className: styles.editBar, children: "\u270E \uD3B8\uC9D1 \uC911\uC774\uC5D0\uC694. \uC774\uB984 \uC218\uC815, \uC0AD\uC81C, \uC21C\uC11C \uBCC0\uACBD(\u283F)\uC744 \uD560 \uC218 \uC788\uACE0, \uB05D\uB098\uBA74 \"\uC644\uB8CC\"\uB97C \uB20C\uB7EC \uC8FC\uC138\uC694." }))] }), _jsxs("aside", { className: styles.side, children: [_jsxs("div", { className: styles.info, children: [_jsxs("button", { type: "button", className: styles.refresh, onClick: () => void refreshInfo(), disabled: refreshing, "aria-label": "\uB0A0\uC528\uC640 \uD658\uC728 \uC9C0\uAE08 \uC0C8\uB85C\uACE0\uCE68", children: [_jsx("span", { className: refreshing ? styles.spin : undefined, "aria-hidden": "true", children: "\u21BB" }), ' ', refreshing ? '갱신 중…' : '날씨·환율 새로고침'] }), _jsx(WeatherCard, { resource: weather }), _jsx(FxCard, { resource: fx })] }), _jsx("div", { className: styles.prog, children: _jsx(ProgressPanel, { done: done, total: total }) })] }), _jsxs("main", { className: styles.list, children: [_jsx(DndContext, { sensors: sensors, collisionDetection: closestCenter, accessibility: koDndAccessibility, onDragEnd: ({ active, over }) => {
                                    if (over && active.id !== over.id)
                                        store.reorderCategories(String(active.id), String(over.id));
                                }, children: _jsx(SortableContext, { items: categories.map((c) => c.id), strategy: verticalListSortingStrategy, children: categories.map((c, i) => (_jsx(CategoryCard, { category: c, checked: checked, onToggle: toggleItem, defaultOpen: i < 2 }, c.id))) }) }), categories.length === 0 && !editing && (_jsx(EmptyBoard, { onOpenSettings: onOpenSettings, onStartEdit: () => setEditing(true) })), editing && (_jsx("button", { type: "button", className: styles.addCat, onClick: () => setSheet({ kind: 'addCategory' }), children: "\uFF0B \uCE74\uD14C\uACE0\uB9AC \uCD94\uAC00" }))] })] }), _jsx(EditSheet, { state: sheet, onClose: closeSheet, onSubmit: submitSheet }), "      ", deleting && (_jsx(ConfirmDialog, { title: "\uC815\uB9D0 \uC0AD\uC81C\uD560\uAE4C\uC694?", message: `“${deleting.name}”${deleting.kind === 'category' ? ' 카테고리와 안의 모든 항목' : ''}을(를) 목록에서 숨겨요. 지난 기록은 통계에 그대로 남아요.`, confirmLabel: "\uC0AD\uC81C", onConfirm: confirmDelete, onCancel: cancelDelete }))] }));
}
