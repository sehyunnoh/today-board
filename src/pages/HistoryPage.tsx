import { useEffect, useMemo } from 'react';
import { shortLabel, weekdayKo } from '../domain/date';
import { GOOD_DAY_RATE, averageRate, categoryRates, heatmap, monthsBack, recentDays, streaks } from '../domain/stats';
import { requestHistory } from '../services/sync';
import { useBoardStore } from '../store/useBoardStore';
import { useSyncStore } from '../store/useSyncStore';
import styles from './HistoryPage.module.css';

const pct = (rate: number | null) => (rate === null ? '-' : `${Math.round(rate * 100)}%`);

export default function HistoryPage() {
  const list = useBoardStore((s) => s.list);
  const logs = useBoardStore((s) => s.logs);
  const today = useBoardStore((s) => s.today);
  const syncStatus = useSyncStore((s) => s.status);
  const connected = useSyncStore((s) => s.config !== null);

  // 이 기기에 없는 지난 기록이 GitHub에 있으면 받아온다. (최근 13주가 걸친 달)
  useEffect(() => requestHistory(monthsBack(today, 91)), [today]);

  const days = useMemo(() => recentDays(logs, today, 14), [logs, today]);
  const streak = useMemo(() => streaks(logs, today), [logs, today]);
  const cells = useMemo(() => heatmap(logs, today, 13), [logs, today]);
  const cats = useMemo(() => categoryRates(list, logs, today, 7), [list, logs, today]);
  const avg = averageRate(days, today);
  const empty = Object.keys(logs).length === 0;
  const past = cells.filter((c) => !c.future && c.rate !== null);
  const heatSummary = `최근 13주 중 기록한 날 ${past.filter((c) => (c.rate ?? 0) > 0).length}일, 달성한 날 ${past.filter((c) => (c.rate ?? 0) >= GOOD_DAY_RATE).length}일`;

  const monthLabels = Array.from({ length: 13 }, (_, c) => {
    const first = cells[c * 7].date;
    return Number(first.slice(8, 10)) <= 7 ? `${Number(first.slice(5, 7))}월` : '';
  });

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>나의 꾸준함 🌱</h1>
        <p className={styles.sub}>
          하루 완료율이 {Math.round(GOOD_DAY_RATE * 100)}% 이상이면 &quot;달성한 날&quot;로 세요.
          {connected && syncStatus === 'syncing' && ' 지난 기록을 불러오는 중…'}
        </p>
      </header>

      {empty && <p className={styles.empty}>아직 기록이 없어요. 오늘 첫 체크를 해 보세요! 체크한 날부터 여기에 쌓여요.</p>}

      <section className={styles.tiles} aria-label="요약">
        <div className={styles.tile}>
          <span>🔥 현재 연속</span>
          <b>{streak.current}일</b>
        </div>
        <div className={styles.tile}>
          <span>🏆 최고 연속</span>
          <b>{streak.best}일</b>
        </div>
        <div className={styles.tile}>
          <span>📈 14일 평균</span>
          <b>{pct(avg)}</b>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.bars}`} aria-label="최근 14일 완료율">
        <h2>최근 14일 완료율</h2>
        <div className={styles.chart}>
          <div className={styles.goal} style={{ bottom: `${GOOD_DAY_RATE * 100}%` }} aria-hidden="true">
            <span>목표 {Math.round(GOOD_DAY_RATE * 100)}%</span>
          </div>
          {days.map((d) => {
            const isToday = d.date === today;
            const label = `${shortLabel(d.date)} (${weekdayKo(d.date)}) ${d.rate === null ? '기록 없음' : `${pct(d.rate)}${d.total ? ` · ${d.done}/${d.total}` : ''}`}`;
            return (
              <div key={d.date} className={styles.col} role="img" aria-label={label} title={label}>
                <div className={styles.track}>
                  {d.rate === null ? (
                    <i className={styles.none} />
                  ) : (
                    <i className={`${styles.bar} ${isToday ? styles.today : ''} ${d.rate >= GOOD_DAY_RATE ? styles.good : ''}`} style={{ height: `${Math.max(d.rate * 100, 3)}%` }} />
                  )}
                </div>
                <span className={`${styles.day} ${isToday ? styles.dayToday : ''}`}>{Number(d.date.slice(8, 10))}</span>
              </div>
            );
          })}
        </div>
        <p className={styles.note}>진한 막대는 달성한 날, 테두리 막대는 오늘(진행 중)이에요.</p>
      </section>

      <section className={`${styles.panel} ${styles.heat}`} aria-label="최근 13주 달력">
        <h2>최근 13주 달력</h2>
        <div className={styles.months} aria-hidden="true">
          {monthLabels.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
        <p className={styles.srOnly}>{heatSummary}</p>
        <div className={styles.grid} aria-hidden="true">
          {cells.map((c) => {
            const label = c.future ? '' : `${c.date} · ${c.rate === null ? '기록 없음' : `${pct(c.rate)}${c.total ? ` (${c.done}/${c.total})` : ''}`}`;
            return <i key={c.date} className={`${styles.cell} ${styles[`l${c.level}`]}`} style={c.future ? { visibility: 'hidden' } : undefined} title={label} />;
          })}
        </div>
        <div className={styles.legend} aria-hidden="true">
          적음
          <i className={`${styles.cell} ${styles.l0}`} />
          <i className={`${styles.cell} ${styles.l1}`} />
          <i className={`${styles.cell} ${styles.l2}`} />
          <i className={`${styles.cell} ${styles.l3}`} />
          많음
        </div>
      </section>

      <section className={`${styles.panel} ${styles.cats}`} aria-label="카테고리별 달성">
        <h2>카테고리별 달성 (최근 7일)</h2>
        {cats.map((c) => (
          <div key={c.id} className={styles.catRow}>
            <span className={styles.catName}>
              {c.emoji} {c.name}
            </span>
            <div className={styles.catTrack} role="img" aria-label={`${c.name} ${c.done}/${c.days}일`}>
              <i style={{ width: `${(c.rate ?? 0) * 100}%` }} />
            </div>
            <span className={styles.catNum}>
              {c.done}/{c.days}일
            </span>
          </div>
        ))}
      </section>
    </main>
  );
}
