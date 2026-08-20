import { type HourlyForecast } from '../services/openMeteo';

const FOG_CODES = new Set([45, 48]);
const PRECIP_HOUR_MM = 0.1;

export type HourlyDayBreakdown = {
  daytimeCodes: number[];
  allCodes: number[];
  /** Codes for hours with >= 0.1 mm precipitation */
  precipitatingCodes: number[];
  fogDaytimeHours: number;
};

/** Group hourly forecast rows for a calendar date (YYYY-MM-DD). */
export function getHourlyBreakdownForDate(hourly: HourlyForecast, date: string): HourlyDayBreakdown {
  const daytimeCodes: number[] = [];
  const allCodes: number[] = [];
  const precipitatingCodes: number[] = [];
  let fogDaytimeHours = 0;

  for (const hour of hourly.hours) {
    if (!hour.time.startsWith(date)) continue;
    allCodes.push(hour.weatherCode);
    if (hour.precipitationMm >= PRECIP_HOUR_MM) {
      precipitatingCodes.push(hour.weatherCode);
    }
    if (hour.isDay === false) continue;
    daytimeCodes.push(hour.weatherCode);
    if (FOG_CODES.has(hour.weatherCode)) fogDaytimeHours += 1;
  }

  return { daytimeCodes, allCodes, precipitatingCodes, fogDaytimeHours };
}
