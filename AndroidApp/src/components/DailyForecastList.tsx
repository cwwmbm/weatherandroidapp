import { type DailyForecast } from '../services/openMeteo';
import { weatherCodeToIcon, weatherCodeToLabel } from '../utils/weatherCodeToIcon';
import { localDateFromISODate } from '../utils/date';

type Props = {
  forecast: DailyForecast;
};

export function DailyForecastList({ forecast }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (dateStr: string, index: number) => {
    const date = localDateFromISODate(dateStr);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    const todayOnly = new Date(today);
    todayOnly.setHours(0, 0, 0, 0);
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    }
    
    const weekday = date.toLocaleDateString(undefined, { weekday: 'long' });
    const monthDay = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${weekday}, ${monthDay}`;
  };

  return (
    <div className="daily-forecast-section">
      <div className="section-header">10-day forecast</div>
      <div className="daily-list">
        {forecast.days.map((day, index) => {
          const icon = weatherCodeToIcon(day.weatherCode, true);
          const condition = weatherCodeToLabel(day.weatherCode);
          const dateLabel = formatDate(day.date, index);
          
          return (
            <div key={day.date} className="daily-item">
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

