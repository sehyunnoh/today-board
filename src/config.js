import { APP_TIMEZONE } from './domain/date';
/** 날씨를 보여줄 위치. 바꾸려면 이 값만 고치면 된다. */
export const LOCATION = {
    name: 'Oakville, ON',
    latitude: 43.4675,
    longitude: -79.6877,
    timezone: APP_TIMEZONE,
};
export const WEATHER_TTL_MS = 30 * 60 * 1000; // 30분
export const FX_TTL_MS = 60 * 60 * 1000; // 1시간
