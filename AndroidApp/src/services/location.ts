import { Geolocation } from '@capacitor/geolocation';
import { geocodeSearch } from './geocoding';

export type LocationCoords = {
  latitude: number;
  longitude: number;
  label: string;
};

/**
 * Get the user's current location using Capacitor Geolocation (with browser fallback)
 */
export async function getCurrentLocation(): Promise<LocationCoords> {
  try {
    // Check permissions first (for Capacitor)
    const permissionStatus = await Geolocation.checkPermissions();
    
    if (permissionStatus.location === 'prompt' || permissionStatus.location === 'denied') {
      // Request permission
      const requestStatus = await Geolocation.requestPermissions();
      if (requestStatus.location !== 'granted') {
        throw new Error('Location permission denied');
      }
    }
    
    // Try Capacitor Geolocation first (works on native)
    const position = await Geolocation.getCurrentPosition({ 
      enableHighAccuracy: true,
      timeout: 10000 // 10 second timeout
    });
    
    const { latitude, longitude } = position.coords;
    console.log('Got location from Capacitor:', latitude, longitude);
    
    // Try to get a nice label via reverse geocoding (with timeout to prevent hanging)
    let label: string;
    try {
      label = await Promise.race([
        getLocationLabel(latitude, longitude),
        new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('Reverse geocoding timeout')), 5000)
        )
      ]);
    } catch (labelError) {
      console.warn('Reverse geocoding failed, using coordinates:', labelError);
      // Use coordinates as fallback label
      label = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    }
    
    console.log('Location with label:', { latitude, longitude, label });
    const result = { latitude, longitude, label };
    console.log('About to return location result:', JSON.stringify(result));
    
    // Ensure we return a resolved promise explicitly
    return Promise.resolve(result).then((res) => {
      console.log('Promise resolved in location service:', res);
      return res;
    });
  } catch (error) {
    console.error('Capacitor Geolocation error:', error);
    
    // Fallback to browser Geolocation API for web
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              console.log('Got location from browser:', latitude, longitude);
              
              // Try to get a nice label via reverse geocoding (with timeout)
              let label: string;
              try {
                label = await Promise.race([
                  getLocationLabel(latitude, longitude),
                  new Promise<string>((_, reject) => 
                    setTimeout(() => reject(new Error('Reverse geocoding timeout')), 5000)
                  )
                ]);
              } catch (labelError) {
                console.warn('Reverse geocoding failed, using coordinates:', labelError);
                label = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
              }
              
              console.log('Location with label:', { latitude, longitude, label });
              resolve({ latitude, longitude, label });
            } catch (err) {
              console.error('Browser geolocation error:', err);
              reject(err);
            }
          },
          (err) => {
            console.error('Browser geolocation permission/error:', err);
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }
    throw error;
  }
}

/**
 * Get a human-readable label for coordinates using reverse geocoding
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * Falls back to a coordinate-based label if geocoding fails
 */
async function getLocationLabel(latitude: number, longitude: number): Promise<string> {
  try {
    console.log('Attempting reverse geocoding for:', latitude, longitude);
    // Use OpenStreetMap Nominatim for reverse geocoding (free, no key required)
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', latitude.toString());
    url.searchParams.set('lon', longitude.toString());
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'WeatherApp/1.0' // Required by Nominatim
      }
    });
    
    console.log('Reverse geocoding response status:', res.status);
    
    if (res.ok) {
      const data = await res.json();
      console.log('Reverse geocoding data:', data);
      const address = data.address;
      
      if (address) {
        // Build a nice label from address components
        const parts: string[] = [];
        
        // Prefer city/town/village
        if (address.city) parts.push(address.city);
        else if (address.town) parts.push(address.town);
        else if (address.village) parts.push(address.village);
        else if (address.suburb) parts.push(address.suburb);
        else if (address.municipality) parts.push(address.municipality);
        
        // Add state/province
        if (address.state || address.province) {
          parts.push(address.state || address.province);
        }
        
        // Add country
        if (address.country) {
          parts.push(address.country);
        }
        
        if (parts.length > 0) {
          const label = parts.join(', ');
          console.log('Reverse geocoding success, label:', label);
          return label;
        }
      }
    }
    
    console.warn('Reverse geocoding returned no address');
    // Fallback: Return coordinates
    return `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    // If reverse geocoding fails, return a user-friendly label with coordinates
    return `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
  }
}

/**
 * Get location label for given coordinates (for reverse geocoding)
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  return getLocationLabel(latitude, longitude);
}

