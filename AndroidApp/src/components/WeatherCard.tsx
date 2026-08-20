import { type DailyForecastDay, type HourlyForecast } from '../services/openMeteo';
import { classifyDailyDisplay } from '../utils/dailyWeatherDisplay';
import { dailyDisplayToIcon } from '../utils/dailyDisplayIcon';
import { getHourlyBreakdownForDate } from '../utils/hourlyByDate';
import { localDateFromISODate } from '../utils/date';

type Props = {
  day: DailyForecastDay;
  hourly: HourlyForecast;
};

export function WeatherCard({ day, hourly }: Props) {
  const display = classifyDailyDisplay(day, getHourlyBreakdownForDate(hourly, day.date));
  const icon = dailyDisplayToIcon(display.kind);
  const label = display.label;
  const date = localDateFromISODate(day.date);
  const weekday = date.toLocaleDateString(undefined, { weekday: 'short' });
  const monthDay = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <article className="weather-card" aria-label={`Forecast for ${date.toDateString()}`}>
      <div className="date">
        <div className="weekday">{weekday}</div>
        <div className="monthday">{monthDay}</div>
      </div>
      <div className="icon" title={label} aria-label={label}>{icon}</div>
      <div className="metrics">
        <div className="metric">
          <span className="metric-label">High</span>
          <span className="metric-value">{Math.round(day.temperatureMax)}°C</span>
        </div>
        <div className="metric">
          <span className="metric-label">Low</span>
          <span className="metric-value">{Math.round(day.temperatureMin)}°C</span>
        </div>
      </div>
      <div className="precip-right">
        {typeof day.precipitationProbability === 'number' && (
          <span className="metric-label">{Math.round(day.precipitationProbability)}%</span>
        )}
        <span className="metric-value">{Math.round(day.precipitationMm)} mm</span>
      </div>
    </article>
  );
}

