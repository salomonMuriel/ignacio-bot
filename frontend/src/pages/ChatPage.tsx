/**
 * ChatPage Component
 * Main page for the chat interface
 * Phase 2 implementation without authentication
 */

import React from 'react';
import ChatInterface from '../components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  return (
    <div className="h-screen bg-white">
      <ChatInterface />
    </div>
  );
};

export default ChatPage;
