import React from 'react';

interface TickerDropdownProps {
  show: boolean;
  recentTickers: string[];
  onTickerSelect: (ticker: string) => void;
}

export const TickerDropdown: React.FC<TickerDropdownProps> = ({
  show,
  recentTickers,
  onTickerSelect,
}) => {
  if (!show) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-surface-default rounded-lg shadow-lg border border-border-default z-60">
      <div className="p-2">
        <div className="text-xs text-content-secondary mb-2">Recent Instruments</div>
        {recentTickers.map((ticker) => (
          <button
            key={ticker}
            onClick={() => onTickerSelect(ticker)}
            className="block w-full text-left px-3 py-2 text-sm hover:bg-surface-hover rounded"
          >
            {ticker}
          </button>
        ))}
      </div>
    </div>
  );
};

interface LanguageDropdownProps {
  show: boolean;
  onLanguageChange: (lang: string) => void;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  show,
  onLanguageChange,
}) => {
  if (!show) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-20 bg-surface-default rounded-lg shadow-lg border border-border-default z-60">
      <button
        onClick={() => onLanguageChange('en')}
        className="block w-full text-left px-3 py-2 text-sm hover:bg-surface-hover"
      >
        EN
      </button>
      <button
        onClick={() => onLanguageChange('hu')}
        className="block w-full text-left px-3 py-2 text-sm hover:bg-surface-hover"
      >
        HU
      </button>
    </div>
  );
};

interface AvatarDropdownProps {
  show: boolean;
  userName?: string;
  onLogout: () => void;
  onClose: () => void;
}

export const AvatarDropdown: React.FC<AvatarDropdownProps> = ({
  show,
  userName,
  onLogout,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-surface-default rounded-lg shadow-lg border border-border-default z-60">
      <div className="p-2">
        <div className="px-3 py-2 text-sm text-content-secondary border-b border-border-default">
          {userName}
        </div>
        <button
          onClick={() => {/* TODO: Navigate to profile */}}
          className="block w-full text-left px-3 py-2 text-sm hover:bg-surface-hover rounded"
        >
          Profile
        </button>
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="block w-full text-left px-3 py-2 text-sm hover:bg-surface-hover rounded text-danger-default"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}; 