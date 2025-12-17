"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = __importDefault(require("react"));
var react_2 = require("@testing-library/react");
var accessibility_enhanced_1 = require("./accessibility-enhanced");
// Mock IntersectionObserver and matchMedia
global.IntersectionObserver = jest.fn().mockImplementation(function () { return ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn(),
}); });
window.matchMedia = jest.fn().mockImplementation(function (query) { return ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
}); });
describe('SkipNavigation', function () {
    it('renders skip navigation link', function () {
        (0, react_2.render)((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(accessibility_enhanced_1.SkipNavigation, {}), (0, jsx_runtime_1.jsx)("main", { id: "main", children: "Main content" })] }));
        var skipLink = react_2.screen.getByText('Skip to main content');
        expect(skipLink).toBeInTheDocument();
        expect(skipLink).toHaveAttribute('href', '#main');
    });
    it('becomes visible on Tab key press', function () { return __awaiter(void 0, void 0, void 0, function () {
        var skipLink;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, react_2.render)((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(accessibility_enhanced_1.SkipNavigation, {}), (0, jsx_runtime_1.jsx)("main", { id: "main", children: "Main content" })] }));
                    skipLink = react_2.screen.getByText('Skip to main content');
                    // Initially not visible (off-screen)
                    expect(skipLink).toHaveClass('skip-nav');
                    expect(skipLink).not.toHaveClass('skip-nav-visible');
                    // Press Tab to make visible
                    react_2.fireEvent.keyDown(skipLink, { key: 'Tab' });
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(skipLink).toHaveClass('skip-nav-visible');
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('LiveRegion', function () {
    it('renders children and manages announcements', function () { return __awaiter(void 0, void 0, void 0, function () {
        var liveRegion;
        return __generator(this, function (_a) {
            (0, react_2.render)((0, jsx_runtime_1.jsx)(accessibility_enhanced_1.LiveRegion, { message: "Test announcement", children: (0, jsx_runtime_1.jsx)("div", { children: "Test content" }) }));
            // Children should render
            expect(react_2.screen.getByText('Test content')).toBeInTheDocument();
            liveRegion = document.querySelector('[aria-live]');
            expect(liveRegion).toBeInTheDocument();
            expect(liveRegion).toHaveAttribute('aria-live', 'polite');
            return [2 /*return*/];
        });
    }); });
    it('handles assertive announcements', function () {
        (0, react_2.render)((0, jsx_runtime_1.jsx)(accessibility_enhanced_1.LiveRegion, { message: "Error message", priority: "assertive", children: (0, jsx_runtime_1.jsx)("div", { children: "Content" }) }));
        var liveRegion = document.querySelector('[aria-live="assertive"]');
        expect(liveRegion).toBeInTheDocument();
    });
});
describe('AccessibleModal', function () {
    var mockOnClose = jest.fn();
    beforeEach(function () {
        mockOnClose.mockClear();
    });
    it('renders modal when open', function () {
        (0, react_2.render)((0, jsx_runtime_1.jsx)(accessibility_enhanced_1.AccessibleModal, { isOpen: true, onClose: mockOnClose, title: "Test Modal", children: (0, jsx_runtime_1.jsx)("div", { children: "Modal content" }) }));
        expect(react_2.screen.getByText('Test Modal')).toBeInTheDocument();
        expect(react_2.screen.getByText('Modal content')).toBeInTheDocument();
    });
    it('does not render when closed', function () {
        (0, react_2.render)((0, jsx_runtime_1.jsx)(accessibility_enhanced_1.AccessibleModal, { isOpen: false, onClose: mockOnClose, title: "Test Modal", children: (0, jsx_runtime_1.jsx)("div", { children: "Modal content" }) }));
        expect(react_2.screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });
    it('closes on overlay click', function () {
        (0, react_2.render)((0, jsx_runtime_1.jsx)(accessibility_enhanced_1.AccessibleModal, { isOpen: true, onClose: mockOnClose, title: "Test Modal", children: (0, jsx_runtime_1.jsx)("div", { children: "Modal content" }) }));
        var overlay = document.querySelector('.fixed.inset-0');
        react_2.fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
    it('closes on Escape key press', function () {
        (0, react_2.render)((0, jsx_runtime_1.jsx)(accessibility_enhanced_1.AccessibleModal, { isOpen: true, onClose: mockOnClose, title: "Test Modal", children: (0, jsx_runtime_1.jsx)("div", { children: "Modal content" }) }));
        react_2.fireEvent.keyDown(document, { key: 'Escape' });
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
    it('has proper ARIA attributes', function () {
        (0, react_2.render)((0, jsx_runtime_1.jsx)(accessibility_enhanced_1.AccessibleModal, { isOpen: true, onClose: mockOnClose, title: "Test Modal", children: (0, jsx_runtime_1.jsx)("div", { children: "Modal content" }) }));
        var modal = document.querySelector('[role="dialog"]');
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveAttribute('aria-modal', 'true');
        var title = document.querySelector('#modal-title');
        expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
        expect(title).toBeInTheDocument();
    });
});
describe('useFocusManagement', function () {
    it('traps focus within container', function () {
        var TestComponent = function () {
            var trapFocus = (0, accessibility_enhanced_1.useFocusManagement)().trapFocus;
            var containerRef = react_1.default.useRef(null);
            react_1.default.useEffect(function () {
                if (containerRef.current) {
                    trapFocus(containerRef.current);
                }
            }, [trapFocus]);
            return ((0, jsx_runtime_1.jsxs)("div", { ref: containerRef, children: [(0, jsx_runtime_1.jsx)("button", { children: "Button 1" }), (0, jsx_runtime_1.jsx)("button", { children: "Button 2" })] }));
        };
        (0, react_2.render)((0, jsx_runtime_1.jsx)(TestComponent, {}));
        // First button should be focused
        expect(document.activeElement).toHaveTextContent('Button 1');
        // Tab to next button
        react_2.fireEvent.keyDown(document, { key: 'Tab' });
        expect(document.activeElement).toHaveTextContent('Button 2');
        // Tab should wrap back to first button
        react_2.fireEvent.keyDown(document, { key: 'Tab' });
        expect(document.activeElement).toHaveTextContent('Button 1');
    });
});
describe('useHighContrast', function () {
    it('detects high contrast preference', function () {
        var TestComponent = function () {
            var isHighContrast = (0, accessibility_enhanced_1.useHighContrast)().isHighContrast;
            return (0, jsx_runtime_1.jsx)("div", { children: isHighContrast ? 'High Contrast' : 'Normal' });
        };
        (0, react_2.render)((0, jsx_runtime_1.jsx)(TestComponent, {}));
        // Should show 'Normal' since we mocked matchMedia to return false
        expect(react_2.screen.getByText('Normal')).toBeInTheDocument();
    });
});
describe('useKeyboardNavigation', function () {
    var mockCallback = jest.fn();
    beforeEach(function () {
        mockCallback.mockClear();
    });
    it('calls callback on key press', function () {
        var TestComponent = function () {
            (0, accessibility_enhanced_1.useKeyboardNavigation)(mockCallback);
            return (0, jsx_runtime_1.jsx)("div", { children: "Test" });
        };
        (0, react_2.render)((0, jsx_runtime_1.jsx)(TestComponent, {}));
        react_2.fireEvent.keyDown(document, { key: 'Enter' });
        expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter' }));
    });
    it('does not call callback when disabled', function () {
        var TestComponent = function () {
            (0, accessibility_enhanced_1.useKeyboardNavigation)(mockCallback, false);
            return (0, jsx_runtime_1.jsx)("div", { children: "Test" });
        };
        (0, react_2.render)((0, jsx_runtime_1.jsx)(TestComponent, {}));
        react_2.fireEvent.keyDown(document, { key: 'Enter' });
        expect(mockCallback).not.toHaveBeenCalled();
    });
});
// Accessibility compliance tests
describe('Accessibility Compliance', function () {
    it('ensures all interactive elements are keyboard accessible', function () {
        var TestComponent = function () { return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: function () { }, children: "Button" }), (0, jsx_runtime_1.jsx)("input", { type: "text", "aria-label": "Text input" }), (0, jsx_runtime_1.jsx)("select", { "aria-label": "Select", children: (0, jsx_runtime_1.jsx)("option", { children: "Option" }) })] })); };
        (0, react_2.render)((0, jsx_runtime_1.jsx)(TestComponent, {}));
        var button = react_2.screen.getByRole('button');
        var input = react_2.screen.getByLabelText('Text input');
        var select = react_2.screen.getByLabelText('Select');
        // Test keyboard navigation
        button.focus();
        expect(document.activeElement).toBe(button);
        input.focus();
        expect(document.activeElement).toBe(input);
        select.focus();
        expect(document.activeElement).toBe(select);
    });
    it('ensures form elements have proper labels', function () {
        var TestComponent = function () { return ((0, jsx_runtime_1.jsxs)("form", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "test-input", children: "Test Input" }), (0, jsx_runtime_1.jsx)("input", { id: "test-input", type: "text" }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox" }), "Checkbox Label"] })] })); };
        (0, react_2.render)((0, jsx_runtime_1.jsx)(TestComponent, {}));
        var input = react_2.screen.getByLabelText('Test Input');
        var checkbox = react_2.screen.getByLabelText('Checkbox Label');
        expect(input).toHaveAttribute('id', 'test-input');
        expect(checkbox).toBeInTheDocument();
    });
});
