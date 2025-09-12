/**
 * Chat Layout - Server Component
 * Layout for the chat interface with sidebar and project management
 */

import { Suspense } from 'react';

interface ChatLayoutProps {
  children: React.ReactNode;
}

// Loading components
function SidebarSkeleton() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col animate-pulse">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
      
      {/* Project Selector */}
      <div className="p-4 border-b border-gray-200">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded mb-3"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-2">
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex-1 flex flex-col animate-pulse">
      {/* Chat header */}
      <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              i % 2 === 0 ? 'bg-blue-500' : 'bg-white border'
            }`}>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Input */}
      <div className="border-t border-gray-200 p-6">
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="h-screen bg-gray-50">
      {children}
    </div>
  );
}