import { useState } from 'react';
import { LOCATION, WEATHER_TTL_MS } from '../config';
import { weekdayKo } from '../domain/date';
import { weatherInfo } from '../domain/weather';
import { useCachedResource } from '../hooks/useCachedResource';
import { fetchWeather } from '../services/weather';
import StatusLine from './StatusLine';
import styles from './InfoCard.module.css';

const deg = (n: number) => `${Math.round(n)}°`;

export default function WeatherCard() {
  const { data, status, fetchedAt, refresh } = useCachedResource('today-board:weather', fetchWeather, WEATHER_TTL_MS);
  const [open, setOpen] = useState(false);

  if (!data) {
    return (
      <section className={`${styles.card} ${styles.weather}`}>
        <small className={styles.label}>🌤 {LOCATION.name}</small>
        {status === 'loading' ? (
          <p className={styles.status}>날씨를 불러오는 중…</p>
        ) : (
          <>
            <p className={styles.sub}>날씨를 불러오지 못했어요.</p>
            <button type="button" className={styles.retry} onClick={() => void refresh()}>
              다시 시도
            </button>
          </>
        )}
      </section>
    );
  }

  const info = weatherInfo(data.code, data.isDay);
  return (
    <section className={`${styles.card} ${styles.weather} ${open ? styles.open : ''}`} aria-label="날씨">
      <small className={styles.label}>
        {info.icon} {LOCATION.name}
      </small>
      <b className={styles.big}>{deg(data.temp)}C</b>
      <em className={styles.sub}>
        {info.label} · 체감 {deg(data.feelsLike)}C
      </em>

      <div className={styles.details}>
        <p className={styles.sub}>습도 {Math.round(data.humidity)}%</p>
        <ul className={styles.forecast}>
          {data.daily.map((d, i) => {
            const f = weatherInfo(d.code);
            return (
              <li key={d.date}>
                <span>{i === 0 ? '오늘' : i === 1 ? '내일' : weekdayKo(d.date)}</span>
                <b aria-label={f.label}>{f.icon}</b>
                <span>
                  {deg(d.max)} <i>{deg(d.min)}</i>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <button type="button" className={styles.more} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? '접기 ▴' : '예보 ▾'}
      </button>
      <StatusLine status={status} fetchedAt={fetchedAt} onRetry={() => void refresh()} />
    </section>
  );
}
