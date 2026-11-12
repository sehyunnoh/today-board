import { useState } from 'react';
import { FX_TTL_MS } from '../config';
import { cadToKrw, krwToCad, parseAmount } from '../domain/fx';
import { useCachedResource } from '../hooks/useCachedResource';
import { fetchFx } from '../services/fx';
import StatusLine from './StatusLine';
import styles from './InfoCard.module.css';

const nf = (max: number) => new Intl.NumberFormat('ko-KR', { maximumFractionDigits: max });

export default function FxCard() {
  const { data, status, fetchedAt, refresh } = useCachedResource('today-board:fx', fetchFx, FX_TTL_MS);
  const [open, setOpen] = useState(false);
  const [fromCad, setFromCad] = useState(true); // true: CAD → 원, false: 원 → CAD
  const [text, setText] = useState('100');

  if (!data) {
    return (
      <section className={`${styles.card} ${styles.fx}`}>
        <small className={styles.label}>💱 환율</small>
        {status === 'loading' ? (
          <p className={styles.status}>환율을 불러오는 중…</p>
        ) : (
          <>
            <p className={styles.sub}>환율을 불러오지 못했어요.</p>
            <button type="button" className={styles.retry} onClick={() => void refresh()}>
              다시 시도
            </button>
          </>
        )}
      </section>
    );
  }

  const amount = parseAmount(text);
  const result =
    amount === null ? null : fromCad ? `${nf(0).format(cadToKrw(amount, data.cadToKrw))} 원` : `${nf(2).format(krwToCad(amount, data.cadToKrw))} CAD`;

  return (
    <section className={`${styles.card} ${styles.fx} ${open ? styles.open : ''}`} aria-label="환율">
      <small className={styles.label}>💱 1 CAD</small>
      <b className={styles.big}>{nf(2).format(data.cadToKrw)}원</b>
      <em className={styles.sub}>100원 = {nf(3).format(krwToCad(100, data.cadToKrw))} CAD</em>

      <div className={styles.details}>
        <div className={styles.conv}>
          <input
            inputMode="decimal"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label={fromCad ? '변환할 CAD 금액' : '변환할 원화 금액'}
            aria-invalid={amount === null}
          />
          <span>{fromCad ? 'CAD' : '원'}</span>
          <button
            type="button"
            className={styles.swap}
            onClick={() => setFromCad((v) => !v)}
            aria-label="변환 방향 바꾸기"
          >
            ⇄
          </button>
        </div>
        <p className={styles.result} aria-live="polite">
          = {result ?? '숫자를 입력해 주세요'}
        </p>
        <p className={styles.sub}>기준일 {data.date} · 참고용 환율이라 실제 은행 환율과 달라요</p>
      </div>

      <button type="button" className={styles.more} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? '접기 ▴' : '계산기 ▾'}
      </button>
      <StatusLine status={status} fetchedAt={fetchedAt} onRetry={() => void refresh()} />
    </section>
  );
}
