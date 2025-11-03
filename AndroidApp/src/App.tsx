import { useEffect, useMemo, useState, useRef } from 'react';
import { fetchDailyForecast, type DailyForecast, fetchHourlyForecast, type HourlyForecast } from './services/openMeteo';
import { WeatherCard } from './components/WeatherCard';
import { HourlyRow } from './components/HourlyRow';
import { NowSection } from './components/NowSection';
import { HourlyForecastSection } from './components/HourlyForecastSection';
import { DailyForecastList } from './components/DailyForecastList';
import { localDateTimeFromISOMinute } from './utils/date';
import { SearchBox } from './components/SearchBox';
import { SaveLocationButton } from './components/SaveLocationButton';
import type { GeocodeResult } from './services/geocoding';
import { getCurrentLocation } from './services/location';

function App() {
  const [forecast, setForecast] = useState<DailyForecast | null>(null);
  const [hourly, setHourly] = useState<HourlyForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Start with null coordinates - will be set after geolocation
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; label: string } | null>(null);
  const [locationRequested, setLocationRequested] = useState<boolean>(false);

  // Step 1: Get user's current location on mount
  useEffect(() => {
    if (!locationRequested) {
      setLocationRequested(true);
      setLoading(true);
      console.log('Step 1: Requesting location...');
      
      // Don't check isMounted - just set the state
      // React will handle if component unmounts
      Promise.resolve(getCurrentLocation())
        .then((location) => {
          console.log('Step 1: Location received (promise then):', location);
          console.log('Step 1: Location type:', typeof location);
          console.log('Step 1: Location keys:', location ? Object.keys(location) : 'null');
          
          if (!location || typeof location !== 'object') {
            console.error('Step 1: Invalid location object:', location);
            throw new Error('Invalid location object received');
          }
          
          console.log('Step 1: Setting coords to:', location);
          setCoords(location);
          console.log('Step 1: Coords set via setCoords');
        })
        .catch((err) => {
          // Step 3: If location fails, fall back to Vancouver
          console.log('Step 3: Location failed, using Vancouver fallback:', err);
          console.error('Step 3: Error details:', err);
          setCoords({
            latitude: 49.2827,
            longitude: -123.1207,
            label: 'Vancouver, BC, Canada'
          });
          setError('Could not detect your location. Using default location. You can search for a city.');
          setTimeout(() => {
            setError(null);
          }, 5000);
        });
    }
  }, [locationRequested]);

  // Step 2: Fetch weather ONLY after coordinates are set (either from location or fallback)
  useEffect(() => {
    // Don't fetch weather until we have coordinates
    if (!coords) {
      return;
    }
    
    let isMounted = true;
    setLoading(true);
    console.log('Step 2: Fetching weather for:', coords.latitude, coords.longitude, coords.label);
    
    Promise.all([
      fetchDailyForecast({ latitude: coords.latitude, longitude: coords.longitude, days: 14 }),
      fetchHourlyForecast({ latitude: coords.latitude, longitude: coords.longitude, hours: 48 })
    ])
      .then(([dailyData, hourlyData]) => {
        if (!isMounted) return;
        console.log('Step 2: Weather data received for coordinates:', coords.latitude, coords.longitude);
        setForecast(dailyData);
        setHourly(hourlyData);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        console.error('Weather fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load forecast');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [coords]);

  const title = useMemo(() => 'Weather Forecast', []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>{title}</h1>
        <p className="subtitle">Weather in 
          <strong> {coords?.label || 'Loading location...'}</strong>
        </p>
        <div className="search-container">
          <SearchBox 
            onPick={(place: GeocodeResult) => {
              const label = `${place.name}${place.admin1 ? ', ' + place.admin1 : ''}, ${place.country}`;
              setCoords({ latitude: place.latitude, longitude: place.longitude, label });
            }}
            currentLocation={coords}
            onSelectCurrentLocation={async () => {
              try {
                const location = await getCurrentLocation();
                setCoords(location);
              } catch (error) {
                console.error('Error getting current location:', error);
                setError('Could not detect your location. Please try again.');
                setTimeout(() => setError(null), 5000);
              }
            }}
          />
          {coords && (
            <SaveLocationButton coords={coords} />
          )}
        </div>
      </header>
      <main>
        {loading && <div className="status">Loading…</div>}
        {error && <div className="status error">{error}</div>}
        {forecast && hourly && (
          <>
            <NowSection hourly={hourly} today={forecast.days[0] || null} />
            <HourlyForecastSection hourly={hourly} />
            <DailyForecastList forecast={forecast} />
          </>
        )}
      </main>
      <footer className="app-footer">
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Data by Open‑Meteo</a>
      </footer>
    </div>
  );
}

export default App;

