import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.weatherforecast.app',
  appName: 'Weather Forecast',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
