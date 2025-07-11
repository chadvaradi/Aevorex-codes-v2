import React, { useState, useEffect } from 'react';

// New messages SVG icon (14x14, down arrow)
const NewMessagesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 16.5 6 10.5h12L12 16.5Z"/>
  </svg>
);

export const AutoScrollIndicator: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [messagesContainer, setMessagesContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Look for the messages container within the chat overlay
    const container = document.querySelector('.chat-overlay .overflow-y-auto') as HTMLElement;
    setMessagesContainer(container);
  }, []);

  useEffect(() => {
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 200; // 200px threshold
      setIsVisible(!isAtBottom);
    };

    messagesContainer.addEventListener('scroll', handleScroll);
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, [messagesContainer]);

  const scrollToBottom = () => {
    if (messagesContainer) {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-6 z-10">
      <button
        onClick={scrollToBottom}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-full shadow-lg transition-colors backdrop-blur-sm"
        aria-label="Scroll to new messages"
      >
        <NewMessagesIcon className="w-4 h-4" />
        <span className="text-sm font-medium">New</span>
      </button>
    </div>
  );
}; 