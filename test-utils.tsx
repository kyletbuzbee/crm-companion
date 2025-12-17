import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { A11yProps } from './types-enhanced';

// Test environment setup
export const setupTests = () => {
  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() { return null; }
    disconnect() { return null; }
    unobserve() { return null; }
  };

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() { return null; }
    disconnect() { return null; }
    unobserve() { return null; }
  };

  // Mock matchMedia
  window.matchMedia = jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

  // Mock performance.now
  jest.spyOn(performance, 'now').mockImplementation(() => 0);

  // Suppress console warnings in tests
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<any>;
  initialEntries?: string[];
}

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult => {
  const wrapper = options?.wrapper || AllTheProviders;

  return render(ui, { wrapper, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test data generators
export const generateMockProspect = (overrides: Partial<any> = {}): any => ({
  cid: 'CID-TEST-001',
  companyName: 'Test Company Inc',
  locationName: 'Main Office',
  address: '123 Test St, Test City, TX 75001',
  lat: 32.3513,
  lng: -95.3011,
  zip: '75001',
  currentAssets: 'Steel, Aluminum',
  containerSize: 30,
  industry: 'Metal Fabricator',
  industryScore: 95,
  priority: 85,
  winProbability: 72,
  lastOutcome: 'Interested',
  lastOutreachDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  nextVisitDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  contactStatus: 'Hot',
  email: 'test@testcompany.com',
  estimatedMonthlyRevenue: 1200,
  owner: 'Test User',
  ...overrides,
});

export const generateMockUser = (overrides: Partial<any> = {}): any => ({
  username: 'testuser',
  name: 'Test User',
  role: 'Sales Rep',
  ...overrides,
});

export const generateMockOutreach = (overrides: Partial<any> = {}): any => ({
  lid: 'LID-TEST-001',
  cid: 'CID-TEST-001',
  companyName: 'Test Company Inc',
  visitDate: new Date().toISOString(),
  notes: 'Initial contact meeting went well. They are interested in our services.',
  outcome: 'Interested',
  stage: 'Nurture',
  status: 'Hot',
  nextVisitDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  daysSinceLast: 5,
  nextVisitCountdown: 14,
  followUpAction: 'Send Pricing',
  owner: 'Test User',
  contactType: 'In-Person',
  ...overrides,
});

// Accessibility testing utilities
export const checkAccessibility = async (container: HTMLElement) => {
  const { axe, toHaveNoViolations } = require('jest-axe');
  expect.extend(toHaveNoViolations);
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

export const checkKeyboardNavigation = async (element: HTMLElement) => {
  // Test tab navigation
  element.focus();
  expect(document.activeElement).toBe(element);

  // Test escape key
  const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
  element.dispatchEvent(escapeEvent);
  
  return true;
};

// Performance testing utilities
export const measureRenderTime = async (component: React.ReactElement) => {
  const start = performance.now();
  render(component);
  const end = performance.now();
  
  const renderTime = end - start;
  expect(renderTime).toBeLessThan(16); // Should render in under 16ms (60fps)
  
  return renderTime;
};

// Mock data for tests
export const mockProspects = [
  generateMockProspect({ cid: 'CID-001', companyName: 'Alpha Manufacturing' }),
  generateMockProspect({ cid: 'CID-002', companyName: 'Beta Industries', contactStatus: 'Warm' }),
  generateMockProspect({ cid: 'CID-003', companyName: 'Gamma Construction', contactStatus: 'Cold' }),
];

export const mockUsers = [
  generateMockUser({ username: 'admin', name: 'Kyle Admin', role: 'Admin' }),
  generateMockUser({ username: 'sales', name: 'Sarah Sales', role: 'Sales Rep' }),
];

export const mockOutreach = [
  generateMockOutreach({ outcome: 'Won', companyName: 'Alpha Manufacturing' }),
  generateMockOutreach({ outcome: 'Interested', companyName: 'Beta Industries' }),
  generateMockOutreach({ outcome: 'Not Interested', companyName: 'Gamma Construction' }),
];

// Test assertion helpers
export const expectElementToBeAccessible = async (element: HTMLElement) => {
  // Check for basic accessibility attributes
  if (element.tagName === 'BUTTON') {
    expect(element).toHaveAttribute('type');
    expect(element.getAttribute('aria-label') || element.textContent).toBeTruthy();
  }
  
  if (element.tagName === 'INPUT') {
    expect(element).toHaveAttribute('id');
    const label = element.getAttribute('aria-label') || 
                 document.querySelector(`label[for="${element.id}"]`);
    expect(label).toBeTruthy();
  }
};

export const expectComponentToRender = (component: React.ReactElement) => {
  const { container } = render(component);
  expect(container.firstChild).toBeInTheDocument();
};

// Mock functions for testing
export const mockOnClick = jest.fn();
export const mockOnChange = jest.fn();
export const mockOnSubmit = jest.fn();
export const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Cleanup function
export const cleanup = () => {
  jest.clearAllMocks();
  mockConsoleError.mockRestore();
};

// Setup and teardown
beforeEach(() => {
  setupTests();
  jest.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
