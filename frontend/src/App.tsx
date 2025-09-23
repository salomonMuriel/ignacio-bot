import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import * as ReactRouter from "react-router-dom";

// SuperTokens Configuration
import { SuperTokensConfig, PreBuiltUIList, ComponentWrapper } from './config/supertokens';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ProjectsProvider } from './contexts/ProjectsContext';
import { ConversationsProvider } from './contexts/ConversationsContext';
import { GlobalProvider } from './contexts/GlobalContext';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import ProjectGuard from './components/ProjectGuard';

// Pages
import LandingPage from './pages/LandingPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ChatPage from './pages/ChatPage';
import ProjectsPage from './pages/ProjectsPage';
import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';

// Initialize SuperTokens
SuperTokens.init(SuperTokensConfig);

function App() {
  return (
    <SuperTokensWrapper>
      <ErrorBoundary>
        <GlobalProvider>
          <AuthProvider>
            <ProjectsProvider>
              <ConversationsProvider>
                <Router>
                  <div className="App">
                    <ComponentWrapper>
                      <Routes>
                        {/* Public Route - Landing Page */}
                        <Route path="/" element={<LandingPage />} />

                        {/* SuperTokens Auth Routes */}
                        {getSuperTokensRoutesForReactRouterDom(ReactRouter, PreBuiltUIList)}

                        {/* Protected Routes */}
                        <Route
                          path="/create-project"
                          element={
                            <ProtectedRoute>
                              <CreateProjectPage />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/projects"
                          element={
                            <ProtectedRoute>
                              <ProjectGuard requiresProject={false}>
                                <ProjectsPage />
                              </ProjectGuard>
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/chat"
                          element={
                            <ProtectedRoute>
                              <ProjectGuard requiresProject={true}>
                                <ChatPage />
                              </ProjectGuard>
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/user"
                          element={
                            <ProtectedRoute>
                              <UserPage />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute>
                              <AdminPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Catch all - redirect to landing */}
                        <Route path="*" element={<LandingPage />} />
                      </Routes>
                    </ComponentWrapper>
                  </div>

                  {/* Global Toast Notifications */}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      className: '',
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                    }}
                  />
                </Router>
              </ConversationsProvider>
            </ProjectsProvider>
          </AuthProvider>
        </GlobalProvider>
      </ErrorBoundary>
    </SuperTokensWrapper>
  );
}

export default App;
