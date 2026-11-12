export interface DailyForecast {
  date: string; // YYYY-MM-DD
  code: number;
  max: number;
  min: number;
}

export interface Weather {
  temp: number;
  feelsLike: number;
  humidity: number;
  code: number;
  isDay: boolean;
  daily: DailyForecast[];
}

/** Open-Meteo 응답(필요한 필드만)을 앱에서 쓰는 모양으로 바꾼다. 형식이 다르면 예외를 던진다. */
export function parseWeather(json: unknown): Weather {
  const j = json as {
    current?: { temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; weather_code: number; is_day: number };
    daily?: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
  };
  const c = j?.current;
  const d = j?.daily;
  if (!c || !d || typeof c.temperature_2m !== 'number') throw new Error('날씨 응답 형식이 올바르지 않아요');
  return {
    temp: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    code: c.weather_code,
    isDay: c.is_day === 1,
    daily: d.time.map((date, i) => ({
      date,
      code: d.weather_code[i],
      max: d.temperature_2m_max[i],
      min: d.temperature_2m_min[i],
    })),
  };
}

/** WMO 날씨 코드 → 아이콘과 한글 설명 */
export function weatherInfo(code: number, isDay = true): { icon: string; label: string } {
  if (code === 0) return isDay ? { icon: '☀️', label: '맑음' } : { icon: '🌙', label: '맑음' };
  if (code === 1 || code === 2) return isDay ? { icon: '⛅', label: '구름 조금' } : { icon: '☁️', label: '구름 조금' };
  if (code === 3) return { icon: '☁️', label: '흐림' };
  if (code === 45 || code === 48) return { icon: '🌫️', label: '안개' };
  if (code >= 51 && code <= 57) return { icon: '🌦️', label: '이슬비' };
  if (code >= 61 && code <= 67) return { icon: '🌧️', label: '비' };
  if (code >= 71 && code <= 77) return { icon: '🌨️', label: '눈' };
  if (code >= 80 && code <= 82) return { icon: '🌦️', label: '소나기' };
  if (code === 85 || code === 86) return { icon: '🌨️', label: '눈 소나기' };
  if (code >= 95 && code <= 99) return { icon: '⛈️', label: '뇌우' };
  return { icon: '🌡️', label: '날씨' };
}
