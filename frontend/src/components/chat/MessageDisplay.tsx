/**
 * MessageDisplay Component
 * Displays individual messages in the chat interface
 * Handles different message types and shows user vs AI messages differently
 */

import React from 'react';
import { Message, MessageType } from '../../types';

interface MessageDisplayProps {
  message: Message;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = () => {
    if (message.message_type === MessageType.TEXT) {
      return (
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      );
    }

    // TODO: Handle other message types (image, audio, video, document) in Phase 3
    return (
      <div className="text-gray-500 italic">
Mensaje de tipo {message.message_type} (soporte para archivos próximamente)
      </div>
    );
  };

  const isFromUser = message.is_from_user;

  return (
    <div className={`flex w-full ${isFromUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isFromUser ? 'order-1' : 'order-2'}`}>
        {/* Avatar */}
        <div className={`flex ${isFromUser ? 'justify-end' : 'justify-start'} mb-1`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
              isFromUser ? 'bg-primary-500' : 'bg-secondary-500'
            }`}
          >
            {isFromUser ? 'U' : 'I'}
          </div>
        </div>

        {/* Message Bubble */}
        <div
          className={`px-4 py-2 rounded-lg shadow-sm ${
            isFromUser
              ? 'bg-primary-500 text-ignia-dark-gray rounded-br-sm'
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
          }`}
        >
          {renderMessageContent()}
        </div>

        {/* Timestamp */}
        <div className={`flex ${isFromUser ? 'justify-end' : 'justify-start'} mt-1`}>
          <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageDisplay;
