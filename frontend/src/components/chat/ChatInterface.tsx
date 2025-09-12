'use client';

/**
 * ChatInterface - Main chat layout component
 * Manages the overall chat interface with sidebar and conversation area
 */

import { useState, useEffect } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { ChatSidebar } from './ChatSidebar';
import { ConversationView } from './ConversationView';
import { WelcomeView } from './WelcomeView';

export function ChatInterface() {
  const { currentUser } = useAuth();
  const { activeProject } = useProject();
  const { currentConversation, isLoading } = useConversation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // For mobile responsiveness
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`
        ${isMobile && currentConversation ? 'hidden' : 'block'}
        ${sidebarCollapsed ? 'w-16' : 'w-80'}
        transition-all duration-200 ease-in-out
        bg-white border-r border-gray-200 flex flex-col
      `}>
        <ChatSidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={isMobile}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <ConversationView
            conversation={currentConversation}
            onBackToSidebar={isMobile ? () => {/* Show sidebar on mobile */} : undefined}
          />
        ) : (
          <WelcomeView />
        )}
      </div>
    </div>
  );
}