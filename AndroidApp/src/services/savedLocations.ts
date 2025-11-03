import { Preferences } from '@capacitor/preferences';
import type { GeocodeResult } from './geocoding';

export type SavedLocation = GeocodeResult & {
  label: string;
  savedAt: number; // timestamp
};

const SAVED_LOCATIONS_KEY = 'savedLocations';

/**
 * Get all saved locations from device storage
 */
export async function getSavedLocations(): Promise<SavedLocation[]> {
  try {
    const { value } = await Preferences.get({ key: SAVED_LOCATIONS_KEY });
    if (!value) {
      return [];
    }
    return JSON.parse(value) as SavedLocation[];
  } catch (error) {
    console.error('Error loading saved locations:', error);
    return [];
  }
}

/**
 * Save a location to device storage
 */
export async function saveLocation(place: GeocodeResult): Promise<void> {
  try {
    const locations = await getSavedLocations();
    
    // Check if location already exists
    const exists = locations.some(loc => loc.id === place.id);
    if (exists) {
      return; // Already saved
    }
    
    // Create saved location with label
    const label = `${place.name}${place.admin1 ? ', ' + place.admin1 : ''}, ${place.country}`;
    const savedLocation: SavedLocation = {
      ...place,
      label,
      savedAt: Date.now()
    };
    
    locations.unshift(savedLocation); // Add to beginning
    await Preferences.set({ 
      key: SAVED_LOCATIONS_KEY, 
      value: JSON.stringify(locations) 
    });
  } catch (error) {
    console.error('Error saving location:', error);
    throw error;
  }
}

/**
 * Remove a location from saved locations
 */
export async function removeSavedLocation(locationId: number): Promise<void> {
  try {
    const locations = await getSavedLocations();
    const filtered = locations.filter(loc => loc.id !== locationId);
    await Preferences.set({ 
      key: SAVED_LOCATIONS_KEY, 
      value: JSON.stringify(filtered) 
    });
  } catch (error) {
    console.error('Error removing location:', error);
    throw error;
  }
}

/**
 * Check if a location is already saved
 */
export async function isLocationSaved(locationId: number): Promise<boolean> {
  const locations = await getSavedLocations();
  return locations.some(loc => loc.id === locationId);
}

