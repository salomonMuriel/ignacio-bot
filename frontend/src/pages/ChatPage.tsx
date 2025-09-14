import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useConversations } from '../contexts/ConversationsContext';
import { useNavigate } from 'react-router-dom';

export default function ChatPage() {
  const { user } = useAuth();
  const { projects, activeProject, setActiveProject, isLoading: projectsLoading } = useProjects();
  const { 
    conversations, 
    currentConversation, 
    messages, 
    sendMessage, 
    startNewConversation,
    isLoading: conversationsLoading 
  } = useConversations();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Redirect if user has no projects
  useEffect(() => {
    if (!projectsLoading && projects.length === 0) {
      navigate('/create-project');
    }
  }, [projects, projectsLoading, navigate]);

  // Auto-select first project if none is active
  useEffect(() => {
    if (!activeProject && projects.length > 0) {
      setActiveProject(projects[0]);
    }
  }, [activeProject, projects, setActiveProject]);

  // Start new conversation if none exists for active project
  useEffect(() => {
    if (activeProject && !currentConversation && !conversationsLoading) {
      startNewConversation(activeProject.id);
    }
  }, [activeProject, currentConversation, conversationsLoading, startNewConversation]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeProject || !currentConversation || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(messageInput, currentConversation.id);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (projectsLoading || conversationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading chat...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Please log in to access chat.</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return null; // Will redirect to create-project
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Conversations */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          {activeProject && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Project:</p>
              <p className="font-medium text-gray-800">{activeProject.project_name}</p>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">
              <p>No conversations yet.</p>
              <p className="text-sm mt-1">Start chatting with Ignacio!</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  currentConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <p className="font-medium text-gray-800 truncate">
                  {conversation.title || 'New Conversation'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {conversation.created_at && new Date(conversation.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => activeProject && startNewConversation(activeProject.id)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            New Conversation
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Chat with Ignacio</h1>
              {currentConversation && (
                <p className="text-sm text-gray-600">
                  {currentConversation.title || 'New Conversation'}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded border border-blue-300 hover:border-blue-400 transition-colors"
            >
              Manage Projects
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentConversation ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Starting new conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Welcome to your chat with Ignacio!
                </h3>
                <p className="text-gray-600 mb-4">
                  I'm here to help you develop your project: <strong>{activeProject?.project_name}</strong>
                </p>
                <p className="text-gray-600 mb-6">
                  Ask me anything about marketing, technical implementation, business strategy, 
                  or any other aspect of your project. I can also help you with:
                </p>
                <ul className="text-left text-gray-600 space-y-2 mb-6">
                  <li>• Market research and validation</li>
                  <li>• Technical architecture and implementation</li>
                  <li>• Business model development</li>
                  <li>• Financial planning and analysis</li>
                  <li>• Project management and roadmapping</li>
                </ul>
                <p className="text-gray-500 text-sm">
                  Type your message below to get started!
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.created_at && new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message to Ignacio..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                disabled={isSending}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors self-end"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}