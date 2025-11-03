import { useEffect, useState } from 'react';
import { saveLocation, removeSavedLocation, isLocationSaved, getSavedLocations } from '../services/savedLocations';
import { geocodeSearch } from '../services/geocoding';

type Props = {
  coords: { latitude: number; longitude: number; label: string };
};

export function SaveLocationButton({ coords }: Props) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkIfSaved();
  }, [coords]);

  const checkIfSaved = async () => {
    try {
      // Find matching location by coordinates
      const locations = await getSavedLocations();
      const saved = locations.some(
        loc => Math.abs(loc.latitude - coords.latitude) < 0.01 && 
               Math.abs(loc.longitude - coords.longitude) < 0.01
      );
      setIsSaved(saved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (isSaved) {
        // Find and remove the saved location
        const locations = await getSavedLocations();
        const toRemove = locations.find(
          loc => Math.abs(loc.latitude - coords.latitude) < 0.01 && 
                 Math.abs(loc.longitude - coords.longitude) < 0.01
        );
        if (toRemove) {
          await removeSavedLocation(toRemove.id);
          setIsSaved(false);
        }
      } else {
        // Search for the location to get full GeocodeResult, then save
        try {
          // Try to find exact match by searching
          const results = await geocodeSearch(coords.label.split(',')[0], 5);
          const match = results.find(
            r => Math.abs(r.latitude - coords.latitude) < 0.01 && 
                 Math.abs(r.longitude - coords.longitude) < 0.01
          ) || results[0];
          
          if (match) {
            await saveLocation(match);
            setIsSaved(true);
          }
        } catch (error) {
          // If search fails, create a synthetic GeocodeResult
          const syntheticResult = {
            id: Date.now(),
            name: coords.label.split(',')[0],
            country: coords.label.split(',').pop()?.trim() || '',
            admin1: coords.label.split(',').length > 2 ? coords.label.split(',')[1].trim() : undefined,
            latitude: coords.latitude,
            longitude: coords.longitude
          };
          await saveLocation(syntheticResult);
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error('Error toggling saved location:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isSaved) {
    return null; // Don't show while initial check is loading
  }

  return (
    <button
      className={`save-location-btn ${isSaved ? 'saved' : ''}`}
      onClick={handleToggle}
      aria-label={isSaved ? 'Remove from saved locations' : 'Save location'}
      title={isSaved ? 'Remove from saved locations' : 'Save location'}
    >
      <span className="save-icon">{isSaved ? '★' : '☆'}</span>
    </button>
  );
}

