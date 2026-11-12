import { useEffect, useState, type FormEvent } from 'react';
import { useDialogFocus } from '../hooks/useDialogFocus';
import styles from './EditSheet.module.css';

export type SheetState =
  | { kind: 'addCategory' }
  | { kind: 'editCategory'; id: string; name: string; emoji: string }
  | { kind: 'addItem'; categoryId: string; parentId: string | null; parentName?: string }
  | { kind: 'editItem'; id: string; name: string };

interface Props {
  state: SheetState | null;
  onClose: () => void;
  onSubmit: (values: { name: string; emoji: string }) => void;
}

const EMOJIS = ['💪', '📚', '💻', '✍️', '💰', '🚶', '🎯', '🍎', '🧘', '🎵', '🏠', '🌱'];

export default function EditSheet({ state, onClose, onSubmit }: Props) {
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, onClose]);

  if (!state) return null;
  // 열릴 때마다 새 폼 상태로 시작하도록 key를 준다.
  return <SheetForm key={JSON.stringify(state)} state={state} onClose={onClose} onSubmit={onSubmit} />;
}

function SheetForm({ state, onClose, onSubmit }: Props & { state: SheetState }) {
  const dialogRef = useDialogFocus<HTMLDivElement>();
  const isCategory = state.kind === 'addCategory' || state.kind === 'editCategory';
  const [name, setName] = useState(state.kind === 'editCategory' || state.kind === 'editItem' ? state.name : '');
  const [emoji, setEmoji] = useState(state.kind === 'editCategory' ? state.emoji : '📌');

  const title =
    state.kind === 'addCategory'
      ? '카테고리 추가'
      : state.kind === 'editCategory'
        ? '카테고리 수정'
        : state.kind === 'addItem'
          ? state.parentName
            ? `“${state.parentName}” 하위 항목 추가`
            : '항목 추가'
          : '항목 수정';
  const trimmed = name.trim();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    onSubmit({ name: trimmed, emoji: emoji.trim() || '📌' });
  };

  return (
    <div className={styles.scrim} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className={styles.sheet} role="dialog" aria-modal="true" aria-label={title}>
      <form onSubmit={submit}>
        <h2 className={styles.title}>{title}</h2>

        {isCategory && (
          <>
            <label className={styles.label} htmlFor="sheet-emoji">
              아이콘
            </label>
            <div className={styles.emojiRow}>
              <input
                id="sheet-emoji"
                className={`${styles.input} ${styles.emojiInput}`}
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                aria-label="아이콘 이모지"
              />
              <div className={styles.presets}>
                {EMOJIS.map((em) => (
                  <button type="button" key={em} className={styles.preset} onClick={() => setEmoji(em)} aria-label={`아이콘 ${em}`}>
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <label className={styles.label} htmlFor="sheet-name">
          {isCategory ? '카테고리 이름' : '할 일 이름'}
        </label>
        <input
          id="sheet-name"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isCategory ? '예: 건강' : '예: 스트레칭 10분'}
          maxLength={80}
          autoFocus
        />

        <div className={styles.btns}>
          <button type="button" className={styles.btn} onClick={onClose}>
            취소
          </button>
          <button type="submit" className={`${styles.btn} ${styles.pri}`} disabled={!trimmed}>
            저장
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
