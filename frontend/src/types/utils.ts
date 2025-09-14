// Utility types for forms and state management
import React from 'react';

// Generic API state for async operations
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// Form state utilities
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
}

// Action types for useActionState
export interface ActionState<T> {
  data: T | null;
  error: string | null;
  isPending: boolean;
}

// Optimistic update types for useOptimistic
export interface OptimisticAction<T> {
  type: string;
  payload: T;
  optimisticId?: string;
}

// Generic CRUD operations
export interface CrudOperations<T, CreateType = Partial<T>, UpdateType = Partial<T>> {
  items: T[];
  create: (data: CreateType) => Promise<T>;
  update: (id: string, data: UpdateType) => Promise<T>;
  delete: (id: string) => Promise<void>;
  fetch: () => Promise<T[]>;
  fetchById: (id: string) => Promise<T>;
}

// Pagination types
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationState;
}

// Filter and sort types
export interface FilterState {
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  [key: string]: unknown;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

// File upload utilities
export interface FileUploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

// Validation utilities
export type ValidationRule<T> = (value: T) => string | undefined;

export interface ValidationSchema<T> {
  [K in keyof T]?: ValidationRule<T[K]>[];
}

// Local storage utilities
export interface StorageState<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
}

// Route params
export interface RouteParams {
  conversationId?: string;
  projectId?: string;
}

// Theme utilities
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Event handlers
export type EventHandler<T = Event> = (event: T) => void;
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler<T> = (data: T) => void | Promise<void>;

// Component props utilities
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps {
  isLoading?: boolean;
  loadingText?: string;
}

export interface ErrorProps {
  error?: string | null;
  onRetry?: () => void;
}

// API client types
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface ApiClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  interceptors?: {
    request?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
    response?: (response: Response) => Response | Promise<Response>;
    error?: (error: Error) => Error | Promise<Error>;
  };
}