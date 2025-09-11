"use client";

import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ProjectProvider } from './ProjectContext';
import { ConversationProvider } from './ConversationContext';

interface GlobalProvidersProps {
  children: ReactNode;
}

/**
 * Combined providers component that wraps the entire app
 * Provides global state management using React 19.1 Context API
 */
export function GlobalProviders({ children }: GlobalProvidersProps) {
  return (
    <AuthProvider>
      <ProjectProvider>
        <ConversationProvider>
          {children}
        </ConversationProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}