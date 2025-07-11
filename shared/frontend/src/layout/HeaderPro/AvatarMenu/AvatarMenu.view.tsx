import { useState } from 'react';
import { useAuth } from '../../../hooks/auth/useAuth';

interface User {
  name?: string;
  email?: string;
  picture?: string;
}

interface AvatarMenuProps {
  user: User;
}

// Logout Icon
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const AvatarMenu = ({ user }: AvatarMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  // Generate initials from name
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user.name || 'User';
  const displayEmail = user.email || 'No email';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full 
                   hover:bg-neutral-100 dark:hover:bg-neutral-800
                   transition-smooth"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={displayName}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
            {getInitials(user.name)}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-1 w-64 z-20
                          bg-white dark:bg-neutral-800 
                          border border-neutral-200 dark:border-neutral-700
                          rounded-lg shadow-lg py-2">
            
            {/* User Info */}
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {displayName}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                    {displayEmail}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left
                           text-neutral-700 dark:text-neutral-300
                           hover:bg-neutral-50 dark:hover:bg-neutral-700
                           transition-colors duration-150"
              >
                <LogoutIcon />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 