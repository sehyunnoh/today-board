/** 목록을 수정하는 순수 함수 모음. 항상 새 객체를 돌려주고 updatedAt을 갱신한다. */
const stamp = (list, now) => ({ ...list, updatedAt: now.toISOString() });
export function arrayMove(arr, from, to) {
    const next = arr.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
}
function mapItems(items, fn) {
    return items.map((i) => {
        const mapped = fn(i);
        return { ...mapped, children: mapItems(mapped.children, fn) };
    });
}
const mapAllItems = (list, fn) => ({
    ...list,
    categories: list.categories.map((c) => ({ ...c, items: mapItems(c.items, fn) })),
});
export function addCategory(list, cat, now = new Date()) {
    const category = { id: cat.id, name: cat.name, emoji: cat.emoji, items: [] };
    return stamp({ ...list, categories: [...list.categories, category] }, now);
}
export function updateCategory(list, id, patch, now = new Date()) {
    return stamp({ ...list, categories: list.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) }, now);
}
/** 삭제는 숨김 처리(archived)다. 지난 기록과 통계가 깨지지 않는다. */
export function archiveCategory(list, id, now = new Date()) {
    return stamp({ ...list, categories: list.categories.map((c) => (c.id === id ? { ...c, archived: true } : c)) }, now);
}
function addChild(items, parentId, child) {
    return items.map((i) => i.id === parentId ? { ...i, children: [...i.children, child] } : { ...i, children: addChild(i.children, parentId, child) });
}
/** parentId가 null이면 카테고리 바로 아래에, 아니면 해당 항목의 하위에 추가한다. */
export function addItem(list, categoryId, parentId, item, now = new Date()) {
    const newItem = { id: item.id, name: item.name, children: [] };
    return stamp({
        ...list,
        categories: list.categories.map((c) => c.id !== categoryId
            ? c
            : { ...c, items: parentId === null ? [...c.items, newItem] : addChild(c.items, parentId, newItem) }),
    }, now);
}
export function renameItem(list, id, name, now = new Date()) {
    return stamp(mapAllItems(list, (i) => (i.id === id ? { ...i, name } : i)), now);
}
export function archiveItem(list, id, now = new Date()) {
    return stamp(mapAllItems(list, (i) => (i.id === id ? { ...i, archived: true } : i)), now);
}
/** activeId 카테고리를 overId 카테고리 위치로 옮긴다. */
export function reorderCategories(list, activeId, overId, now = new Date()) {
    const from = list.categories.findIndex((c) => c.id === activeId);
    const to = list.categories.findIndex((c) => c.id === overId);
    if (from < 0 || to < 0 || from === to)
        return list;
    return stamp({ ...list, categories: arrayMove(list.categories, from, to) }, now);
}
function reorderIn(items, activeId, overId) {
    const from = items.findIndex((i) => i.id === activeId);
    const to = items.findIndex((i) => i.id === overId);
    if (from >= 0 && to >= 0)
        return from === to ? null : arrayMove(items, from, to);
    for (let idx = 0; idx < items.length; idx++) {
        const moved = reorderIn(items[idx].children, activeId, overId);
        if (moved)
            return items.map((it, j) => (j === idx ? { ...it, children: moved } : it));
    }
    return null;
}
/** 같은 부모 아래의 형제 항목끼리만 순서를 바꾼다. */
export function reorderItems(list, activeId, overId, now = new Date()) {
    for (let ci = 0; ci < list.categories.length; ci++) {
        const moved = reorderIn(list.categories[ci].items, activeId, overId);
        if (moved) {
            return stamp({ ...list, categories: list.categories.map((c, j) => (j === ci ? { ...c, items: moved } : c)) }, now);
        }
    }
    return list;
}
