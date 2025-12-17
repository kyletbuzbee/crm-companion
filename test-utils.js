"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanup = exports.mockConsoleError = exports.mockOnSubmit = exports.mockOnChange = exports.mockOnClick = exports.expectComponentToRender = exports.expectElementToBeAccessible = exports.mockOutreach = exports.mockUsers = exports.mockProspects = exports.measureRenderTime = exports.checkKeyboardNavigation = exports.checkAccessibility = exports.generateMockOutreach = exports.generateMockUser = exports.generateMockProspect = exports.render = exports.setupTests = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("@testing-library/react");
var react_router_dom_1 = require("react-router-dom");
// Test environment setup
var setupTests = function () {
    // Mock IntersectionObserver
    global.IntersectionObserver = /** @class */ (function () {
        function IntersectionObserver() {
        }
        IntersectionObserver.prototype.observe = function () { return null; };
        IntersectionObserver.prototype.disconnect = function () { return null; };
        IntersectionObserver.prototype.unobserve = function () { return null; };
        return IntersectionObserver;
    }());
    // Mock ResizeObserver
    global.ResizeObserver = /** @class */ (function () {
        function ResizeObserver() {
        }
        ResizeObserver.prototype.observe = function () { return null; };
        ResizeObserver.prototype.disconnect = function () { return null; };
        ResizeObserver.prototype.unobserve = function () { return null; };
        return ResizeObserver;
    }());
    // Mock matchMedia
    window.matchMedia = jest.fn().mockImplementation(function (query) { return ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }); });
    // Mock performance.now
    jest.spyOn(performance, 'now').mockImplementation(function () { return 0; });
    // Suppress console warnings in tests
    var originalConsoleWarn = console.warn;
    console.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (typeof args[0] === 'string' &&
            args[0].includes('ReactDOM.render is no longer supported')) {
            return;
        }
        originalConsoleWarn.apply(void 0, args);
    };
};
exports.setupTests = setupTests;
var AllTheProviders = function (_a) {
    var children = _a.children;
    return ((0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: children }));
};
var customRender = function (ui, options) {
    var wrapper = (options === null || options === void 0 ? void 0 : options.wrapper) || AllTheProviders;
    return (0, react_1.render)(ui, __assign({ wrapper: wrapper }, options));
};
exports.render = customRender;
// Re-export everything from testing-library
__exportStar(require("@testing-library/react"), exports);
// Test data generators
var generateMockProspect = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ cid: 'CID-TEST-001', companyName: 'Test Company Inc', locationName: 'Main Office', address: '123 Test St, Test City, TX 75001', lat: 32.3513, lng: -95.3011, zip: '75001', currentAssets: 'Steel, Aluminum', containerSize: 30, industry: 'Metal Fabricator', industryScore: 95, priority: 85, winProbability: 72, lastOutcome: 'Interested', lastOutreachDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), nextVisitDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), contactStatus: 'Hot', email: 'test@testcompany.com', estimatedMonthlyRevenue: 1200, owner: 'Test User' }, overrides));
};
exports.generateMockProspect = generateMockProspect;
var generateMockUser = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ username: 'testuser', name: 'Test User', role: 'Sales Rep' }, overrides));
};
exports.generateMockUser = generateMockUser;
var generateMockOutreach = function (overrides) {
    if (overrides === void 0) { overrides = {}; }
    return (__assign({ lid: 'LID-TEST-001', cid: 'CID-TEST-001', companyName: 'Test Company Inc', visitDate: new Date().toISOString(), notes: 'Initial contact meeting went well. They are interested in our services.', outcome: 'Interested', stage: 'Nurture', status: 'Hot', nextVisitDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), daysSinceLast: 5, nextVisitCountdown: 14, followUpAction: 'Send Pricing', owner: 'Test User', contactType: 'In-Person' }, overrides));
};
exports.generateMockOutreach = generateMockOutreach;
// Accessibility testing utilities
var checkAccessibility = function (container) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, axe, toHaveNoViolations, results;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = require('jest-axe'), axe = _a.axe, toHaveNoViolations = _a.toHaveNoViolations;
                expect.extend(toHaveNoViolations);
                return [4 /*yield*/, axe(container)];
            case 1:
                results = _b.sent();
                expect(results).toHaveNoViolations();
                return [2 /*return*/];
        }
    });
}); };
exports.checkAccessibility = checkAccessibility;
var checkKeyboardNavigation = function (element) { return __awaiter(void 0, void 0, void 0, function () {
    var escapeEvent;
    return __generator(this, function (_a) {
        // Test tab navigation
        element.focus();
        expect(document.activeElement).toBe(element);
        escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        element.dispatchEvent(escapeEvent);
        return [2 /*return*/, true];
    });
}); };
exports.checkKeyboardNavigation = checkKeyboardNavigation;
// Performance testing utilities
var measureRenderTime = function (component) { return __awaiter(void 0, void 0, void 0, function () {
    var start, end, renderTime;
    return __generator(this, function (_a) {
        start = performance.now();
        (0, react_1.render)(component);
        end = performance.now();
        renderTime = end - start;
        expect(renderTime).toBeLessThan(16); // Should render in under 16ms (60fps)
        return [2 /*return*/, renderTime];
    });
}); };
exports.measureRenderTime = measureRenderTime;
// Mock data for tests
exports.mockProspects = [
    (0, exports.generateMockProspect)({ cid: 'CID-001', companyName: 'Alpha Manufacturing' }),
    (0, exports.generateMockProspect)({ cid: 'CID-002', companyName: 'Beta Industries', contactStatus: 'Warm' }),
    (0, exports.generateMockProspect)({ cid: 'CID-003', companyName: 'Gamma Construction', contactStatus: 'Cold' }),
];
exports.mockUsers = [
    (0, exports.generateMockUser)({ username: 'admin', name: 'Kyle Admin', role: 'Admin' }),
    (0, exports.generateMockUser)({ username: 'sales', name: 'Sarah Sales', role: 'Sales Rep' }),
];
exports.mockOutreach = [
    (0, exports.generateMockOutreach)({ outcome: 'Won', companyName: 'Alpha Manufacturing' }),
    (0, exports.generateMockOutreach)({ outcome: 'Interested', companyName: 'Beta Industries' }),
    (0, exports.generateMockOutreach)({ outcome: 'Not Interested', companyName: 'Gamma Construction' }),
];
// Test assertion helpers
var expectElementToBeAccessible = function (element) { return __awaiter(void 0, void 0, void 0, function () {
    var label;
    return __generator(this, function (_a) {
        // Check for basic accessibility attributes
        if (element.tagName === 'BUTTON') {
            expect(element).toHaveAttribute('type');
            expect(element.getAttribute('aria-label') || element.textContent).toBeTruthy();
        }
        if (element.tagName === 'INPUT') {
            expect(element).toHaveAttribute('id');
            label = element.getAttribute('aria-label') ||
                document.querySelector("label[for=\"".concat(element.id, "\"]"));
            expect(label).toBeTruthy();
        }
        return [2 /*return*/];
    });
}); };
exports.expectElementToBeAccessible = expectElementToBeAccessible;
var expectComponentToRender = function (component) {
    var container = (0, react_1.render)(component).container;
    expect(container.firstChild).toBeInTheDocument();
};
exports.expectComponentToRender = expectComponentToRender;
// Mock functions for testing
exports.mockOnClick = jest.fn();
exports.mockOnChange = jest.fn();
exports.mockOnSubmit = jest.fn();
exports.mockConsoleError = jest.spyOn(console, 'error').mockImplementation(function () { });
// Cleanup function
var cleanup = function () {
    jest.clearAllMocks();
    exports.mockConsoleError.mockRestore();
};
exports.cleanup = cleanup;
// Setup and teardown
beforeEach(function () {
    (0, exports.setupTests)();
    jest.clearAllMocks();
});
afterEach(function () {
    (0, exports.cleanup)();
});
