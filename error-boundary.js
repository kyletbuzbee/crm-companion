"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorBoundary = exports.ErrorBoundary = void 0;
exports.withErrorBoundary = withErrorBoundary;
exports.useErrorHandler = useErrorHandler;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
// Enhanced Error Boundary with better error handling
var ErrorBoundary = /** @class */ (function (_super) {
    __extends(ErrorBoundary, _super);
    function ErrorBoundary(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { hasError: false };
        return _this;
    }
    ErrorBoundary.getDerivedStateFromError = function (error) {
        return {
            hasError: true,
            error: error
        };
    };
    ErrorBoundary.prototype.componentDidCatch = function (error, errorInfo) {
        var _a, _b;
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
        // Call custom error handler if provided
        (_b = (_a = this.props).onError) === null || _b === void 0 ? void 0 : _b.call(_a, error, errorInfo);
        // In production, you might want to log this to an error reporting service
        if (process.env.NODE_ENV === 'production') {
            // Example: logErrorToService(error, errorInfo);
        }
    };
    ErrorBoundary.prototype.render = function () {
        var _this = this;
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Default error UI
            return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-6xl mb-4", children: "\u26A0\uFE0F" }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-800 mb-4", children: "Something went wrong" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-6", children: "We encountered an unexpected error. Please refresh the page or contact support if the problem persists." }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: function () { return window.location.reload(); }, className: "w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors", children: "Refresh Page" }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return _this.setState({ hasError: false, error: undefined }); }, className: "w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors", children: "Try Again" })] }), process.env.NODE_ENV === 'development' && this.state.error && ((0, jsx_runtime_1.jsxs)("details", { className: "mt-4 text-left", children: [(0, jsx_runtime_1.jsx)("summary", { className: "cursor-pointer text-sm text-gray-500 hover:text-gray-700", children: "Error Details (Development)" }), (0, jsx_runtime_1.jsxs)("pre", { className: "mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto text-red-600", children: [this.state.error.toString(), this.state.error.stack] })] }))] }) }));
        }
        return this.props.children;
    };
    return ErrorBoundary;
}(react_1.Component));
exports.ErrorBoundary = ErrorBoundary;
// Higher-order component for easier error boundary usage
function withErrorBoundary(Component, errorBoundaryProps) {
    var WrappedComponent = function (props) { return ((0, jsx_runtime_1.jsx)(ErrorBoundary, __assign({}, errorBoundaryProps, { children: (0, jsx_runtime_1.jsx)(Component, __assign({}, props)) }))); };
    WrappedComponent.displayName = "withErrorBoundary(".concat(Component.displayName || Component.name, ")");
    return WrappedComponent;
}
// Hook for error handling in functional components
function useErrorHandler() {
    return function (error, errorInfo) {
        console.error('Error caught by useErrorHandler:', error, errorInfo);
        // In production, send to error reporting service
        if (process.env.NODE_ENV === 'production') {
            // Example: logErrorToService(error, errorInfo);
        }
    };
}
var ApiErrorBoundary = /** @class */ (function (_super) {
    __extends(ApiErrorBoundary, _super);
    function ApiErrorBoundary(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { hasError: false };
        return _this;
    }
    ApiErrorBoundary.getDerivedStateFromError = function (error) {
        // Check if it's an API-related error
        if (error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('API') ||
            error.name === 'NetworkError' ||
            error.name === 'TypeError') {
            return { hasError: true, error: error };
        }
        // Re-throw non-API errors
        throw error;
    };
    ApiErrorBoundary.prototype.componentDidCatch = function (error, errorInfo) {
        var _a, _b;
        (_b = (_a = this.props).onApiError) === null || _b === void 0 ? void 0 : _b.call(_a, error);
        console.error('API Error Boundary caught an error:', error, errorInfo);
    };
    ApiErrorBoundary.prototype.render = function () {
        var _this = this;
        if (this.state.hasError) {
            return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-4xl mb-4", children: "\uD83D\uDD0C" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-red-800 mb-2", children: "Connection Error" }), (0, jsx_runtime_1.jsx)("p", { className: "text-red-600 mb-4", children: "Unable to connect to the server. Please check your internet connection and try again." }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return _this.setState({ hasError: false, error: undefined }); }, className: "bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors", children: "Retry" })] }));
        }
        return this.props.children;
    };
    return ApiErrorBoundary;
}(react_1.Component));
exports.ApiErrorBoundary = ApiErrorBoundary;
