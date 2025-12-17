import React, { useState, useEffect, useRef } from 'react';
import { A11yProps } from './types-enhanced';

// Skip navigation component for screen readers
export const SkipNavigation: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsVisible(true);
      }
    };

    const handleBlur = () => {
      setIsVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleBlur);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleBlur);
    };
  }, []);

  return (
    <a
      href="#main"
      className={`skip-nav ${isVisible ? 'skip-nav-visible' : ''}`}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      Skip to main content
    </a>
  );
};

// ARIA Live Region for dynamic content announcements
export const LiveRegion: React.FC<{
  children?: React.ReactNode;
  message?: string;
  priority?: 'polite' | 'assertive';
  'data-testid'?: string;
}> = ({ children, message, priority = 'polite', ...props }) => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && liveRegionRef.current) {
      // Clear previous announcements to ensure screen readers announce new content
      setAnnouncements([]);
      
      // Use setTimeout to ensure DOM update before announcement
      setTimeout(() => {
        setAnnouncements([message]);
      }, 100);
    }
  }, [message]);

  return (
    <>
      {/* Live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        aria-live={priority}
        aria-atomic="true"
        className="sr-only"
        data-testid={props['data-testid'] || 'live-region'}
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>
      {/* Render children */}
      {children}
    </>
  );
};

// Focus management utilities
export const useFocusManagement = () => {
  const focusableElementsSelector = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  const trapFocus = (containerElement: HTMLElement) => {
    const focusableElements = Array.from(
      containerElement.querySelectorAll<HTMLElement>(focusableElementsSelector)
    ).filter(el => el.offsetParent !== null);

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableElement) {
          event.preventDefault();
          lastFocusableElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableElement) {
          event.preventDefault();
          firstFocusableElement?.focus();
        }
      }
    };

    containerElement.addEventListener('keydown', handleTabKey);
    
    // Focus the first element
    firstFocusableElement?.focus();

    return () => {
      containerElement.removeEventListener('keydown', handleTabKey);
    };
  };

  const restoreFocus = (element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  };

  const setInitialFocus = (containerElement: HTMLElement) => {
    const focusableElements = Array.from(
      containerElement.querySelectorAll<HTMLElement>(focusableElementsSelector)
    ).filter(el => el.offsetParent !== null);

    // Prefer elements with data-autofocus attribute
    const autoFocusElement = focusableElements.find(el => 
      el.hasAttribute('data-autofocus') || el.getAttribute('autofocus') !== null
    );

    if (autoFocusElement) {
      autoFocusElement.focus();
    } else if (focusableElements[0]) {
      focusableElements[0].focus();
    }
  };

  return { trapFocus, restoreFocus, setInitialFocus };
};

// High contrast mode detection and support
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      // Check for high contrast mode via media query
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      setIsHighContrast(highContrastQuery.matches);

      // Listen for changes
      const handleChange = (event: MediaQueryListEvent) => {
        setIsHighContrast(event.matches);
      };

      highContrastQuery.addEventListener('change', handleChange);
      
      return () => {
        highContrastQuery.removeEventListener('change', handleChange);
      };
    };

    const cleanup = checkHighContrast();
    return cleanup;
  }, []);

  useEffect(() => {
    // Apply high contrast class to body for CSS targeting
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  return { isHighContrast };
};

// Keyboard navigation handler
export const useKeyboardNavigation = (
  callback: (event: KeyboardEvent) => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      callback(event);
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [callback, enabled]);
};

// Accessible modal component with focus management
interface AccessibleModalProps extends A11yProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  ...props
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const { trapFocus, restoreFocus } = useFocusManagement();

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus trap after a short delay to ensure modal is rendered
      setTimeout(() => {
        if (modalRef.current) {
          trapFocus(modalRef.current);
        }
      }, 100);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to previously focused element
      restoreFocus(previousActiveElement.current);
      
      // Re-enable body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, trapFocus, restoreFocus]);

  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        {...props}
      >
        <div className="flex justify-between items-center p-4 border-b bg-green-900 text-white sticky top-0 z-10">
          <h2 id="modal-title" className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-2xl leading-none"
            aria-label="Close modal"
            data-autofocus
          >
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Announce page changes for screen readers
export const usePageAnnouncements = () => {
  const announcePageChange = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const announceError = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announcePageChange, announceError };
};

// Screen reader only utility class
export const srOnlyStyles = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

// Skip navigation styles
export const skipNavStyles = `
  .skip-nav {
    position: absolute;
    left: -9999px;
    z-index: 999999;
    padding: 8px 16px;
    background: #000;
    color: #fff;
    text-decoration: none;
    border-radius: 4px;
    font-weight: bold;
  }
  
  .skip-nav-visible {
    left: 8px;
    top: 8px;
  }
  
  .skip-nav:focus {
    left: 8px;
    top: 8px;
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
`;

// High contrast mode styles
export const highContrastStyles = `
  .high-contrast {
    filter: contrast(150%);
  }
  
  .high-contrast button {
    border: 2px solid currentColor !important;
  }
  
  .high-contrast input,
  .high-contrast select,
  .high-contrast textarea {
    border: 2px solid currentColor !important;
  }
  
  .high-contrast .bg-gray-100 {
    background-color: #ffffff !important;
    border: 1px solid #000000 !important;
  }
  
  .high-contrast .bg-gray-200 {
    background-color: #f0f0f0 !important;
    border: 1px solid #000000 !important;
  }
`;
