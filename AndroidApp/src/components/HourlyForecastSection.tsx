import { type HourlyForecast } from '../services/openMeteo';
import { weatherCodeToIcon, weatherCodeToLabel } from '../utils/weatherCodeToIcon';
import { localDateTimeFromISOMinute } from '../utils/date';

type Props = {
  hourly: HourlyForecast;
};

export function HourlyForecastSection({ hourly }: Props) {
  const now = new Date();
  
  // Get all hours starting from now (up to 48 hours)
  const startIdx = hourly.hours.findIndex(h => localDateTimeFromISOMinute(h.time) >= now);
  const displayHours = startIdx >= 0 ? hourly.hours.slice(startIdx) : hourly.hours;

  const formatHour = (timeStr: string) => {
    const date = localDateTimeFromISOMinute(timeStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffHours === 0) return 'Now';
    if (date.getDate() === now.getDate()) {
      return date.toLocaleTimeString(undefined, { hour: 'numeric' });
    }
    return date.toLocaleTimeString(undefined, { hour: 'numeric' });
  };

  return (
    <div className="hourly-forecast-section">
      <div className="section-header">Hourly forecast</div>
      <div className="hourly-scroll">
        {displayHours.map((hour) => {
          const icon = weatherCodeToIcon(hour.weatherCode, hour.isDay !== false);
          const timeLabel = formatHour(hour.time);
          
          return (
            <div key={hour.time} className="hourly-item">
              <div className="hourly-time">{timeLabel}</div>
              <div className="hourly-icon">{icon}</div>
              <div className="hourly-temp">{Math.round(hour.temperatureC)}°</div>
              {hour.precipitationMm > 0 && (
                <div className="hourly-precip">{Math.round(hour.precipitationMm * 10) / 10} mm</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

