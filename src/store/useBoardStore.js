import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EMPTY_LIST } from '../domain/emptyList';
import { dateKey } from '../domain/date';
import * as edit from '../domain/edit';
import { newId } from '../domain/id';
import { buildDayLog, toggleWithMark } from '../domain/log';
import { mergeList, mergeLogs, stableStringify } from '../domain/merge';
const withMonth = (months, date) => {
    const m = date.slice(0, 7);
    return months.includes(m) ? months : [...months, m];
};
export const useBoardStore = create()(persist((set, get) => {
    /** 목록을 바꾸고, 오늘 기록의 통계 스냅샷(완료 카테고리, 전체 수)도 새 목록 기준으로 다시 계산한다. */
    const applyEdit = (fn) => {
        const { list, logs, today, dirtyMonths, rev } = get();
        const nextList = fn(list);
        if (nextList === list)
            return;
        const todayLog = logs[today];
        set({
            list: nextList,
            logs: todayLog ? { ...logs, [today]: buildDayLog(nextList, todayLog.checked, todayLog.marks) } : logs,
            dirtyMonths: todayLog ? withMonth(dirtyMonths, today) : dirtyMonths,
            rev: rev + 1,
        });
    };
    return {
        list: EMPTY_LIST,
        logs: {},
        today: dateKey(),
        dirtyMonths: [],
        rev: 0,
        toggleItem: (itemId) => {
            const { list, logs, today, dirtyMonths, rev } = get();
            const { checked, marks } = toggleWithMark(logs[today], itemId, Date.now());
            set({
                logs: { ...logs, [today]: buildDayLog(list, checked, marks) },
                dirtyMonths: withMonth(dirtyMonths, today),
                rev: rev + 1,
            });
        },
        syncToday: () => {
            const t = dateKey();
            if (t !== get().today)
                set({ today: t });
        },
        addCategory: (name, emoji) => applyEdit((l) => edit.addCategory(l, { id: newId('c'), name, emoji })),
        updateCategory: (id, patch) => applyEdit((l) => edit.updateCategory(l, id, patch)),
        archiveCategory: (id) => applyEdit((l) => edit.archiveCategory(l, id)),
        addItem: (categoryId, parentId, name) => applyEdit((l) => edit.addItem(l, categoryId, parentId, { id: newId('i'), name })),
        renameItem: (id, name) => applyEdit((l) => edit.renameItem(l, id, name)),
        archiveItem: (id) => applyEdit((l) => edit.archiveItem(l, id)),
        reorderCategories: (a, o) => applyEdit((l) => edit.reorderCategories(l, a, o)),
        reorderItems: (a, o) => applyEdit((l) => edit.reorderItems(l, a, o)),
        mergeRemoteList: (remote) => {
            const { list, logs, today } = get();
            const merged = mergeList(list, remote);
            if (merged === list)
                return;
            const todayLog = logs[today];
            set({
                list: merged,
                logs: todayLog ? { ...logs, [today]: buildDayLog(merged, todayLog.checked, todayLog.marks) } : logs,
            });
        },
        mergeRemoteLogs: (remote) => {
            const { list, logs } = get();
            const merged = mergeLogs(list, logs, remote);
            if (stableStringify(merged) !== stableStringify(logs))
                set({ logs: merged });
        },
        clearDirty: (revAtStart) => {
            if (get().rev === revAtStart && get().dirtyMonths.length > 0)
                set({ dirtyMonths: [] });
        },
    };
}, {
    name: 'today-board:v1',
    partialize: (s) => ({ list: s.list, logs: s.logs, dirtyMonths: s.dirtyMonths }),
}));
