import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

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

function App() {
  return (
    <ErrorBoundary>
      <GlobalProvider>
        <AuthProvider>
          <ProjectsProvider>
            <ConversationsProvider>
              <Router>
                <div className="App">
                  <Routes>
                    {/* Public Route - Landing Page */}
                    <Route path="/" element={<LandingPage />} />
                    
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
  );
}

export default App;
