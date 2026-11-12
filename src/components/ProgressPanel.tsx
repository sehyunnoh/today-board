import styles from './ProgressPanel.module.css';

interface Props {
  done: number;
  total: number;
}

export default function ProgressPanel({ done, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const complete = total > 0 && done === total;
  return (
    <section className={styles.panel} aria-label="오늘 진행률">
      <div className={styles.ring} style={{ '--p': pct } as React.CSSProperties}>
        <span>{pct}%</span>
      </div>
      <p className={styles.msg} aria-live="polite">
        {total === 0 ? (
          <>할 일 목록을 만들면 여기에 진행률이 나와요.</>
        ) : complete ? (
          <>
            <b>모든 미션 완료!</b> 오늘 정말 수고했어요 🎉
          </>
        ) : (
          <>
            오늘 미션 <b>{done}/{total}</b> 완료.
            <br />
            남은 {total - done}개, 천천히 해요.
          </>
        )}
      </p>
    </section>
  );
}
