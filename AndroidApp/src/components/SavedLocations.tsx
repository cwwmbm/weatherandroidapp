import { useEffect, useState } from 'react';
import { getSavedLocations, removeSavedLocation, type SavedLocation } from '../services/savedLocations';
import type { GeocodeResult } from '../services/geocoding';

type Props = {
  onSelect: (place: GeocodeResult) => void;
  currentLocation: { latitude: number; longitude: number; label: string } | null;
};

export function SavedLocations({ onSelect, currentLocation }: Props) {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedLocations();
  }, []);

  const loadSavedLocations = async () => {
    setLoading(true);
    try {
      const saved = await getSavedLocations();
      setLocations(saved);
    } catch (error) {
      console.error('Error loading saved locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (locationId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent selection when clicking remove
    try {
      await removeSavedLocation(locationId);
      await loadSavedLocations();
    } catch (error) {
      console.error('Error removing location:', error);
    }
  };

  const handleSelect = (location: SavedLocation) => {
    onSelect(location);
  };

  const isCurrentLocation = (location: SavedLocation) => {
    if (!currentLocation) return false;
    // Check if coordinates match (with small tolerance)
    const latDiff = Math.abs(location.latitude - currentLocation.latitude);
    const lonDiff = Math.abs(location.longitude - currentLocation.longitude);
    return latDiff < 0.01 && lonDiff < 0.01;
  };

  if (loading) {
    return <div className="status">Loading saved locations…</div>;
  }

  if (locations.length === 0) {
    return (
      <div className="status">
        No saved locations yet. Search for a city and add it to your saved locations.
      </div>
    );
  }

  return (
    <div className="saved-locations-list">
      {locations.map((location) => {
        const isCurrent = isCurrentLocation(location);
        return (
          <div
            key={location.id}
            className={`saved-location-item ${isCurrent ? 'current' : ''}`}
            onClick={() => handleSelect(location)}
          >
            <div className="saved-location-content">
              <div className="saved-location-name">{location.name}</div>
              <div className="saved-location-meta">
                {location.admin1 ? `${location.admin1}, ` : ''}{location.country}
              </div>
              {isCurrent && (
                <div className="saved-location-badge">Current</div>
              )}
            </div>
            <button
              className="saved-location-remove"
              onClick={(e) => handleRemove(location.id, e)}
              aria-label="Remove location"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

