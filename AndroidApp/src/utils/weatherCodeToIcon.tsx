import React from 'react';
import { NightPartlyCloudyIcon } from '../components/icons/NightPartlyCloudy';

// Mapping based on WMO weather interpretation codes
// https://open-meteo.com/en/docs#api_form

export function weatherCodeToLabel(code: number): string {
  // Simplified grouping for readability
  if (code === 0) return 'Clear sky';
  if (code === 1 || code === 2) return 'Mostly sunny';
  if (code === 3) return 'Overcast';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55].includes(code)) return 'Drizzle';
  if ([56, 57].includes(code)) return 'Freezing drizzle';
  if ([61, 63, 65].includes(code)) return 'Rain';
  if ([66, 67].includes(code)) return 'Freezing rain';
  if ([71, 73, 75].includes(code)) return 'Snow';
  if (code === 77) return 'Snow grains';
  if ([80, 81, 82].includes(code)) return 'Rain showers';
  if ([85, 86].includes(code)) return 'Snow showers';
  if ([95].includes(code)) return 'Thunderstorm';
  if ([96, 99].includes(code)) return 'Thunderstorm with hail';
  return 'Unknown';
}

export function weatherCodeToIcon(code: number, isDay: boolean = true): React.ReactNode {
  // Use emoji for simplicity and no assets; switch clear/partly cloudy icons by day/night
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code === 1 || code === 2) return isDay ? '🌤️' : <NightPartlyCloudyIcon />;
  if (code === 3) return '☁️';
  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55].includes(code)) return isDay ? '🌦️' : '🌧️';
  if ([56, 57].includes(code)) return isDay ? '🧊🌦️' : '🧊🌧️';
  if ([61, 63, 65].includes(code)) return '🌧️';
  if ([66, 67].includes(code)) return '🧊🌧️';
  if ([71, 73, 75].includes(code)) return '🌨️';
  if (code === 77) return '🌨️';
  if ([80, 81, 82].includes(code)) return isDay ? '🌦️' : '🌧️';
  if ([85, 86].includes(code)) return '🌨️';
  if ([95].includes(code)) return '⛈️';
  if ([96, 99].includes(code)) return '⛈️';
  return '❓';
}


