import { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import CategoryCard from '../components/CategoryCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { koDndAccessibility } from '../components/dndAccessibility';
import EmptyBoard from '../components/EmptyBoard';
import { EditContext, type EditApi } from '../components/EditContext';
import EditSheet, { type SheetState } from '../components/EditSheet';
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

interface DeleteTarget {
  kind: 'category' | 'item';
  id: string;
  name: string;
}

export default function TodayPage({ onOpenSettings }: { onOpenSettings: () => void }) {
  const store = useBoardStore();
  const { list, today, toggleItem } = store;
  const checkedIds = useBoardStore((s) => s.logs[s.today]?.checked);

  const [editing, setEditing] = useState(false);
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null);

  const weather = useCachedResource('today-board:weather', fetchWeather, WEATHER_TTL_MS);
  const fx = useCachedResource('today-board:fx', fetchFx, FX_TTL_MS);
  const [refreshing, setRefreshing] = useState(false);
  const refreshInfo = async () => {
    setRefreshing(true);
    try {
      await Promise.all([weather.refresh(), fx.refresh()]);
    } finally {
      setRefreshing(false);
    }
  };

  const checked = useMemo(() => new Set(checkedIds ?? []), [checkedIds]);
  const { done, total } = progress(list, checked);
  const categories = activeCategories(list);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const editApi: EditApi = {
    editing,
    editCategory: (c) => setSheet({ kind: 'editCategory', id: c.id, name: c.name, emoji: c.emoji }),
    deleteCategory: (c) => setDeleting({ kind: 'category', id: c.id, name: c.name }),
    addItem: (categoryId, parentId, parentName) => setSheet({ kind: 'addItem', categoryId, parentId, parentName }),
    editItem: (i) => setSheet({ kind: 'editItem', id: i.id, name: i.name }),
    deleteItem: (i) => setDeleting({ kind: 'item', id: i.id, name: i.name }),
  };

  const closeSheet = useCallback(() => setSheet(null), []);
  const cancelDelete = useCallback(() => setDeleting(null), []);

  const submitSheet = ({ name, emoji }: { name: string; emoji: string }) => {
    if (!sheet) return;
    if (sheet.kind === 'addCategory') store.addCategory(name, emoji);
    else if (sheet.kind === 'editCategory') store.updateCategory(sheet.id, { name, emoji });
    else if (sheet.kind === 'addItem') store.addItem(sheet.categoryId, sheet.parentId, name);
    else store.renameItem(sheet.id, name);
    setSheet(null);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    if (deleting.kind === 'category') store.archiveCategory(deleting.id);
    else store.archiveItem(deleting.id);
    setDeleting(null);
  };

  return (
    <EditContext.Provider value={editApi}>
      <div className={styles.layout}>
        <header className={styles.head}>
          <div className={styles.headTop}>
            <div>
              <div className={styles.date}>{formatDateLabel(today)}</div>
              <h1 className={styles.title}>오늘도 천천히, 하나씩 ☕</h1>
              <SyncBadge onClick={onOpenSettings} />
            </div>
            <button
              type="button"
              className={`${styles.pill} ${editing ? styles.pillOn : ''}`}
              aria-pressed={editing}
              onClick={() => setEditing((e) => !e)}
            >
              {editing ? '완료' : '편집'}
            </button>
          </div>
          {editing && (
            <p className={styles.editBar}>
              ✎ 편집 중이에요. 이름 수정, 삭제, 순서 변경(⠿)을 할 수 있고, 끝나면 &quot;완료&quot;를 눌러 주세요.
            </p>
          )}
        </header>
        <aside className={styles.side}>
          <div className={styles.info}>
            <button
              type="button"
              className={styles.refresh}
              onClick={() => void refreshInfo()}
              disabled={refreshing}
              aria-label="날씨와 환율 지금 새로고침"
            >
              <span className={refreshing ? styles.spin : undefined} aria-hidden="true">
                ↻
              </span>{' '}
              {refreshing ? '갱신 중…' : '날씨·환율 새로고침'}
            </button>
            <WeatherCard resource={weather} />
            <FxCard resource={fx} />
          </div>
          <div className={styles.prog}>
            <ProgressPanel done={done} total={total} />
          </div>
        </aside>
        <main className={styles.list}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            accessibility={koDndAccessibility}
            onDragEnd={({ active, over }) => {
              if (over && active.id !== over.id) store.reorderCategories(String(active.id), String(over.id));
            }}
          >
            <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {categories.map((c, i) => (
                <CategoryCard key={c.id} category={c} checked={checked} onToggle={toggleItem} defaultOpen={i < 2} />
              ))}
            </SortableContext>
          </DndContext>
          {categories.length === 0 && !editing && (
            <EmptyBoard onOpenSettings={onOpenSettings} onStartEdit={() => setEditing(true)} />
          )}
          {editing && (
            <button type="button" className={styles.addCat} onClick={() => setSheet({ kind: 'addCategory' })}>
              ＋ 카테고리 추가
            </button>
          )}
        </main>
      </div>

      <EditSheet state={sheet} onClose={closeSheet} onSubmit={submitSheet} />      {deleting && (
        <ConfirmDialog
          title="정말 삭제할까요?"
          message={`“${deleting.name}”${deleting.kind === 'category' ? ' 카테고리와 안의 모든 항목' : ''}을(를) 목록에서 숨겨요. 지난 기록은 통계에 그대로 남아요.`}
          confirmLabel="삭제"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </EditContext.Provider>
  );
}
