import { LOCATION } from '../config';
import { parseWeather } from '../domain/weather';
export async function fetchWeather() {
    const params = new URLSearchParams({
        latitude: String(LOCATION.latitude),
        longitude: String(LOCATION.longitude),
        current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min',
        timezone: LOCATION.timezone,
        forecast_days: '4',
    });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok)
        throw new Error(`날씨 요청 실패 (${res.status})`);
    return parseWeather(await res.json());
}
