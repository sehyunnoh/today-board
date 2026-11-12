import { useContext, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { isCategoryDone } from '../domain/completion';
import type { Category } from '../domain/types';
import DragHandle from './DragHandle';
import { EditContext } from './EditContext';
import EditTools from './EditTools';
import ItemTree from './ItemTree';
import styles from './CategoryCard.module.css';

interface Props {
  category: Category;
  checked: ReadonlySet<string>;
  onToggle: (id: string) => void;
  defaultOpen?: boolean;
}

export default function CategoryCard({ category, checked, onToggle, defaultOpen = false }: Props) {
  const edit = useContext(EditContext);
  const [open, setOpen] = useState(defaultOpen);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    disabled: !edit.editing,
  });
  const done = isCategoryDone(category, checked);
  const showBody = open || edit.editing; // 편집 중에는 항목을 모두 보여준다

  return (
    <section
      ref={setNodeRef}
      className={`${styles.card} ${done ? styles.done : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
    >
      <div className={styles.headRow}>
        {edit.editing && <DragHandle ref={setActivatorNodeRef} {...attributes} {...listeners} />}
        <button
          className={styles.head}
          aria-expanded={showBody}
          onClick={() => !edit.editing && setOpen((o) => !o)}
          disabled={edit.editing}
        >
          <span className={styles.emoji} aria-hidden="true">
            {done ? '✓' : category.emoji}
          </span>
          <span className={styles.name}>{category.name}</span>
          {!edit.editing && (
            <>
              <span className={styles.badge}>{done ? '✓ 완료' : ''}</span>
              <span className={`${styles.chev} ${open ? styles.open : ''}`} aria-hidden="true">
                ›
              </span>
            </>
          )}
        </button>
        {edit.editing && (
          <EditTools
            name={category.name}
            onEdit={() => edit.editCategory(category)}
            onDelete={() => edit.deleteCategory(category)}
          />
        )}
      </div>
      {showBody && (
        <div className={styles.body}>
          <ItemTree categoryId={category.id} items={category.items} checked={checked} onToggle={onToggle} />
          {edit.editing && (
            <button type="button" className={styles.addRow} onClick={() => edit.addItem(category.id, null)}>
              ＋ 항목 추가
            </button>
          )}
        </div>
      )}
    </section>
  );
}
