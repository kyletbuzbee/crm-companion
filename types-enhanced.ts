// ============================================================================
// ENHANCED TYPESCRIPT TYPES & UTILITIES
// ============================================================================

// Core type utilities
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
export type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];
export type Nullable<T> = T | null | undefined;
export type NonEmptyArray<T> = [T, ...T[]];

// Enhanced interfaces with stricter typing
export interface EnhancedUser extends User {
  readonly id: string;
  readonly permissions: readonly string[];
  readonly lastLogin: Date;
  readonly preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  locale: string;
  timezone: string;
}

export interface EnhancedProspect extends Prospect {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly tags: readonly string[];
  readonly customFields: Record<string, unknown>;
  readonly metadata: ProspectMetadata;
}

export interface ProspectMetadata {
  source: 'import' | 'manual' | 'api' | 'referral';
  confidence: number;
  verified: boolean;
  duplicateOf?: string;
  assignedBy?: string;
  assignedAt?: Date;
}

export interface EnhancedOutreach extends Outreach {
  readonly id: string;
  readonly createdAt: Date;
  readonly metadata: OutreachMetadata;
}

export interface OutreachMetadata {
  duration?: number; // in minutes
  attendees: readonly string[];
  location?: {
    type: 'onsite' | 'phone' | 'video' | 'email';
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
  attachments: readonly string[];
  followUpRequired: boolean;
}

// Error types
export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
  readonly timestamp: Date;
  readonly stack?: string;
}

export interface ValidationError extends AppError {
  readonly field: string;
  readonly value: unknown;
  readonly expected: string;
}

// Event types
export interface AppEvent<T = unknown> {
  readonly type: string;
  readonly payload: T;
  readonly timestamp: Date;
  readonly source: string;
}

// Component prop types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

export interface TableColumn<T> {
  readonly key: keyof T;
  readonly label: string;
  readonly sortable?: boolean;
  readonly render?: (value: unknown, row: T) => React.ReactNode;
  readonly width?: string;
  readonly align?: 'left' | 'center' | 'right';
}

// Form types
export interface FormField<T = string> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date';
  value: T;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: readonly { value: string; label: string }[];
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: unknown;
  message: string;
}

// API types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: AppError;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
  };
}

// Performance monitoring
export interface PerformanceMetrics {
  readonly renderTime: number;
  readonly memoryUsage: number;
  readonly interactionDelay: number;
  readonly errorRate: number;
}

// Accessibility types
export interface A11yProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  role?: string;
  tabIndex?: number;
}

// Theme types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Import original types for compatibility
import type { UserRole, TabType, User, SearchFilters, Prospect, Outreach, EmailTemplate } from './index';

// Re-export for external use
export type { UserRole, TabType, User, SearchFilters, Prospect, Outreach, EmailTemplate };
