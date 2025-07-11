import React, { useState, useEffect } from 'react';
import { Message } from '../../contexts/ChatContext';

interface StreamingMessageProps {
  message: Message;
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({ message }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (message.isStreaming && message.content.length > displayedContent.length) {
      setIsTyping(true);
      
      // Character-by-character streaming (30ms per character)
      const streamCharacters = () => {
        const targetContent = message.content;
        const currentLength = displayedContent.length;
        
        if (currentLength < targetContent.length) {
          const nextChar = targetContent[currentLength];
          setDisplayedContent(prev => prev + nextChar);
          
          // Continue streaming
          setTimeout(streamCharacters, 30);
        } else {
          setIsTyping(false);
        }
      };
      
      streamCharacters();
    } else if (!message.isStreaming) {
      setDisplayedContent(message.content);
      setIsTyping(false);
    }
  }, [message.content, message.isStreaming, displayedContent.length]);

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-gray-900 dark:text-white text-justify">
          {displayedContent}
          {isTyping && <span className="typing-cursor ml-1 inline-block w-0.5 h-5 bg-blue-500 animate-pulse" />}
        </p>
        {message.timestamp && !isTyping && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}; 