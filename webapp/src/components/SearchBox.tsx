import { useEffect, useMemo, useRef, useState } from 'react';
import { geocodeSearch, type GeocodeResult } from '../services/geocoding';

type Props = {
  onPick: (place: GeocodeResult) => void;
};

export function SearchBox({ onPick }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceMs = 250;
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const r = await geocodeSearch(query.trim());
        setResults(r);
        setOpen(true);
      } catch {
        setResults([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, debounceMs);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [query]);

  return (
    <div className="searchbox">
      <input
        className="search-input"
        placeholder="Search city or town…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((r) => (
            <button
              key={r.id}
              className="search-item"
              onClick={() => {
                onPick(r);
                setQuery('');
                setOpen(false);
              }}
            >
              <span className="place-name">{r.name}</span>
              <span className="place-meta">{r.admin1 ? `${r.admin1}, ` : ''}{r.country}</span>
            </button>
          ))}
        </div>
      )}
      {open && !loading && results.length === 0 && (
        <div className="search-dropdown empty">No results</div>
      )}
    </div>
  );
}


