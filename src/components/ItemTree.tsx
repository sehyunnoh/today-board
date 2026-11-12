import { useContext } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { activeItems, isItemChecked } from '../domain/completion';
import type { Item } from '../domain/types';
import { useBoardStore } from '../store/useBoardStore';
import DragHandle from './DragHandle';
import { EditContext } from './EditContext';
import EditTools from './EditTools';
import { koDndAccessibility } from './dndAccessibility';
import styles from './ItemTree.module.css';

interface Props {
  categoryId: string;
  items: Item[];
  checked: ReadonlySet<string>;
  onToggle: (id: string) => void;
  depth?: number;
}

/** 같은 부모를 가진 항목들(한 단계)을 그린다. 편집 모드에서는 이 안에서만 순서를 바꿀 수 있다. */
export default function ItemTree({ categoryId, items, checked, onToggle, depth = 0 }: Props) {
  const reorderItems = useBoardStore((s) => s.reorderItems);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const visible = activeItems(items);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={koDndAccessibility}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over.id) reorderItems(String(active.id), String(over.id));
      }}
    >
      <SortableContext items={visible.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {visible.map((item) => (
          <ItemRow key={item.id} item={item} categoryId={categoryId} checked={checked} onToggle={onToggle} depth={depth} />
        ))}
      </SortableContext>
    </DndContext>
  );
}

interface RowProps {
  item: Item;
  categoryId: string;
  checked: ReadonlySet<string>;
  onToggle: (id: string) => void;
  depth: number;
}

function ItemRow({ item, categoryId, checked, onToggle, depth }: RowProps) {
  const edit = useContext(EditContext);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !edit.editing,
  });
  const kids = activeItems(item.children);
  const isChecked = isItemChecked(item, checked);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
    >
      <div className={styles.row} style={{ paddingLeft: depth * 22 }}>
        {edit.editing && <DragHandle ref={setActivatorNodeRef} {...attributes} {...listeners} />}
        {kids.length === 0 ? (
          <label className={styles.item}>
            <input type="checkbox" checked={isChecked} disabled={edit.editing} onChange={() => onToggle(item.id)} />
            <span className={styles.text}>{item.name}</span>
          </label>
        ) : (
          <div className={styles.item}>
            <span className={`${styles.indicator} ${isChecked ? styles.on : ''}`} aria-hidden="true" />
            <span className={styles.text}>
              {item.name}
              {!edit.editing && <span className={styles.hint}> · 아래 항목 중 하나만 해도 완료</span>}
            </span>
          </div>
        )}
        {edit.editing && (
          <EditTools
            name={item.name}
            onEdit={() => edit.editItem(item)}
            onDelete={() => edit.deleteItem(item)}
            onAddChild={depth === 0 ? () => edit.addItem(categoryId, item.id, item.name) : undefined}
          />
        )}
      </div>
      {kids.length > 0 && (
        <ItemTree categoryId={categoryId} items={kids} checked={checked} onToggle={onToggle} depth={depth + 1} />
      )}
    </div>
  );
}
