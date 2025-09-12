'use client';

/**
 * MessageList - Display list of messages with optimistic updates
 * Shows user and AI messages with proper formatting and attachments
 */

import { Message, MessageType } from '@/types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading = false }: MessageListProps) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isFirst={index === 0 || messages[index - 1].is_from_user !== message.is_from_user}
          isLast={index === messages.length - 1 || messages[index + 1]?.is_from_user !== message.is_from_user}
        />
      ))}
      
      {/* Loading indicator for new AI response */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-xs lg:max-w-md">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">Ignacio está escribiendo...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}