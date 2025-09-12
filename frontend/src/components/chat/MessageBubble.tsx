'use client';

/**
 * MessageBubble - Individual message display component
 * Handles different message types and attachment display
 */

import { Message, MessageType, UserFile } from '@/types';
import { DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface MessageBubbleProps {
  message: Message;
  isFirst?: boolean;
  isLast?: boolean;
}

export function MessageBubble({ message, isFirst = false, isLast = false }: MessageBubbleProps) {
  const isUser = message.is_from_user;
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderAttachment = (attachment: UserFile) => {
    const isImage = attachment.file_type.startsWith('image/');
    
    return (
      <div key={attachment.id} className="mt-2">
        {isImage ? (
          <div className="relative group">
            <img
              src={attachment.file_path}
              alt={attachment.file_name}
              className="max-w-xs rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => window.open(attachment.file_path, '_blank')}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity flex items-center justify-center">
              <PhotoIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-80" />
            </div>
          </div>
        ) : (
          <div 
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors max-w-xs"
            onClick={() => window.open(attachment.file_path, '_blank')}
          >
            <DocumentIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate text-sm">
                {attachment.file_name}
              </div>
              <div className="text-xs text-gray-500">
                {(attachment.file_size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${!isLast && !isUser ? 'mb-1' : ''}`}>
        {/* Message bubble */}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
          } ${
            isFirst && isUser ? 'rounded-tr-md' : ''
          } ${
            isFirst && !isUser ? 'rounded-tl-md' : ''
          } ${
            isLast && isUser ? 'rounded-br-md' : ''
          } ${
            isLast && !isUser ? 'rounded-bl-md' : ''
          }`}
        >
          {/* Message content */}
          {message.content && (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2">
              {message.attachments.map((attachment) => renderAttachment(attachment))}
            </div>
          )}

          {/* File path (legacy support) */}
          {message.file_path && (
            <div className="mt-2">
              <div 
                className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer ${
                  isUser ? 'bg-blue-500 hover:bg-blue-400' : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors`}
                onClick={() => window.open(message.file_path!, '_blank')}
              >
                <DocumentIcon className={`w-4 h-4 ${isUser ? 'text-blue-100' : 'text-blue-600'}`} />
                <span className={`text-sm ${isUser ? 'text-blue-100' : 'text-gray-700'}`}>
                  Ver archivo
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Timestamp and metadata */}
        {isLast && (
          <div className={`mt-1 text-xs text-gray-500 ${isUser ? 'text-right' : 'text-left'}`}>
            <span>{formatTime(message.created_at)}</span>
            
            {/* AI agent info for bot messages */}
            {!isUser && message.message_type === MessageType.TEXT && (
              <span className="ml-2 text-blue-600">
                • Ignacio
              </span>
            )}
            
            {/* Message type indicator */}
            {message.message_type !== MessageType.TEXT && (
              <span className="ml-2 capitalize">
                • {message.message_type}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}