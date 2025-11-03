export type DailyForecastDay = {
  date: string; // ISO date
  weatherCode: number;
  temperatureMax: number; // °C
  temperatureMin: number; // °C
  precipitationMm: number; // mm
  precipitationProbability?: number; // % (daily max)
};

export type DailyForecast = {
  timezone: string;
  days: DailyForecastDay[];
};

type FetchDailyForecastParams = {
  latitude: number;
  longitude: number;
  days?: number; // optional limit, default API window
};

// Docs: https://open-meteo.com/en/docs
export async function fetchDailyForecast({ latitude, longitude, days }: FetchDailyForecastParams): Promise<DailyForecast> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max');
  url.searchParams.set('timezone', 'America/Vancouver');
  url.searchParams.set('temperature_unit', 'celsius');
  if (days) url.searchParams.set('forecast_days', String(days));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Open-Meteo error: ${res.status}`);
  }
  const json = await res.json();

  const timezone: string = json.timezone;
  const time: string[] = json.daily?.time ?? [];
  const weathercode: number[] = json.daily?.weathercode ?? [];
  const temperatureMax: number[] = json.daily?.temperature_2m_max ?? [];
  const temperatureMin: number[] = json.daily?.temperature_2m_min ?? [];
  const precipitationSum: number[] = json.daily?.precipitation_sum ?? [];
  const precipitationProbabilityMax: Array<number | null> = json.daily?.precipitation_probability_max ?? [];

  let length = Math.min(time.length, weathercode.length, temperatureMax.length, temperatureMin.length, precipitationSum.length);
  if (precipitationProbabilityMax.length) {
    length = Math.min(length, precipitationProbabilityMax.length);
  }
  const daysParsed: DailyForecastDay[] = [];
  for (let i = 0; i < length; i++) {
    daysParsed.push({
      date: time[i],
      weatherCode: weathercode[i],
      temperatureMax: temperatureMax[i],
      temperatureMin: temperatureMin[i],
      precipitationMm: precipitationSum[i],
      precipitationProbability: precipitationProbabilityMax[i] ?? undefined
    });
  }

  return { timezone, days: daysParsed };
}

export type HourlyForecastHour = {
  time: string; // ISO datetime in requested timezone
  weatherCode: number;
  temperatureC: number;
  precipitationMm: number; // per hour
  precipitationProbability?: number; // % if provided by API
  isDay?: boolean; // true = day, false = night (from API if requested)
};

export type HourlyForecast = {
  timezone: string;
  hours: HourlyForecastHour[];
};

type FetchHourlyForecastParams = {
  latitude: number;
  longitude: number;
  hours?: number; // clip to first N hours if desired
};

export async function fetchHourlyForecast({ latitude, longitude, hours }: FetchHourlyForecastParams): Promise<HourlyForecast> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('hourly', 'weathercode,temperature_2m,precipitation,precipitation_probability,is_day');
  url.searchParams.set('timezone', 'America/Vancouver');
  url.searchParams.set('temperature_unit', 'celsius');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
  const json = await res.json();

  const timezone: string = json.timezone;
  const time: string[] = json.hourly?.time ?? [];
  const weathercode: number[] = json.hourly?.weathercode ?? [];
  const temperature: number[] = json.hourly?.temperature_2m ?? [];
  const precipitation: number[] = json.hourly?.precipitation ?? [];
  const precipitationProbability: Array<number | null> = json.hourly?.precipitation_probability ?? [];
  const isDayArr: Array<number | null> = json.hourly?.is_day ?? [];

  let length = Math.min(time.length, weathercode.length, temperature.length, precipitation.length);
  if (precipitationProbability.length) {
    length = Math.min(length, precipitationProbability.length);
  }
  if (isDayArr.length) {
    length = Math.min(length, isDayArr.length);
  }
  if (typeof hours === 'number') {
    length = Math.min(length, hours);
  }

  const hoursParsed: HourlyForecastHour[] = [];
  for (let i = 0; i < length; i++) {
    hoursParsed.push({
      time: time[i],
      weatherCode: weathercode[i],
      temperatureC: temperature[i],
      precipitationMm: precipitation[i],
      precipitationProbability: precipitationProbability[i] ?? undefined,
      isDay: isDayArr[i] != null ? isDayArr[i] === 1 : undefined,
    });
  }

  return { timezone, hours: hoursParsed };
}

