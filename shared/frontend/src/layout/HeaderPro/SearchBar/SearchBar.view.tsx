import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchData } from '../../../hooks/stock/useSearchData';

// Search Icon
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const SearchBarPro = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxIdRef = useRef<string>(`search-listbox-${Math.random().toString(36).slice(2)}`);
  const navigate = useNavigate();

  // Debounce the query before fetching results
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data: searchResults, isLoading } = useSearchData(debouncedQuery);

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/stock/${query.trim().toUpperCase()}`);
      setQuery('');
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  // Handle result selection
  const handleResultClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative" role="search" aria-label="Search ticker">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(query.length > 0)}
          onKeyDown={(e) => {
            if (!searchResults || !isOpen) return;
            const max = Math.min(searchResults.length, 8) - 1;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveIndex((prev) => (prev < max ? prev + 1 : 0));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiveIndex((prev) => (prev > 0 ? prev - 1 : max));
            } else if (e.key === 'Enter' && activeIndex >= 0) {
              e.preventDefault();
              const item = searchResults[activeIndex];
              if (item) handleResultClick(item.symbol);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
              setActiveIndex(-1);
            }
          }}
          placeholder="Search ticker..."
          className="w-full max-w-sm h-9 rounded-md pl-9 pr-3 text-sm 
                     bg-white dark:bg-neutral-800 
                     border border-neutral-300 dark:border-neutral-700
                     text-neutral-900 dark:text-neutral-100
                     placeholder-neutral-500 dark:placeholder-neutral-400
                     focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                     transition-all duration-200"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxIdRef.current}
          aria-activedescendant={activeIndex >= 0 ? `${listboxIdRef.current}-option-${activeIndex}` : undefined}
        />
        {/* Leading search icon inside the field */}
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" aria-hidden="true">
          <SearchIcon />
        </div>
        {/* Submit gomb eltávolítva – Enter aktiválja a keresést, így nem dupláz az ikon */}
      </form>

      {/* Search Results Dropdown */}
      {isOpen && searchResults && searchResults.length > 0 && (
        <div
          id={listboxIdRef.current}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 
                         bg-white dark:bg-neutral-800 
                         border border-neutral-200 dark:border-neutral-700
                         rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
        >
          {searchResults.slice(0, 8).map((result, idx) => (
            <button
              key={result.symbol}
              id={`${listboxIdRef.current}-option-${idx}`}
              role="option"
              aria-selected={activeIndex === idx}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => handleResultClick(result.symbol)}
              className={`w-full px-4 py-3 text-left border-b border-neutral-100 dark:border-neutral-600 last:border-b-0 transition-colors duration-150 ${activeIndex === idx ? 'bg-neutral-100 dark:bg-neutral-700' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {result.symbol}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                    {result.name}
                  </div>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-500">Stock</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isOpen && isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 
                        bg-white dark:bg-neutral-800 
                        border border-neutral-200 dark:border-neutral-700
                        rounded-lg shadow-lg z-10 p-4">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" />
            Searching...
          </div>
        </div>
      )}

      {/* Live region for assistive tech */}
      <div className="sr-only" aria-live="polite">
        {isLoading
          ? 'Searching'
          : isOpen && searchResults
          ? `${Math.min(searchResults.length, 8)} results`
          : ''}
      </div>
    </div>
  );
}; 