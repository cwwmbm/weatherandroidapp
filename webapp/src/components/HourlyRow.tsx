import { type HourlyForecastHour } from '../services/openMeteo';
import { weatherCodeToIcon, weatherCodeToLabel } from '../utils/weatherCodeToIcon';
import { formatTimeInTimeZone } from '../utils/date';

type Props = { hour: HourlyForecastHour; timeZone: string };

export function HourlyRow({ hour, timeZone }: Props) {
  const timeLabel = formatTimeInTimeZone(hour.timeUnix, timeZone, { hour: 'numeric' });
  const icon = weatherCodeToIcon(hour.weatherCode, hour.isDay !== false);
  const label = weatherCodeToLabel(hour.weatherCode);

  return (
    <div className="hourly-row" aria-label={`Hourly forecast for ${timeLabel}`}>
      <div className="col time">{timeLabel}</div>
      <div className="col icon" title={label} aria-label={label}>{icon}</div>
      <div className="col temp">{Math.round(hour.temperatureC)}°C</div>
      <div className="col precip">{Math.round(hour.precipitationMm)} mm{hour.precipitationProbability != null ? ` • ${hour.precipitationProbability}%` : ''}</div>
    </div>
  );
}
