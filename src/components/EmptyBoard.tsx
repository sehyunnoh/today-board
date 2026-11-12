import { useSyncStore } from '../store/useSyncStore';
import styles from './EmptyBoard.module.css';

interface Props {
  onOpenSettings: () => void;
  onStartEdit: () => void;
}

/** 목록이 하나도 없을 때(새 기기 첫 실행 등) 무엇을 하면 되는지 알려 준다. */
export default function EmptyBoard({ onOpenSettings, onStartEdit }: Props) {
  const connected = useSyncStore((s) => s.config !== null);
  const status = useSyncStore((s) => s.status);
  const error = useSyncStore((s) => s.error);

  const loading = connected && (status === 'pending' || status === 'syncing');
  const failed = connected && (status === 'error' || status === 'offline');

  return (
    <section className={styles.box} aria-label="목록이 비어 있어요">
      <div className={styles.emoji} aria-hidden="true">
        {loading ? '⏳' : failed ? '⚠️' : '🌱'}
      </div>
      {loading ? (
        <>
          <h2>저장소에서 목록을 불러오는 중이에요</h2>
          <p>잠시만 기다려 주세요.</p>
        </>
      ) : failed ? (
        <>
          <h2>목록을 불러오지 못했어요</h2>
          <p>{error}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={onOpenSettings}>
              설정 열기
            </button>
          </div>
        </>
      ) : connected ? (
        <>
          <h2>저장소에 아직 목록이 없어요</h2>
          <p>카테고리를 추가하면 저장소에도 올라가서 다른 기기에서도 보여요.</p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={onStartEdit}>
              카테고리 만들기
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>아직 할 일 목록이 없어요</h2>
          <p>
            이미 쓰던 목록이 있다면 GitHub 동기화를 연결해서 불러오세요. 처음이라면 직접 만들어도 돼요.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={onOpenSettings}>
              GitHub 동기화 연결
            </button>
            <button type="button" className={styles.secondary} onClick={onStartEdit}>
              직접 만들기
            </button>
          </div>
        </>
      )}
    </section>
  );
}
