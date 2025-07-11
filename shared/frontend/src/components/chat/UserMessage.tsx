import React from 'react';
import { Message } from '../../contexts/ChatContext';

interface UserMessageProps {
  message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex justify-end">
      <div className="max-w-[70%]">
        <div className="bg-blue-500 text-white rounded-[20px] rounded-br-[0px] px-4 py-3 shadow-sm">
          <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
            {message.content}
          </div>
        </div>
        {message.timestamp && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}; 