import { type HourlyForecast } from '../services/openMeteo';
import { weatherCodeToIcon, weatherCodeToLabel } from '../utils/weatherCodeToIcon';
import { formatTimeInTimeZone } from '../utils/date';

type Props = {
  hourly: HourlyForecast;
};

export function HourlyForecastSection({ hourly }: Props) {
  const nowUnix = Date.now() / 1000;
  const startIdx = hourly.hours.findIndex(h => h.timeUnix + 3600 > nowUnix);
  const displayHours = startIdx >= 0 ? hourly.hours.slice(startIdx) : hourly.hours;

  const formatHour = (hourUnix: number) => {
    if (nowUnix >= hourUnix && nowUnix < hourUnix + 3600) return 'Now';
    return formatTimeInTimeZone(hourUnix, hourly.timezone, { hour: 'numeric' });
  };

  return (
    <div className="hourly-forecast-section">
      <div className="section-header">Hourly forecast</div>
      <div className="hourly-scroll">
        {displayHours.map((hour) => {
          const icon = weatherCodeToIcon(hour.weatherCode, hour.isDay !== false);
          const timeLabel = formatHour(hour.timeUnix);
          
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

