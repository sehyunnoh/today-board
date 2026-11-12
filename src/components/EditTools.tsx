import styles from './EditTools.module.css';

interface Props {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
  /** 하위 항목 추가 버튼을 보여줄 때만 전달한다. */
  onAddChild?: () => void;
}

export default function EditTools({ name, onEdit, onDelete, onAddChild }: Props) {
  return (
    <div className={styles.tools}>
      <button type="button" className={styles.btn} onClick={onEdit} aria-label={`${name} 이름 수정`}>
        ✎
      </button>
      {onAddChild && (
        <button type="button" className={styles.btn} onClick={onAddChild} aria-label={`${name} 하위 항목 추가`}>
          ＋
        </button>
      )}
      <button type="button" className={`${styles.btn} ${styles.del}`} onClick={onDelete} aria-label={`${name} 삭제`}>
        🗑
      </button>
    </div>
  );
}
