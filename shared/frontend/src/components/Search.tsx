import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchData } from '@/hooks/stock/useSearchData';

interface SearchProps {
  onResultSelect?: (result: { symbol: string; name: string }) => void;
  placeholder?: string;
  className?: string;
}

interface SearchResult {
  symbol: string;
  name: string;
  // add more if needed
}

const Search: React.FC<SearchProps> = ({ 
  onResultSelect, 
  placeholder = "Search stocks...", 
  className = "" 
}) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { data: results, isLoading, error } = useSearchData(query);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(value.length > 0);
  };

  const handleResultClick = (result: { symbol: string; name: string }) => {
    onResultSelect?.(result);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-content-secondary" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 0 && setShowResults(true)}
          className="w-full px-4 py-2 pl-10 bg-surface-default text-content-primary border border-border-default rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      {showResults && query.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-surface-default border border-border-default rounded-md shadow-lg">
          {isLoading && (
            <div className="p-4 text-content-secondary">Searching...</div>
          )}
          
          {error && (
            <div className="p-4 text-danger-default">Error: {error}</div>
          )}
          
          {results && results.length > 0 && (
            <div className="max-h-60 overflow-y-auto">
              {results.map((result: SearchResult, index: number) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-4 py-2 hover:bg-surface-hover focus:bg-surface-hover focus:outline-none"
                >
                  <div className="font-medium text-content-primary">{result.symbol}</div>
                  <div className="text-sm text-content-secondary">{result.name}</div>
                </button>
              ))}
            </div>
          )}
          
          {results && results.length === 0 && !isLoading && (
            <div className="p-4 text-content-secondary">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search; 