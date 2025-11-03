import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { type HourlyForecast } from '../services/openMeteo';
import { type DailyForecastDay } from '../services/openMeteo';
import { weatherCodeToIcon, weatherCodeToLabel } from '../utils/weatherCodeToIcon';
import { localDateTimeFromISOMinute } from '../utils/date';
import { localDateFromISODate } from '../utils/date';

type Props = {
  date: string;
  hourly: HourlyForecast;
  dailyDay: DailyForecastDay | null;
  onClose: () => void;
};

export function DayHourlyModal({ date, hourly, dailyDay, onClose }: Props) {
  const listenerRef = useRef<any>(null);

  // Handle Android back button
  useEffect(() => {
    const setupListener = async () => {
      const listener = await App.addListener('backButton', () => {
        onClose();
      });
      listenerRef.current = listener;
    };
    
    setupListener();

    return () => {
      if (listenerRef.current) {
        listenerRef.current.remove();
        listenerRef.current = null;
      }
    };
  }, [onClose]);
  const selectedDate = localDateFromISODate(date);
  selectedDate.setHours(0, 0, 0, 0);
  const nextDate = new Date(selectedDate);
  nextDate.setDate(nextDate.getDate() + 1);

  // Filter hourly forecast to the selected day
  // Compare dates using string comparison to avoid timezone issues
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  
  const dayHours = hourly.hours.filter(hour => {
    // Extract date part from ISO datetime string (format: YYYY-MM-DDTHH:mm)
    const hourDateStr = hour.time.split('T')[0];
    return hourDateStr === selectedDateStr;
  });

  const formatTime = (timeStr: string) => {
    const date = localDateTimeFromISOMinute(timeStr);
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = localDateFromISODate(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    if (dateOnly.getTime() === today.getTime()) {
      return 'Today';
    }
    
    const weekday = date.toLocaleDateString(undefined, { weekday: 'long' });
    const monthDay = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${weekday}, ${monthDay}`;
  };

  return (
    <div className="day-hourly-screen">
      <div className="day-hourly-header">
        <button className="day-hourly-back-btn" onClick={onClose} aria-label="Back">
          ←
        </button>
        <div className="day-hourly-header-content">
          <div className="day-hourly-date">{formatDate(date)}</div>
          {dailyDay && (
            <div className="day-hourly-summary">
              <div className="day-hourly-summary-item">
                <span className="day-hourly-summary-label">High</span>
                <span className="day-hourly-summary-value">{Math.round(dailyDay.temperatureMax)}°</span>
              </div>
              <div className="day-hourly-summary-item">
                <span className="day-hourly-summary-label">Low</span>
                <span className="day-hourly-summary-value">{Math.round(dailyDay.temperatureMin)}°</span>
              </div>
              {dailyDay.precipitationMm > 0 && (
                <div className="day-hourly-summary-item">
                  <span className="day-hourly-summary-label">Precip</span>
                  <span className="day-hourly-summary-value">{Math.round(dailyDay.precipitationMm * 10) / 10} mm</span>
                </div>
              )}
              {dailyDay.precipitationProbability && dailyDay.precipitationProbability > 0 && (
                <div className="day-hourly-summary-item">
                  <span className="day-hourly-summary-label">Chance</span>
                  <span className="day-hourly-summary-value">{Math.round(dailyDay.precipitationProbability)}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="day-hourly-content">
        {dayHours.length > 0 ? (
          <div className="day-hourly-list">
            {dayHours.map((hour) => {
              const icon = weatherCodeToIcon(hour.weatherCode, hour.isDay !== false);
              const timeLabel = formatTime(hour.time);
              
              return (
                <div key={hour.time} className="day-hourly-item">
                  <div className="day-hourly-time">{timeLabel}</div>
                  <div className="day-hourly-icon">{icon}</div>
                  <div className="day-hourly-temp">{Math.round(hour.temperatureC)}°</div>
                  {hour.precipitationMm > 0 && (
                    <div className="day-hourly-precip">{Math.round(hour.precipitationMm * 10) / 10} mm</div>
                  )}
                  {hour.precipitationProbability && hour.precipitationProbability > 0 && (
                    <div className="day-hourly-precip-prob">{Math.round(hour.precipitationProbability)}%</div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="day-hourly-empty">No hourly data available for this day</div>
        )}
      </div>
    </div>
  );
}

