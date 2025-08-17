import { useCallback } from 'react';
import toast from 'react-hot-toast';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export const useNotification = () => {
  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message, {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#10b981',
            color: '#ffffff',
          },
        });
        break;
      case 'error':
        toast.error(message, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#ef4444',
            color: '#ffffff',
          },
        });
        break;
      case 'warning':
        toast(message, {
          duration: 3500,
          position: 'top-right',
          icon: '⚠️',
          style: {
            background: '#f59e0b',
            color: '#ffffff',
          },
        });
        break;
      default:
        toast(message, {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#3b82f6',
            color: '#ffffff',
          },
        });
    }
  }, []);

  return {
    showNotification
  };
}; 