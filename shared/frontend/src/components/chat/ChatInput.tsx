import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpTrayIcon, MagnifyingGlassIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useModelList } from '../../hooks/ai/useModelList';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Old send icon restored (paper airplane)
const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <PaperAirplaneIcon className={className + ' -rotate-45'} />
);
const IconButton: React.FC<{onClick:()=>void;label:string;disabled?:boolean;children:React.ReactNode;}>=
({ onClick, label, disabled = false, children })=>(
  <button type="button" onClick={onClick} disabled={disabled}
    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    aria-label={label}>{children}</button>
);

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type a message..." 
}) => {
  const [message, setMessage] = useState('');
  const { models } = useModelList();
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Persist selected model to backend on change
  const existingSession = typeof localStorage !== 'undefined' ? localStorage.getItem('chatSessionId') : null;
  const initialSessionId = existingSession || crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  if (!existingSession && typeof localStorage !== 'undefined') {
    localStorage.setItem('chatSessionId', initialSessionId);
  }
  const sessionIdRef = useRef<string>(initialSessionId);

  const persistModelSelection = async (modelId: string) => {
    try {
      await fetch('/api/v1/config/model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionIdRef.current, model: modelId }),
      });
    } catch (err) {
      console.error('Failed to persist model selection', err);
    }
  };
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedModel && models.length) {
      setSelectedModel(models[0].id);
      persistModelSelection(models[0].id);
    }
  }, [models, selectedModel]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 144)}px`; // max 6 rows
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      // Prefix message with selected model hint (non-breaking)
      const payload = selectedModel ? `[model:${selectedModel}] ${message.trim()}` : message.trim();
      onSendMessage(payload);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSubmit(e);} };

  const handleWebSearch = () => { if (message.trim()&&!disabled){ onSendMessage(`[search] ${message.trim()}`); setMessage(''); } };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>)=>{ const file=e.target.files?.[0]; if(file&&!disabled){ onSendMessage(`[file] ${file.name}`); e.target.value=''; } };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 px-6 py-4">
      {/* Left utility bar */}
      <div className="flex items-center gap-2">
        {/* Model selector */}
        <select
          value={selectedModel}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedModel(val);
            persistModelSelection(val);
          }}
          disabled={disabled || !models.length}
          className="text-sm border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id} className="dark:bg-neutral-800">
              {m.id}
            </option>
          ))}
        </select>

        {/* File upload */}
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          label="Upload file"
          disabled={disabled}
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
        </IconButton>

        {/* Web search */}
        <IconButton
          onClick={handleWebSearch}
          label="Web search"
          disabled={disabled || !message.trim()}
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </IconButton>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Textarea */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full resize-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-none outline-none text-sm sm:text-base leading-relaxed"
          rows={1}
          style={{ minHeight: '24px', maxHeight: '144px' }}
        />
      </div>

      {/* Send button */}
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className={`shrink-0 p-2 rounded-full transition-all duration-200 ${
          disabled || !message.trim()
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white active:scale-95'
        }`}
        aria-label="Send message"
      >
        <SendIcon className="w-5 h-5" />
      </button>
    </form>
  );
}; 