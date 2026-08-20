// Script to fetch historical weather data for Vancouver, BC
// Specifically for precipitation amounts over the past 5 days

// Squamish, BC coordinates
const VANCOUVER_LAT = 49.7016;
const VANCOUVER_LON = -123.1558;

interface HistoricalWeatherDay {
  date: string;
  precipitationMm: number;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
}

interface HistoricalWeatherData {
  timezone: string;
  days: HistoricalWeatherDay[];
}

async function fetchHistoricalWeather(
  latitude: number,
  longitude: number,
  days: number = 5
): Promise<HistoricalWeatherData> {
  // Calculate date range (past N days, including today)
  // So for 5 days: today + 4 days back
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1)); // days - 1 because we include today

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // Open-Meteo Historical Weather API
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('start_date', startDateStr);
  url.searchParams.set('end_date', endDateStr);
  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum');
  url.searchParams.set('timezone', 'America/Vancouver');
  url.searchParams.set('temperature_unit', 'celsius');

  console.log(`Fetching historical weather from ${startDateStr} to ${endDateStr}...`);
  console.log(`URL: ${url.toString()}\n`);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Open-Meteo error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  const timezone: string = json.timezone;
  const time: string[] = json.daily?.time ?? [];
  const weathercode: number[] = json.daily?.weathercode ?? [];
  const temperatureMax: number[] = json.daily?.temperature_2m_max ?? [];
  const temperatureMin: number[] = json.daily?.temperature_2m_min ?? [];
  const precipitationSum: number[] = json.daily?.precipitation_sum ?? [];

  const length = Math.min(
    time.length,
    weathercode.length,
    temperatureMax.length,
    temperatureMin.length,
    precipitationSum.length
  );

  const daysParsed: HistoricalWeatherDay[] = [];
  for (let i = 0; i < length; i++) {
    daysParsed.push({
      date: time[i],
      weatherCode: weathercode[i],
      temperatureMax: temperatureMax[i],
      temperatureMin: temperatureMin[i],
      precipitationMm: precipitationSum[i],
    });
  }

  return { timezone, days: daysParsed };
}

// Main execution
async function main() {
  try {
    console.log('='.repeat(60));
    console.log('Historical Weather Data for Squamish, BC');
    console.log('Past 5 Days - Precipitation Report');
    console.log('='.repeat(60));
    console.log();

    const data = await fetchHistoricalWeather(VANCOUVER_LAT, VANCOUVER_LON, 5);

    console.log(`Timezone: ${data.timezone}`);
    console.log(`Data retrieved for ${data.days.length} day(s)\n`);

    let totalPrecipitation = 0;

    console.log('Date'.padEnd(12) + 'Precipitation (mm)'.padEnd(20) + 'Max Temp (°C)'.padEnd(15) + 'Min Temp (°C)');
    console.log('-'.repeat(60));

    data.days.forEach((day) => {
      const date = new Date(day.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      totalPrecipitation += day.precipitationMm;
      console.log(
        date.padEnd(12) +
        day.precipitationMm.toFixed(2).padEnd(20) +
        day.temperatureMax.toFixed(1).padEnd(15) +
        day.temperatureMin.toFixed(1)
      );
    });

    console.log('-'.repeat(60));
    console.log(
      'Total:'.padEnd(12) +
        totalPrecipitation.toFixed(2) +
        ' mm'.padEnd(20) +
        `(Average: ${(totalPrecipitation / data.days.length).toFixed(2)} mm/day)`
    );
    console.log();

    // Summary
    const daysWithPrecipitation = data.days.filter((d) => d.precipitationMm > 0).length;
    console.log(`Days with precipitation: ${daysWithPrecipitation} out of ${data.days.length}`);
    const maxPrecipitationDay = data.days.reduce((max, day) =>
      day.precipitationMm > max.precipitationMm ? day : max
    );
    console.log(
      `Highest precipitation day: ${new Date(maxPrecipitationDay.date).toLocaleDateString()} with ${maxPrecipitationDay.precipitationMm.toFixed(2)} mm`
    );
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    process.exit(1);
  }
}

main();

