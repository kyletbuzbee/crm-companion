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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Promise = exports.loadComponent = exports.withLazyLoading = exports.useBundleSize = exports.PerformanceTracker = exports.useExpensiveMemo = exports.useIntersectionObserver = exports.useDebounce = exports.BarChart = exports.ProspectCard = void 0;
exports.useVirtualScroll = useVirtualScroll;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = __importStar(require("react"));
exports.ProspectCard = (0, react_1.memo)(function (_a) {
    var prospect = _a.prospect, onEmailClick = _a.onEmailClick, onLogVisit = _a.onLogVisit, _b = _a.className, className = _b === void 0 ? '' : _b;
    var getNextActionRecommendation = (0, react_1.useCallback)(function (p) {
        var daysSinceTouch = p.lastOutreachDate
            ? Math.ceil((Date.now() - new Date(p.lastOutreachDate).getTime()) / (1000 * 60 * 60 * 24))
            : 999;
        var isOverdue = p.nextVisitDate && new Date(p.nextVisitDate) < new Date();
        if (p.contactStatus === 'Hot' && (isOverdue || daysSinceTouch > 5)) {
            return {
                action: 'Call Immediately',
                urgency: 'critical',
                icon: '🔥',
                reason: "Hot lead risk! ".concat(daysSinceTouch, " days silence."),
                dueDate: 'Today'
            };
        }
        if (p.lastOutcome === 'Send Info' && daysSinceTouch > 7) {
            return {
                action: 'Send Pricing',
                urgency: 'high',
                icon: '📧',
                reason: 'Info requested. Send quote now.',
                dueDate: 'This Week'
            };
        }
        if (p.contactStatus === 'Warm' && daysSinceTouch > 14) {
            return {
                action: 'Check-In Call',
                urgency: 'medium',
                icon: '📞',
                reason: 'Maintain relationship warmth.',
                dueDate: 'Next 7 Days'
            };
        }
        return {
            action: 'Site Visit',
            urgency: 'medium',
            icon: '🚗',
            reason: 'Face time builds trust.',
            dueDate: 'This Month'
        };
    }, []);
    var recommendation = (0, react_1.useMemo)(function () { return getNextActionRecommendation(prospect); }, [prospect, getNextActionRecommendation]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all ".concat(className), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start mb-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-xl text-gray-800", children: prospect.companyName }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm text-gray-500 mt-1", children: [prospect.address, " \u2022 ", prospect.industry] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-xs font-bold px-3 py-1.5 rounded-full mb-2 inline-block ".concat(prospect.winProbability > 70
                                    ? 'bg-green-100 text-green-800'
                                    : prospect.winProbability > 30
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'), children: [prospect.winProbability, "% Win"] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500", children: ["Priority: ", prospect.priority] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-3 p-4 rounded-lg border-2 flex items-center gap-3 ".concat(recommendation.urgency === 'critical'
                    ? 'bg-red-50 border-red-300'
                    : recommendation.urgency === 'high'
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-gray-50 border-gray-200'), children: [(0, jsx_runtime_1.jsx)("div", { className: "text-3xl", children: recommendation.icon }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs font-bold uppercase tracking-wide text-gray-500", children: "AI Recommendation" }), (0, jsx_runtime_1.jsx)("div", { className: "font-bold text-gray-800 mt-1", children: recommendation.action }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-600 mt-1", children: recommendation.reason })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs font-bold text-gray-500", children: "Due" }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm font-semibold ".concat(recommendation.urgency === 'critical' ? 'text-red-600' : 'text-gray-700'), children: recommendation.dueDate })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: function () { return onEmailClick(prospect.cid); }, className: "flex-1 py-2 text-sm font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors", children: "\uD83D\uDCE7 Email" }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return onLogVisit(prospect.cid); }, className: "flex-1 py-2 text-sm font-semibold bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors", children: "\u2713 Log Visit" }), (0, jsx_runtime_1.jsx)("button", { className: "flex-1 py-2 text-sm font-semibold bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors", children: "\uD83D\uDCCD Map" })] })] }));
}, function (prevProps, nextProps) {
    // Custom comparison function for more granular memoization
    return (prevProps.prospect.cid === nextProps.prospect.cid &&
        prevProps.prospect.companyName === nextProps.prospect.companyName &&
        prevProps.prospect.contactStatus === nextProps.prospect.contactStatus &&
        prevProps.prospect.winProbability === nextProps.prospect.winProbability &&
        prevProps.prospect.priority === nextProps.prospect.priority &&
        prevProps.prospect.lastOutcome === nextProps.prospect.lastOutcome &&
        prevProps.prospect.lastOutreachDate === nextProps.prospect.lastOutreachDate &&
        prevProps.prospect.nextVisitDate === nextProps.prospect.nextVisitDate);
});
exports.BarChart = (0, react_1.memo)(function (_a) {
    var data = _a.data, labels = _a.labels, title = _a.title;
    var max = (0, react_1.useMemo)(function () { return Math.max.apply(Math, __spreadArray(__spreadArray([], data, false), [1], false)); }, [data]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-48", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 mb-3 font-semibold", children: title }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-end space-x-3 flex-1", children: data.map(function (val, i) { return ((0, jsx_runtime_1.jsxs)("div", { className: "flex-1 flex flex-col items-center group", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t relative hover:from-green-700 hover:to-green-500 transition-all shadow-sm", style: { height: "".concat((val / max) * 100, "%"), minHeight: val > 0 ? '8px' : '0' }, children: (0, jsx_runtime_1.jsx)("div", { className: "absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold", children: val }) }), (0, jsx_runtime_1.jsx)("div", { className: "text-[10px] text-gray-600 mt-2 truncate w-full text-center font-medium", children: labels[i] })] }, "".concat(labels[i], "-").concat(val))); }) })] }));
});
// ============================================================================
// CUSTOM HOOKS FOR PERFORMANCE
// ============================================================================
// Debounced search hook
var useDebounce = function (value, delay) {
    var _a = (0, react_1.useState)(value), debouncedValue = _a[0], setDebouncedValue = _a[1];
    (0, react_1.useEffect)(function () {
        var handler = setTimeout(function () {
            setDebouncedValue(value);
        }, delay);
        return function () {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};
exports.useDebounce = useDebounce;
function useVirtualScroll(_a) {
    var items = _a.items, itemHeight = _a.itemHeight, containerHeight = _a.containerHeight, renderItem = _a.renderItem, _b = _a.overscan, overscan = _b === void 0 ? 5 : _b;
    var _c = (0, react_1.useState)(0), scrollTop = _c[0], setScrollTop = _c[1];
    var visibleStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    var visibleEndIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
    var visibleItems = (0, react_1.useMemo)(function () {
        return items.slice(visibleStartIndex, visibleEndIndex + 1).map(function (item, index) { return ({
            item: item,
            index: visibleStartIndex + index,
            top: (visibleStartIndex + index) * itemHeight
        }); });
    }, [items, visibleStartIndex, visibleEndIndex, itemHeight]);
    var totalHeight = items.length * itemHeight;
    var handleScroll = (0, react_1.useCallback)(function (e) {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);
    return {
        visibleItems: visibleItems,
        totalHeight: totalHeight,
        handleScroll: handleScroll,
        scrollTop: scrollTop
    };
}
// Intersection Observer hook for lazy loading
var useIntersectionObserver = function (options) {
    if (options === void 0) { options = {}; }
    var _a = (0, react_1.useState)(false), isIntersecting = _a[0], setIsIntersecting = _a[1];
    var _b = (0, react_1.useState)(null), target = _b[0], setTarget = _b[1];
    var ref = (0, react_1.useCallback)(function (node) {
        if (node !== null) {
            setTarget(node);
        }
    }, []);
    (0, react_1.useEffect)(function () {
        if (!target)
            return;
        var observer = new IntersectionObserver(function (_a) {
            var entry = _a[0];
            setIsIntersecting(entry.isIntersecting);
        }, options);
        observer.observe(target);
        return function () {
            observer.unobserve(target);
        };
    }, [target, options]);
    return [ref, isIntersecting];
};
exports.useIntersectionObserver = useIntersectionObserver;
// Memoized expensive calculation hook
var useExpensiveMemo = function (factory, dependencies, enabled) {
    if (enabled === void 0) { enabled = true; }
    return (0, react_1.useMemo)(function () {
        if (!enabled) {
            return factory();
        }
        return factory();
    }, dependencies);
};
exports.useExpensiveMemo = useExpensiveMemo;
// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================
// Performance tracking component
var PerformanceTracker = function (_a) {
    var children = _a.children, name = _a.name;
    var renderStart = (0, react_1.useRef)(0);
    var renderEnd = (0, react_1.useRef)(0);
    (0, react_1.useLayoutEffect)(function () {
        renderStart.current = performance.now();
    });
    (0, react_1.useEffect)(function () {
        renderEnd.current = performance.now();
        var renderTime = renderEnd.current - renderStart.current;
        if (process.env.NODE_ENV === 'development') {
            console.log("[Performance] ".concat(name, " render time: ").concat(renderTime.toFixed(2), "ms"));
        }
        // In production, you might want to send this to analytics
        if (renderTime > 16) { // If render takes longer than 16ms (60fps)
            console.warn("[Performance Warning] ".concat(name, " render time exceeded 16ms: ").concat(renderTime.toFixed(2), "ms"));
        }
    });
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children });
};
exports.PerformanceTracker = PerformanceTracker;
// Bundle size analyzer (development only)
var useBundleSize = function () {
    (0, react_1.useEffect)(function () {
        if (process.env.NODE_ENV === 'development' && 'performance' in window) {
            var navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                var bundleSize = navigation.transferSize;
                console.log("[Bundle Analysis] Total bundle size: ".concat((bundleSize / 1024).toFixed(2), "KB"));
                if (bundleSize > 1024 * 1024) { // > 1MB
                    console.warn('[Bundle Warning] Bundle size exceeds 1MB. Consider code splitting.');
                }
            }
        }
    }, []);
};
exports.useBundleSize = useBundleSize;
// ============================================================================
// CODE SPLITTING UTILITIES
// ============================================================================
// Lazy loading wrapper with error boundary
var withLazyLoading = function (importFunc, fallback) {
    var LazyComponent = react_1.default.lazy(importFunc);
    return function (props) { return ((0, jsx_runtime_1.jsx)(react_1.default.Suspense, { fallback: fallback ? (0, jsx_runtime_1.jsx)("fallback", {}) : (0, jsx_runtime_1.jsx)("div", { children: "Loading..." }), children: (0, jsx_runtime_1.jsx)(LazyComponent, __assign({}, props)) })); };
};
exports.withLazyLoading = withLazyLoading;
// Dynamic import for components
exports.loadComponent = async(importFunc, function () { return exports.Promise; });
(0, jsx_runtime_1.jsx)(T, {}) | null > ;
{
    try {
        return await importFunc();
    }
    catch (error) {
        console.error('Failed to load component:', error);
        return null;
    }
}
;
