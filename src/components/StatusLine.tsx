import { formatAgo } from '../domain/cache';
import { useNow } from '../hooks/useNow';
import type { ResourceStatus } from '../hooks/useCachedResource';
import styles from './InfoCard.module.css';

interface Props {
  status: ResourceStatus;
  fetchedAt: number | null;
  onRetry: () => void;
}

/** 카드 맨 아래에 갱신 시각과 오류 상태를 보여준다. */
export default function StatusLine({ status, fetchedAt, onRetry }: Props) {
  const now = useNow();
  if (status === 'loading') return <p className={styles.status}>불러오는 중…</p>;
  const ago = fetchedAt ? formatAgo(fetchedAt, now) : '';
  if (status === 'stale') {
    return (
      <p className={`${styles.status} ${styles.warn}`}>
        ⚠ 새로 불러오지 못해 이전 값이에요 · {ago}
        <button type="button" className={styles.retry} onClick={onRetry}>
          다시 시도
        </button>
      </p>
    );
  }
  return <p className={styles.status}>{ago} 갱신</p>;
}
