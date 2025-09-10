/**
 * ChatPage Component
 * Main page for the chat interface with project-based workflow
 */

import React, { useState, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext';
import ChatInterface from '../components/chat/ChatInterface';
import ProjectOnboarding from '../components/projects/ProjectOnboarding';

const ChatPage: React.FC = () => {
  // Temporary user ID for Phase 2 (before authentication)
  // Must match the TEMP_USER_ID in backend/app/routers/chat.py
  const TEMP_USER_ID = 'a456f25a-6269-4de3-87df-48b0a3389d01';

  const { projects, activeProject, loadUserProjects, isLoading } = useProject();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCheckedProjects, setHasCheckedProjects] = useState(false);

  useEffect(() => {
    const initializeProjects = async () => {
      if (!hasCheckedProjects) {
        await loadUserProjects(TEMP_USER_ID);
        setHasCheckedProjects(true);
      }
    };

    initializeProjects();
  }, [loadUserProjects, hasCheckedProjects]);

  useEffect(() => {
    // Show onboarding if no projects exist and we've finished loading
    if (hasCheckedProjects && !isLoading && projects.length === 0) {
      setShowOnboarding(true);
    }
  }, [hasCheckedProjects, isLoading, projects.length]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Show loading screen while checking for projects
  if (!hasCheckedProjects || (isLoading && projects.length === 0)) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus proyectos...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if no projects exist
  if (showOnboarding) {
    return (
      <ProjectOnboarding
        userId={TEMP_USER_ID}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Show chat interface if user has projects
  return (
    <div className="h-screen bg-white">
      <ChatInterface />
    </div>
  );
};

export default ChatPage;
