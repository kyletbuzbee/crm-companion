import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  SkipNavigation,
  LiveRegion,
  AccessibleModal,
  useFocusManagement,
  useHighContrast,
  useKeyboardNavigation,
} from './accessibility-enhanced';

// Mock IntersectionObserver and matchMedia
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

window.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

describe('SkipNavigation', () => {
  it('renders skip navigation link', () => {
    render(
      <div>
        <SkipNavigation />
        <main id="main">Main content</main>
      </div>
    );
    
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main');
  });

  it('becomes visible on Tab key press', async () => {
    render(
      <div>
        <SkipNavigation />
        <main id="main">Main content</main>
      </div>
    );
    
    const skipLink = screen.getByText('Skip to main content');
    
    // Initially not visible (off-screen)
    expect(skipLink).toHaveClass('skip-nav');
    expect(skipLink).not.toHaveClass('skip-nav-visible');
    
    // Press Tab to make visible
    fireEvent.keyDown(skipLink, { key: 'Tab' });
    
    await waitFor(() => {
      expect(skipLink).toHaveClass('skip-nav-visible');
    });
  });
});

describe('LiveRegion', () => {
  it('renders children and manages announcements', async () => {
    render(
      <LiveRegion message="Test announcement">
        <div>Test content</div>
      </LiveRegion>
    );
    
    // Children should render
    expect(screen.getByText('Test content')).toBeInTheDocument();
    
    // Live region should be present for screen readers
    const liveRegion = document.querySelector('[aria-live]');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('handles assertive announcements', () => {
    render(
      <LiveRegion message="Error message" priority="assertive">
        <div>Content</div>
      </LiveRegion>
    );
    
    const liveRegion = document.querySelector('[aria-live="assertive"]');
    expect(liveRegion).toBeInTheDocument();
  });
});

describe('AccessibleModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders modal when open', () => {
    render(
      <AccessibleModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </AccessibleModal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <AccessibleModal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </AccessibleModal>
    );
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('closes on overlay click', () => {
    render(
      <AccessibleModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </AccessibleModal>
    );
    
    const overlay = document.querySelector('.fixed.inset-0');
    fireEvent.click(overlay!);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key press', () => {
    render(
      <AccessibleModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </AccessibleModal>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('has proper ARIA attributes', () => {
    render(
      <AccessibleModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </AccessibleModal>
    );
    
    const modal = document.querySelector('[role="dialog"]');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('aria-modal', 'true');
    
    const title = document.querySelector('#modal-title');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(title).toBeInTheDocument();
  });
});

describe('useFocusManagement', () => {
  it('traps focus within container', () => {
    const TestComponent = () => {
      const { trapFocus } = useFocusManagement();
      const containerRef = React.useRef<HTMLDivElement>(null);

      React.useEffect(() => {
        if (containerRef.current) {
          trapFocus(containerRef.current);
        }
      }, [trapFocus]);

      return (
        <div ref={containerRef}>
          <button>Button 1</button>
          <button>Button 2</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    // First button should be focused
    expect(document.activeElement).toHaveTextContent('Button 1');
    
    // Tab to next button
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toHaveTextContent('Button 2');
    
    // Tab should wrap back to first button
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toHaveTextContent('Button 1');
  });
});

describe('useHighContrast', () => {
  it('detects high contrast preference', () => {
    const TestComponent = () => {
      const { isHighContrast } = useHighContrast();
      return <div>{isHighContrast ? 'High Contrast' : 'Normal'}</div>;
    };

    render(<TestComponent />);
    
    // Should show 'Normal' since we mocked matchMedia to return false
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });
});

describe('useKeyboardNavigation', () => {
  const mockCallback = jest.fn();

  beforeEach(() => {
    mockCallback.mockClear();
  });

  it('calls callback on key press', () => {
    const TestComponent = () => {
      useKeyboardNavigation(mockCallback);
      return <div>Test</div>;
    };

    render(<TestComponent />);
    
    fireEvent.keyDown(document, { key: 'Enter' });
    
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'Enter' })
    );
  });

  it('does not call callback when disabled', () => {
    const TestComponent = () => {
      useKeyboardNavigation(mockCallback, false);
      return <div>Test</div>;
    };

    render(<TestComponent />);
    
    fireEvent.keyDown(document, { key: 'Enter' });
    
    expect(mockCallback).not.toHaveBeenCalled();
  });
});

// Accessibility compliance tests
describe('Accessibility Compliance', () => {
  it('ensures all interactive elements are keyboard accessible', () => {
    const TestComponent = () => (
      <div>
        <button onClick={() => {}}>Button</button>
        <input type="text" aria-label="Text input" />
        <select aria-label="Select">
          <option>Option</option>
        </select>
      </div>
    );

    render(<TestComponent />);
    
    const button = screen.getByRole('button');
    const input = screen.getByLabelText('Text input');
    const select = screen.getByLabelText('Select');
    
    // Test keyboard navigation
    button.focus();
    expect(document.activeElement).toBe(button);
    
    input.focus();
    expect(document.activeElement).toBe(input);
    
    select.focus();
    expect(document.activeElement).toBe(select);
  });

  it('ensures form elements have proper labels', () => {
    const TestComponent = () => (
      <form>
        <label htmlFor="test-input">Test Input</label>
        <input id="test-input" type="text" />
        
        <label>
          <input type="checkbox" />
          Checkbox Label
        </label>
      </form>
    );

    render(<TestComponent />);
    
    const input = screen.getByLabelText('Test Input');
    const checkbox = screen.getByLabelText('Checkbox Label');
    
    expect(input).toHaveAttribute('id', 'test-input');
    expect(checkbox).toBeInTheDocument();
  });
});
