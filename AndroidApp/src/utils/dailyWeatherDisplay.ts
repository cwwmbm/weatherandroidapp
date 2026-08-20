import { type DailyForecastDay } from '../services/openMeteo';
import { type HourlyDayBreakdown } from './hourlyByDate';

export type SkyBucket = 'clear' | 'mixed' | 'overcast';
export type WetBucket = 'dry' | 'rain' | 'snow' | 'showers' | 'drizzle';
export type HazardBucket = 'none' | 'fog' | 'thunder';

export type DailyDisplayKind =
  | 'sky-clear'
  | 'sky-mixed'
  | 'sky-overcast'
  | 'sky-trace-precip'
  | 'wet-rain'
  | 'wet-snow'
  | 'wet-showers'
  | 'wet-drizzle'
  | 'hazard-fog'
  | 'hazard-thunder';

export type DailyDisplayResult = {
  kind: DailyDisplayKind;
  label: string;
  sky: SkyBucket;
  wet: WetBucket;
  hazard: HazardBucket;
};

const THUNDER_CODES = new Set([95, 96, 99]);
const FOG_CODES = new Set([45, 48]);
const DRIZZLE_CODES = new Set([51, 53, 55, 56, 57]);
const SHOWER_CODES = new Set([80, 81, 82]);
const RAIN_CODES = new Set([61, 63, 65, 66, 67]);

const SUNSHINE_HIGH = 0.65;
const SUNSHINE_MEDIUM = 0.35;
const CODE_MAJORITY = 0.5;
const MEASURABLE_PRECIP_MM = 0.1;
/** Below this daily total, use sky icons unless rain is clearly the story */
const SIGNIFICANT_DAILY_PRECIP_MM = 2.5;
const SIGNIFICANT_PRECIP_HOURS = 3;
const SIGNIFICANT_RAIN_MM = 2;
const FOG_DAYTIME_HOURS_MIN = 2;
/** Min daily precip chance to show trace icon when little/no accumulation */
const TRACE_PRECIP_PROB_MIN = 15;

type CodeDistribution = 'mostly_01' | 'mostly_3' | 'mixed';
type SunshineTier = 'high' | 'medium' | 'low';

const SKY_MATRIX: Record<SunshineTier, Record<CodeDistribution, SkyBucket>> = {
  high: { mostly_01: 'clear', mostly_3: 'mixed', mixed: 'mixed' },
  medium: { mostly_01: 'mixed', mostly_3: 'mixed', mixed: 'mixed' },
  low: { mostly_01: 'mixed', mostly_3: 'overcast', mixed: 'overcast' },
};

function sunshineRatio(day: DailyForecastDay): number {
  const daylight = day.daylightDurationSeconds;
  const sunshine = day.sunshineDurationSeconds;
  if (!daylight || daylight <= 0 || sunshine == null) return 0;
  return sunshine / daylight;
}

function sunshineTier(ratio: number): SunshineTier {
  if (ratio >= SUNSHINE_HIGH) return 'high';
  if (ratio >= SUNSHINE_MEDIUM) return 'medium';
  return 'low';
}

function codeDistribution(daytimeCodes: number[]): CodeDistribution {
  if (daytimeCodes.length === 0) return 'mixed';
  const n = daytimeCodes.length;
  const pct01 = daytimeCodes.filter((c) => c === 0 || c === 1).length / n;
  const pct3 = daytimeCodes.filter((c) => c === 3).length / n;
  if (pct3 >= CODE_MAJORITY) return 'mostly_3';
  if (pct01 >= CODE_MAJORITY) return 'mostly_01';
  return 'mixed';
}

export function classifySky(day: DailyForecastDay, daytimeCodes: number[]): SkyBucket {
  return SKY_MATRIX[sunshineTier(sunshineRatio(day))][codeDistribution(daytimeCodes)];
}

function maxCode(codes: number[], fallback: number): number {
  return codes.length > 0 ? Math.max(...codes) : fallback;
}

function countCodes(codes: number[], set: Set<number>): number {
  return codes.filter((c) => set.has(c)).length;
}

function isSignificantWetDay(day: DailyForecastDay, breakdown: HourlyDayBreakdown): boolean {
  if ((day.snowfallCm ?? 0) > 0) return true;
  if (day.precipitationMm >= SIGNIFICANT_DAILY_PRECIP_MM) return true;
  if ((day.precipitationHours ?? 0) >= SIGNIFICANT_PRECIP_HOURS) return true;
  if ((day.rainMm ?? 0) >= SIGNIFICANT_RAIN_MM) return true;

  const codes = breakdown.precipitatingCodes.length > 0 ? breakdown.precipitatingCodes : breakdown.allCodes;
  const max = maxCode(codes, day.weatherCode);
  if (RAIN_CODES.has(max) && day.precipitationMm >= MEASURABLE_PRECIP_MM) return true;

  return false;
}

function hasTracePrecip(day: DailyForecastDay, breakdown: HourlyDayBreakdown): boolean {
  if (isSignificantWetDay(day, breakdown)) return false;

  const precipSum = day.precipitationMm;
  const precipHours = day.precipitationHours ?? 0;
  const precipProb = day.precipitationProbability ?? 0;

  if (precipSum >= MEASURABLE_PRECIP_MM && precipSum < SIGNIFICANT_DAILY_PRECIP_MM) return true;
  if (precipHours > 0 && precipHours < SIGNIFICANT_PRECIP_HOURS) return true;
  if (breakdown.precipitatingCodes.length > 0) return true;
  if (precipProb >= TRACE_PRECIP_PROB_MIN && precipSum < SIGNIFICANT_DAILY_PRECIP_MM) return true;

  const codes = breakdown.allCodes;
  if (codes.some((c) => DRIZZLE_CODES.has(c)) && precipSum < SIGNIFICANT_DAILY_PRECIP_MM) return true;

  return false;
}

export function classifyWet(day: DailyForecastDay, breakdown: HourlyDayBreakdown): WetBucket {
  const snow = day.snowfallCm ?? 0;
  if (snow > 0) return 'snow';

  if (!isSignificantWetDay(day, breakdown)) return 'dry';

  const rain = day.rainMm ?? 0;
  const showers = day.showersMm ?? 0;
  const codes =
    breakdown.precipitatingCodes.length > 0 ? breakdown.precipitatingCodes : breakdown.allCodes;
  const max = maxCode(codes, day.weatherCode);

  const rainHours = countCodes(codes, RAIN_CODES);
  const drizzleHours = countCodes(codes, DRIZZLE_CODES);
  const showerHours = countCodes(codes, SHOWER_CODES);

  if (showers >= MEASURABLE_PRECIP_MM && showers > rain * 0.5 && showerHours >= drizzleHours) {
    return 'showers';
  }
  if (showerHours > 0 && showerHours >= rainHours && showerHours >= drizzleHours) return 'showers';
  if (rainHours > 0 && rainHours >= drizzleHours) return 'rain';
  if (drizzleHours > 0 || DRIZZLE_CODES.has(max)) return 'drizzle';
  if (SHOWER_CODES.has(max)) return 'showers';
  if (RAIN_CODES.has(max)) return 'rain';
  return 'rain';
}

export function classifyHazard(allCodes: number[], fogDaytimeHours: number, fallbackCode: number): HazardBucket {
  const max = maxCode(allCodes, fallbackCode);
  if (THUNDER_CODES.has(max)) return 'thunder';
  if (fogDaytimeHours >= FOG_DAYTIME_HOURS_MIN) return 'fog';
  if (FOG_CODES.has(max) && fogDaytimeHours >= 1) return 'fog';
  return 'none';
}

function kindFromAxes(sky: SkyBucket, wet: WetBucket, hazard: HazardBucket): DailyDisplayKind {
  if (hazard === 'thunder') return 'hazard-thunder';
  if (wet === 'snow') return 'wet-snow';
  if (wet === 'showers') return 'wet-showers';
  if (wet === 'drizzle') return 'wet-drizzle';
  if (wet === 'rain') return 'wet-rain';
  if (hazard === 'fog') return 'hazard-fog';
  if (sky === 'clear') return 'sky-clear';
  if (sky === 'overcast') return 'sky-overcast';
  return 'sky-mixed';
}

/** Sun-behind-rain only when the day actually has meaningful sunshine */
function finalizeDisplayKind(kind: DailyDisplayKind, day: DailyForecastDay): DailyDisplayKind {
  if (kind === 'wet-showers' && sunshineRatio(day) < SUNSHINE_MEDIUM) {
    return 'wet-rain';
  }
  return kind;
}

const DISPLAY_LABELS: Record<DailyDisplayKind, string> = {
  'sky-clear': 'Clear sky',
  'sky-mixed': 'Mostly sunny',
  'sky-overcast': 'Overcast',
  'sky-trace-precip': 'Chance of light rain',
  'wet-rain': 'Rain',
  'wet-snow': 'Snow',
  'wet-showers': 'Rain showers',
  'wet-drizzle': 'Drizzle',
  'hazard-fog': 'Fog',
  'hazard-thunder': 'Thunderstorm',
};

export function classifyDailyDisplay(
  day: DailyForecastDay,
  hourly: HourlyDayBreakdown,
): DailyDisplayResult {
  const sky = classifySky(day, hourly.daytimeCodes);
  const wet = classifyWet(day, hourly);
  const hazard = classifyHazard(hourly.allCodes, hourly.fogDaytimeHours, day.weatherCode);
  let kind = finalizeDisplayKind(kindFromAxes(sky, wet, hazard), day);
  if (
    wet === 'dry' &&
    hazard === 'none' &&
    hasTracePrecip(day, hourly) &&
    sunshineRatio(day) >= SUNSHINE_MEDIUM
  ) {
    kind = 'sky-trace-precip';
  }
  return { kind, label: DISPLAY_LABELS[kind], sky, wet, hazard };
}

