import { useEffect } from 'react';
import { useDialogFocus } from '../hooks/useDialogFocus';
import styles from './ConfirmDialog.module.css';

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: Props) {
  const dialogRef = useDialogFocus<HTMLDivElement>();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className={styles.scrim} onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div ref={dialogRef} className={styles.dialog} role="alertdialog" aria-modal="true" aria-label={title}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.msg}>{message}</p>
        <div className={styles.btns}>
          <button type="button" className={styles.btn} onClick={onCancel} autoFocus>
            취소
          </button>
          <button type="button" className={`${styles.btn} ${styles.del}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
