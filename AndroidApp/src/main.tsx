import React from 'react';
import { createRoot } from 'react-dom/client';
import { StatusBar, Style } from '@capacitor/status-bar';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

// Configure status bar for dark theme
const initStatusBar = async () => {
  try {
    const capacitor = (window as any).Capacitor;
    if (capacitor && capacitor.isNativePlatform()) {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0b1020' });
    }
  } catch (error) {
    // Status bar plugin may not be available in web mode
    console.log('Status bar configuration skipped:', error);
  }
};

initStatusBar();

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

