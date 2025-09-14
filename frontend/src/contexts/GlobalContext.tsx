/**
 * GlobalContext - App-wide Settings and Notifications
 * Handles global application state, notifications, UI preferences, and app-wide settings
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds, null for persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Language types
export type Language = 'en' | 'es';

// Global State Interface
interface GlobalState {
  // Notifications
  notifications: Notification[];
  
  // UI Preferences
  theme: Theme;
  language: Language;
  sidebarCollapsed: boolean;
  
  // App State
  isOnline: boolean;
  lastSync: Date | null;
  
  // Feature Flags
  features: {
    fileUpload: boolean;
    voiceMessages: boolean;
    projectSharing: boolean;
    advancedAnalytics: boolean;
  };
}

// Global Actions
type GlobalAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'createdAt'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'UPDATE_LAST_SYNC'; payload: Date }
  | { type: 'UPDATE_FEATURE_FLAG'; payload: { feature: keyof GlobalState['features']; enabled: boolean } };

// Global Context Interface
interface GlobalContextType extends GlobalState {
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // UI actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // App state actions
  setOnlineStatus: (isOnline: boolean) => void;
  updateLastSync: () => void;
  updateFeatureFlag: (feature: keyof GlobalState['features'], enabled: boolean) => void;
  
  // Utility methods
  showSuccessNotification: (title: string, message?: string) => string;
  showErrorNotification: (title: string, message?: string) => string;
  showWarningNotification: (title: string, message?: string) => string;
  showInfoNotification: (title: string, message?: string) => string;
}

// Initial state
const initialState: GlobalState = {
  notifications: [],
  theme: 'system',
  language: 'es', // Default to Spanish for Ignacio Bot
  sidebarCollapsed: false,
  isOnline: navigator.onLine || true,
  lastSync: null,
  features: {
    fileUpload: true,
    voiceMessages: false, // Will be enabled in future phases
    projectSharing: false, // Will be enabled in future phases
    advancedAnalytics: false, // Will be enabled in future phases
  },
};

// Load persisted state from localStorage
const loadPersistedState = (): Partial<GlobalState> => {
  try {
    const persistedState = localStorage.getItem('ignacio_global_state');
    if (persistedState) {
      const parsed = JSON.parse(persistedState);
      return {
        theme: parsed.theme || initialState.theme,
        language: parsed.language || initialState.language,
        sidebarCollapsed: parsed.sidebarCollapsed || initialState.sidebarCollapsed,
        features: { ...initialState.features, ...parsed.features },
      };
    }
  } catch (error) {
    console.error('Failed to load persisted global state:', error);
  }
  return {};
};

// Global reducer
function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
      };
      return {
        ...state,
        notifications: [...state.notifications, newNotification],
      };
    }

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };

    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload,
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };

    case 'SET_SIDEBAR_COLLAPSED':
      return {
        ...state,
        sidebarCollapsed: action.payload,
      };

    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload,
      };

    case 'UPDATE_LAST_SYNC':
      return {
        ...state,
        lastSync: action.payload,
      };

    case 'UPDATE_FEATURE_FLAG':
      return {
        ...state,
        features: {
          ...state.features,
          [action.payload.feature]: action.payload.enabled,
        },
      };

    default:
      return state;
  }
}

// Create context
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// GlobalProvider component
interface GlobalProviderProps {
  children: React.ReactNode;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
  const [state, dispatch] = useReducer(globalReducer, {
    ...initialState,
    ...loadPersistedState(),
  });

  // Persist state to localStorage when it changes
  useEffect(() => {
    try {
      const stateToPersist = {
        theme: state.theme,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
        features: state.features,
      };
      localStorage.setItem('ignacio_global_state', JSON.stringify(stateToPersist));
    } catch (error) {
      console.error('Failed to persist global state:', error);
    }
  }, [state.theme, state.language, state.sidebarCollapsed, state.features]);

  // Auto-remove notifications after their duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    state.notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [state.notifications]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else if (state.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [state.theme]);

  // Notification actions
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): string => {
    const action: GlobalAction = { type: 'ADD_NOTIFICATION', payload: notification };
    dispatch(action);
    
    // Return the ID that will be generated
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  // UI actions
  const setTheme = (theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setLanguage = (language: Language) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed });
  };

  // App state actions
  const setOnlineStatus = (isOnline: boolean) => {
    dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline });
  };

  const updateLastSync = () => {
    dispatch({ type: 'UPDATE_LAST_SYNC', payload: new Date() });
  };

  const updateFeatureFlag = (feature: keyof GlobalState['features'], enabled: boolean) => {
    dispatch({ type: 'UPDATE_FEATURE_FLAG', payload: { feature, enabled } });
  };

  // Utility notification methods
  const showSuccessNotification = (title: string, message?: string): string => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration: 5000,
    });
  };

  const showErrorNotification = (title: string, message?: string): string => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 8000,
    });
  };

  const showWarningNotification = (title: string, message?: string): string => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000,
    });
  };

  const showInfoNotification = (title: string, message?: string): string => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
    });
  };

  const contextValue: GlobalContextType = {
    ...state,
    addNotification,
    removeNotification,
    clearNotifications,
    setTheme,
    setLanguage,
    toggleSidebar,
    setSidebarCollapsed,
    setOnlineStatus,
    updateLastSync,
    updateFeatureFlag,
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    showInfoNotification,
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}

// Custom hook to use global context
export function useGlobal(): GlobalContextType {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
}

export default GlobalContext;