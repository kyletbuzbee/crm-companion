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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.highContrastStyles = exports.skipNavStyles = exports.srOnlyStyles = exports.usePageAnnouncements = exports.AccessibleModal = exports.useKeyboardNavigation = exports.useHighContrast = exports.useFocusManagement = exports.LiveRegion = exports.SkipNavigation = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
// Skip navigation component for screen readers
var SkipNavigation = function () {
    var _a = (0, react_1.useState)(false), isVisible = _a[0], setIsVisible = _a[1];
    (0, react_1.useEffect)(function () {
        var handleKeyDown = function (event) {
            if (event.key === 'Tab') {
                setIsVisible(true);
            }
        };
        var handleBlur = function () {
            setIsVisible(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('click', handleBlur);
        return function () {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleBlur);
        };
    }, []);
    return ((0, jsx_runtime_1.jsx)("a", { href: "#main", className: "skip-nav ".concat(isVisible ? 'skip-nav-visible' : ''), onFocus: function () { return setIsVisible(true); }, onBlur: function () { return setIsVisible(false); }, children: "Skip to main content" }));
};
exports.SkipNavigation = SkipNavigation;
// ARIA Live Region for dynamic content announcements
var LiveRegion = function (_a) {
    var children = _a.children, message = _a.message, _b = _a.priority, priority = _b === void 0 ? 'polite' : _b, props = __rest(_a, ["children", "message", "priority"]);
    var _c = (0, react_1.useState)([]), announcements = _c[0], setAnnouncements = _c[1];
    var liveRegionRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        if (message && liveRegionRef.current) {
            // Clear previous announcements to ensure screen readers announce new content
            setAnnouncements([]);
            // Use setTimeout to ensure DOM update before announcement
            setTimeout(function () {
                setAnnouncements([message]);
            }, 100);
        }
    }, [message]);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { ref: liveRegionRef, "aria-live": priority, "aria-atomic": "true", className: "sr-only", "data-testid": props['data-testid'] || 'live-region', children: announcements.map(function (announcement, index) { return ((0, jsx_runtime_1.jsx)("div", { children: announcement }, index)); }) }), children] }));
};
exports.LiveRegion = LiveRegion;
// Focus management utilities
var useFocusManagement = function () {
    var focusableElementsSelector = [
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
    var trapFocus = function (containerElement) {
        var focusableElements = Array.from(containerElement.querySelectorAll(focusableElementsSelector)).filter(function (el) { return el.offsetParent !== null; });
        var firstFocusableElement = focusableElements[0];
        var lastFocusableElement = focusableElements[focusableElements.length - 1];
        var handleTabKey = function (event) {
            if (event.key !== 'Tab')
                return;
            if (event.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusableElement) {
                    event.preventDefault();
                    lastFocusableElement === null || lastFocusableElement === void 0 ? void 0 : lastFocusableElement.focus();
                }
            }
            else {
                // Tab
                if (document.activeElement === lastFocusableElement) {
                    event.preventDefault();
                    firstFocusableElement === null || firstFocusableElement === void 0 ? void 0 : firstFocusableElement.focus();
                }
            }
        };
        containerElement.addEventListener('keydown', handleTabKey);
        // Focus the first element
        firstFocusableElement === null || firstFocusableElement === void 0 ? void 0 : firstFocusableElement.focus();
        return function () {
            containerElement.removeEventListener('keydown', handleTabKey);
        };
    };
    var restoreFocus = function (element) {
        if (element) {
            element.focus();
        }
    };
    var setInitialFocus = function (containerElement) {
        var focusableElements = Array.from(containerElement.querySelectorAll(focusableElementsSelector)).filter(function (el) { return el.offsetParent !== null; });
        // Prefer elements with data-autofocus attribute
        var autoFocusElement = focusableElements.find(function (el) {
            return el.hasAttribute('data-autofocus') || el.getAttribute('autofocus') !== null;
        });
        if (autoFocusElement) {
            autoFocusElement.focus();
        }
        else if (focusableElements[0]) {
            focusableElements[0].focus();
        }
    };
    return { trapFocus: trapFocus, restoreFocus: restoreFocus, setInitialFocus: setInitialFocus };
};
exports.useFocusManagement = useFocusManagement;
// High contrast mode detection and support
var useHighContrast = function () {
    var _a = (0, react_1.useState)(false), isHighContrast = _a[0], setIsHighContrast = _a[1];
    (0, react_1.useEffect)(function () {
        var checkHighContrast = function () {
            // Check for high contrast mode via media query
            var highContrastQuery = window.matchMedia('(prefers-contrast: high)');
            setIsHighContrast(highContrastQuery.matches);
            // Listen for changes
            var handleChange = function (event) {
                setIsHighContrast(event.matches);
            };
            highContrastQuery.addEventListener('change', handleChange);
            return function () {
                highContrastQuery.removeEventListener('change', handleChange);
            };
        };
        var cleanup = checkHighContrast();
        return cleanup;
    }, []);
    (0, react_1.useEffect)(function () {
        // Apply high contrast class to body for CSS targeting
        if (isHighContrast) {
            document.body.classList.add('high-contrast');
        }
        else {
            document.body.classList.remove('high-contrast');
        }
    }, [isHighContrast]);
    return { isHighContrast: isHighContrast };
};
exports.useHighContrast = useHighContrast;
// Keyboard navigation handler
var useKeyboardNavigation = function (callback, enabled) {
    if (enabled === void 0) { enabled = true; }
    (0, react_1.useEffect)(function () {
        if (!enabled)
            return;
        var handleKeyDown = function (event) {
            callback(event);
        };
        document.addEventListener('keydown', handleKeyDown);
        return function () {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [callback, enabled]);
};
exports.useKeyboardNavigation = useKeyboardNavigation;
var AccessibleModal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, title = _a.title, children = _a.children, _b = _a.closeOnOverlayClick, closeOnOverlayClick = _b === void 0 ? true : _b, _c = _a.closeOnEscape, closeOnEscape = _c === void 0 ? true : _c, props = __rest(_a, ["isOpen", "onClose", "title", "children", "closeOnOverlayClick", "closeOnEscape"]);
    var modalRef = (0, react_1.useRef)(null);
    var previousActiveElement = (0, react_1.useRef)(null);
    var _d = (0, exports.useFocusManagement)(), trapFocus = _d.trapFocus, restoreFocus = _d.restoreFocus;
    (0, react_1.useEffect)(function () {
        if (isOpen) {
            // Store the currently focused element
            previousActiveElement.current = document.activeElement;
            // Focus trap after a short delay to ensure modal is rendered
            setTimeout(function () {
                if (modalRef.current) {
                    trapFocus(modalRef.current);
                }
            }, 100);
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
        else {
            // Restore focus to previously focused element
            restoreFocus(previousActiveElement.current);
            // Re-enable body scroll
            document.body.style.overflow = '';
        }
        return function () {
            document.body.style.overflow = '';
        };
    }, [isOpen, trapFocus, restoreFocus]);
    (0, react_1.useEffect)(function () {
        if (!closeOnEscape)
            return;
        var handleEscape = function (event) {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return function () { return document.removeEventListener('keydown', handleEscape); };
    }, [isOpen, onClose, closeOnEscape]);
    if (!isOpen)
        return null;
    var handleOverlayClick = function (event) {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
            onClose();
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", onClick: handleOverlayClick, role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-title", children: (0, jsx_runtime_1.jsxs)("div", __assign({ ref: modalRef, className: "bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", onClick: function (e) { return e.stopPropagation(); } }, props, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center p-4 border-b bg-green-900 text-white sticky top-0 z-10", children: [(0, jsx_runtime_1.jsx)("h2", { id: "modal-title", className: "text-lg font-bold", children: title }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-gray-300 hover:text-white text-2xl leading-none", "aria-label": "Close modal", "data-autofocus": true, children: "\u00D7" })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-6", children: children })] })) }));
};
exports.AccessibleModal = AccessibleModal;
// Announce page changes for screen readers
var usePageAnnouncements = function () {
    var announcePageChange = function (message) {
        var announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(function () {
            document.body.removeChild(announcement);
        }, 1000);
    };
    var announceError = function (message) {
        var announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(function () {
            document.body.removeChild(announcement);
        }, 1000);
    };
    return { announcePageChange: announcePageChange, announceError: announceError };
};
exports.usePageAnnouncements = usePageAnnouncements;
// Screen reader only utility class
exports.srOnlyStyles = "\n  .sr-only {\n    position: absolute;\n    width: 1px;\n    height: 1px;\n    padding: 0;\n    margin: -1px;\n    overflow: hidden;\n    clip: rect(0, 0, 0, 0);\n    white-space: nowrap;\n    border: 0;\n  }\n";
// Skip navigation styles
exports.skipNavStyles = "\n  .skip-nav {\n    position: absolute;\n    left: -9999px;\n    z-index: 999999;\n    padding: 8px 16px;\n    background: #000;\n    color: #fff;\n    text-decoration: none;\n    border-radius: 4px;\n    font-weight: bold;\n  }\n  \n  .skip-nav-visible {\n    left: 8px;\n    top: 8px;\n  }\n  \n  .skip-nav:focus {\n    left: 8px;\n    top: 8px;\n    outline: 2px solid #fff;\n    outline-offset: 2px;\n  }\n";
// High contrast mode styles
exports.highContrastStyles = "\n  .high-contrast {\n    filter: contrast(150%);\n  }\n  \n  .high-contrast button {\n    border: 2px solid currentColor !important;\n  }\n  \n  .high-contrast input,\n  .high-contrast select,\n  .high-contrast textarea {\n    border: 2px solid currentColor !important;\n  }\n  \n  .high-contrast .bg-gray-100 {\n    background-color: #ffffff !important;\n    border: 1px solid #000000 !important;\n  }\n  \n  .high-contrast .bg-gray-200 {\n    background-color: #f0f0f0 !important;\n    border: 1px solid #000000 !important;\n  }\n";
