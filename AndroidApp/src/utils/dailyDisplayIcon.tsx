import React from 'react';
import { TracePrecipIcon } from '../components/icons/TracePrecipIcon';
import { type DailyDisplayKind } from './dailyWeatherDisplay';

export function dailyDisplayToIcon(kind: DailyDisplayKind): React.ReactNode {
  switch (kind) {
    case 'sky-clear':
      return '☀️';
    case 'sky-mixed':
      return '🌤️';
    case 'sky-overcast':
      return '☁️';
    case 'sky-trace-precip':
      return <TracePrecipIcon size={28} />;
    case 'wet-rain':
    case 'wet-drizzle':
      return '🌧️';
    case 'wet-snow':
      return '🌨️';
    case 'wet-showers':
      return '🌦️';
    case 'hazard-fog':
      return '🌫️';
    case 'hazard-thunder':
      return '⛈️';
    default:
      return '❓';
  }
}
