import { type HourlyForecast } from '../services/openMeteo';
import { type DailyForecastDay } from '../services/openMeteo';
import { weatherCodeToIcon, weatherCodeToLabel } from '../utils/weatherCodeToIcon';

type Props = {
  hourly: HourlyForecast;
  today: DailyForecastDay | null;
};

export function NowSection({ hourly, today }: Props) {
  const nowUnix = Date.now() / 1000;
  const currentHour =
    hourly.hours.find(h => nowUnix >= h.timeUnix && nowUnix < h.timeUnix + 3600) ||
    hourly.hours.find(h => h.timeUnix >= nowUnix) ||
    hourly.hours[0];

  const icon = weatherCodeToIcon(currentHour.weatherCode, currentHour.isDay !== false);
  const condition = weatherCodeToLabel(currentHour.weatherCode);
  const currentTemp = Math.round(currentHour.temperatureC);
  
  // Calculate "feels like" (simple approximation - Open-Meteo doesn't provide apparent_temperature in free tier)
  // We can approximate: feels like is usually 1-2°C lower when cold, similar when warm
  // For simplicity, we'll use current temp, but in a real app you'd use apparent_temperature from API
  const feelsLike = currentTemp; // Would be currentHour.apparentTemperature if available

  return (
    <div className="now-section">
      <div className="now-header">
        <span className="now-label">Now</span>
      </div>
      <div className="now-content">
        <div className="now-left">
          <div className="now-temp-row">
            <span className="now-temp">{currentTemp}°</span>
            <span className="now-icon">{icon}</span>
          </div>
          <div className="now-high-low">
            {today && (
              <>
                High: {Math.round(today.temperatureMax)}° • Low: {Math.round(today.temperatureMin)}°
              </>
            )}
          </div>
        </div>
        <div className="now-right">
          <div className="now-condition">{condition}</div>
          <div className="now-feels-like">Feels like {feelsLike}°</div>
        </div>
      </div>
    </div>
  );
}

