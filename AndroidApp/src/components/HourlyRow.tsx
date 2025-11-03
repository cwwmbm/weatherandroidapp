import { type HourlyForecastHour } from '../services/openMeteo';
import { weatherCodeToIcon, weatherCodeToLabel } from '../utils/weatherCodeToIcon';

type Props = { hour: HourlyForecastHour };

export function HourlyRow({ hour }: Props) {
  const date = new Date(hour.time);
  const timeLabel = date.toLocaleTimeString(undefined, { hour: 'numeric' });
  const icon = weatherCodeToIcon(hour.weatherCode, hour.isDay !== false);
  const label = weatherCodeToLabel(hour.weatherCode);

  return (
    <div className="hourly-row" aria-label={`Hourly forecast for ${date.toString()}`}>
      <div className="col time">{timeLabel}</div>
      <div className="col icon" title={label} aria-label={label}>{icon}</div>
      <div className="col temp">{Math.round(hour.temperatureC)}°C</div>
      <div className="col precip">{Math.round(hour.precipitationMm)} mm{hour.precipitationProbability != null ? ` • ${hour.precipitationProbability}%` : ''}</div>
    </div>
  );
}

