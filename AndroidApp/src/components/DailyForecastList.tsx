import { type DailyForecast, type HourlyForecast } from '../services/openMeteo';
import { classifyDailyDisplay } from '../utils/dailyWeatherDisplay';
import { dailyDisplayToIcon } from '../utils/dailyDisplayIcon';
import { getHourlyBreakdownForDate } from '../utils/hourlyByDate';
import { localDateFromISODate, nowISODateInTimeZone } from '../utils/date';

type Props = {
  forecast: DailyForecast;
  hourly: HourlyForecast;
  onDayClick?: (date: string) => void;
};

export function DailyForecastList({ forecast, hourly, onDayClick }: Props) {
  const todayStr = nowISODateInTimeZone(forecast.timezone);

  const formatDate = (dateStr: string, index: number) => {
    if (dateStr === todayStr) {
      return 'Today';
    }
    const date = localDateFromISODate(dateStr);
    
    const weekday = date.toLocaleDateString(undefined, { weekday: 'long' });
    const monthDay = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${weekday}, ${monthDay}`;
  };

  return (
    <div className="daily-forecast-section">
      <div className="section-header">10-day forecast</div>
      <div className="daily-list">
        {forecast.days.map((day, index) => {
          const display = classifyDailyDisplay(day, getHourlyBreakdownForDate(hourly, day.date));
          const icon = dailyDisplayToIcon(display.kind);
          const condition = display.label;
          const dateLabel = formatDate(day.date, index);
          
          return (
            <div 
              key={day.date} 
              className="daily-item clickable"
              onClick={() => onDayClick?.(day.date)}
            >
              <div className="daily-date">{dateLabel}</div>
              <div className="daily-icon" title={condition} aria-label={condition}>{icon}</div>
              <div className="daily-precip">
                {typeof day.precipitationProbability === 'number' && day.precipitationProbability > 0 && (
                  <span className="daily-precip-prob">{Math.round(day.precipitationProbability)}%</span>
                )}
                {day.precipitationMm > 0 && (
                  <span className="daily-precip-mm">{Math.round(day.precipitationMm * 10) / 10} mm</span>
                )}
                {(!day.precipitationProbability || day.precipitationProbability === 0) && day.precipitationMm === 0 && (
                  <span className="daily-precip-none">—</span>
                )}
              </div>
              <div className="daily-temps">
                <span className="daily-high">{Math.round(day.temperatureMax)}°</span>
                <span className="daily-low">{Math.round(day.temperatureMin)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

