import { useEffect, useRef, useState } from 'react';
import { geocodeSearch, type GeocodeResult } from '../services/geocoding';
import { getSavedLocations, type SavedLocation } from '../services/savedLocations';
import { getCurrentLocation } from '../services/location';

type Props = {
  onPick: (place: GeocodeResult) => void;
  currentLocation: { latitude: number; longitude: number; label: string } | null;
  onSelectCurrentLocation?: () => void;
};

export function SearchBox({ onPick, currentLocation, onSelectCurrentLocation }: Props) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceMs = 250;
  const timeoutRef = useRef<number | null>(null);

  // Load saved locations on mount
  useEffect(() => {
    loadSavedLocations();
  }, []);

  const loadSavedLocations = async () => {
    try {
      const saved = await getSavedLocations();
      setSavedLocations(saved);
    } catch (error) {
      console.error('Error loading saved locations:', error);
    }
  };

  // Show saved locations when focused and no query, show search results when typing
  useEffect(() => {
    if (!query.trim() && isFocused) {
      // Show saved locations when focused and empty
      loadSavedLocations();
      setOpen(true);
      return;
    }

    if (!query.trim()) {
      setSearchResults([]);
      setOpen(false);
      return;
    }

    // Search for cities when typing
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const r = await geocodeSearch(query.trim());
        setSearchResults(r);
        setOpen(true);
      } catch {
        setSearchResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, debounceMs);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [query, isFocused]);

  const handleCurrentLocation = async () => {
    if (onSelectCurrentLocation) {
      onSelectCurrentLocation();
    } else {
      try {
        const location = await getCurrentLocation();
        const syntheticResult: GeocodeResult = {
          id: Date.now(),
          name: location.label.split(',')[0],
          country: location.label.split(',').pop()?.trim() || '',
          admin1: location.label.split(',').length > 2 ? location.label.split(',')[1].trim() : undefined,
          latitude: location.latitude,
          longitude: location.longitude
        };
        onPick(syntheticResult);
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    }
    setQuery('');
    setOpen(false);
    setIsFocused(false);
  };

  const handleSelectSaved = (location: SavedLocation) => {
    onPick(location);
    setQuery('');
    setOpen(false);
    setIsFocused(false);
  };

  const handleSelectSearch = (place: GeocodeResult) => {
    onPick(place);
    setQuery('');
    setOpen(false);
    setIsFocused(false);
  };

  const showSavedLocations = isFocused && !query.trim() && savedLocations.length > 0;
  const showSearchResults = query.trim() && searchResults.length > 0;
  const showCurrentLocation = isFocused && !query.trim();

  return (
    <div className="searchbox">
      <input
        className="search-input"
        placeholder="Search city or town…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          if (!query.trim()) {
            loadSavedLocations();
            setOpen(true);
          }
        }}
        onBlur={() => {
          // Delay to allow clicks on dropdown items
          setTimeout(() => {
            setIsFocused(false);
            setOpen(false);
          }, 200);
        }}
      />
      {open && (
        <div className="search-dropdown">
          {showCurrentLocation && (
            <button
              className="search-item current-location-item"
              onClick={handleCurrentLocation}
            >
              <span className="place-name">📍 Current</span>
              <span className="place-meta">
                {currentLocation ? (() => {
                  // Extract just city and country
                  const parts = currentLocation.label.split(',');
                  if (parts.length >= 2) {
                    return `${parts[0].trim()}, ${parts[parts.length - 1].trim()}`;
                  }
                  return currentLocation.label;
                })() : 'Detect your location'}
              </span>
            </button>
          )}
          {showCurrentLocation && showSavedLocations && (
            <div className="search-dropdown-divider"></div>
          )}
          {showSavedLocations && savedLocations.map((location) => (
            <button
              key={location.id}
              className="search-item saved-location-item"
              onClick={() => handleSelectSaved(location)}
            >
              <span className="place-name">{location.name}</span>
              <span className="place-meta">{location.country}</span>
            </button>
          ))}
          {showSearchResults && searchResults.map((r) => (
            <button
              key={r.id}
              className="search-item"
              onClick={() => handleSelectSearch(r)}
            >
              <span className="place-name">{r.name}</span>
              <span className="place-meta">{r.country}</span>
            </button>
          ))}
          {open && !loading && !showSavedLocations && searchResults.length === 0 && query.trim() && (
            <div className="search-dropdown empty">No results</div>
          )}
        </div>
      )}
    </div>
  );
}


