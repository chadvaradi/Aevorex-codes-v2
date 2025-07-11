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
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const { data: searchResults, isLoading } = useSearchData(query);

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/stock/${query.trim().toUpperCase()}`);
      setQuery('');
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle result selection
  const handleResultClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onFocus={() => setIsOpen(query.length > 0)}
          placeholder="Search ticker..."
          className="w-full max-w-xs rounded-full px-4 py-2 pr-10 text-sm 
                     bg-neutral-50 dark:bg-neutral-800 
                     border border-neutral-300 dark:border-neutral-600
                     text-neutral-900 dark:text-neutral-100
                     placeholder-neutral-500 dark:placeholder-neutral-400
                     focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                     transition-all duration-200"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 
                     text-neutral-400 hover:text-primary-600 
                     transition-colors duration-200"
          aria-label="Search"
        >
          <SearchIcon />
        </button>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && searchResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 
                        bg-white dark:bg-neutral-800 
                        border border-neutral-200 dark:border-neutral-700
                        rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          {searchResults.slice(0, 8).map((result) => (
            <button
              key={result.symbol}
              onClick={() => handleResultClick(result.symbol)}
              className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 
                         border-b border-neutral-100 dark:border-neutral-600 last:border-b-0
                         transition-colors duration-150"
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
                                 <div className="text-xs text-neutral-500 dark:text-neutral-500">
                   Stock
                 </div>
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
    </div>
  );
}; 