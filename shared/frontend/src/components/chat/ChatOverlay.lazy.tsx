import { lazy, Suspense } from 'react';
import { ChatErrorBoundary } from './ChatErrorBoundary';

// Lazy load the ChatOverlay component
const ChatOverlayComponent = lazy(() => 
  import('./ChatOverlay').then(module => ({ default: module.ChatOverlay }))
);

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// Loading fallback component
const ChatOverlayFallback = () => (
  <div className="chat-overlay">
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="chat-glass w-full max-w-md rounded-2xl p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
        <p className="text-white/70">Loading chat...</p>
      </div>
    </div>
  </div>
);

export const ChatOverlayLazy: React.FC<ChatOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <ChatErrorBoundary>
      <Suspense fallback={<ChatOverlayFallback />}>
        <ChatOverlayComponent isOpen={isOpen} onClose={onClose} />
      </Suspense>
    </ChatErrorBoundary>
  );
}; 