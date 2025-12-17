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
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var client_1 = require("react-dom/client");
// ============================================================================
// CONSTANTS & DATA
// ============================================================================
var OUTCOME_MAPPING = {
    'Interested': { stage: 'Nurture', status: 'Hot', daysToAdd: 14 },
    'Not Interested': { stage: 'Lost', status: 'Cold', daysToAdd: 180 },
    'Has Vendor': { stage: 'Nurture', status: 'Warm', daysToAdd: 90 },
    'Won': { stage: 'Won', status: 'Active', daysToAdd: 7 },
    'No Scrap': { stage: 'Lost', status: 'Cold', daysToAdd: 180 },
    'Send Info': { stage: 'Nurture', status: 'Warm', daysToAdd: 14 },
    'Left Message': { stage: 'Nurture', status: 'Warm', daysToAdd: 7 },
    'Corporate/Manager Approval': { stage: 'Nurture', status: 'Warm', daysToAdd: 30 },
    'Bad Timing': { stage: 'Prospect', status: 'Cold', daysToAdd: 30 },
    'Follow Up': { stage: 'Prospect', status: 'Warm', daysToAdd: 14 }
};
var EMAIL_TEMPLATES = [
    {
        id: 'cold',
        name: 'Cold Outreach',
        subject: 'Roll-Off Container Services for {company_name}',
        body: "Hi there,\n\nI'm Kyle from K&L Recycling in Tyler, TX. I noticed {company_name} likely generates scrap metal.\n\nWe offer:\n- Roll-off containers (10-40yd) with flexible pickup\n- Top-dollar scrap pricing (we PAY you!)\n- FREE metal separation\n\nQuick 10-min call to discuss reducing your waste costs?\n\nBest,\nKyle"
    },
    {
        id: 'pricing',
        name: 'Pricing Follow-up',
        subject: 'Pricing for {company_name}',
        body: "Hi {contact_name},\n\nThanks for your interest! Current pricing:\n\nContainer: $150/month ({container_size}yd)\nScrap Buyback: See attached\n\nWe beat competitors by 15-20% on metal pricing.\n\nWhen can we drop off a container?\n\nKyle"
    },
    {
        id: 'checkin',
        name: 'Quarterly Check-in',
        subject: 'Checking In - {company_name}',
        body: "Hi {contact_name},\n\nQuick check-in to see if your current vendor is treating you right. Prices have shifted recently.\n\nLet me know if you'd like a quote comparison.\n\nBest,\nKyle"
    }
];
var COMPETITOR_PATTERNS = {
    'AIM': /\b(aim|a\.i\.m\.|tyler iron & metal)\b/i,
    'Tyler Iron': /\btyler iron\b/i,
    'Huntwell': /\bhuntwell\b/i,
    'Iron Mountain': /\biron mountain\b/i
};
var INITIAL_PROSPECTS = [
    {
        cid: 'CID-001',
        companyName: 'Tyler Fabrication Co',
        locationName: 'Main Shop',
        address: '1234 Industrial Blvd, Tyler TX 75701',
        lat: 32.3513,
        lng: -95.3011,
        zip: '75701',
        currentAssets: '',
        containerSize: 30,
        industry: 'Metal Fabricator',
        industryScore: 95,
        priority: 85,
        winProbability: 72,
        lastOutcome: 'Interested',
        lastOutreachDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        nextVisitDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        contactStatus: 'Hot',
        owner: 'Kyle',
        estimatedMonthlyRevenue: 1200
    },
    {
        cid: 'CID-002',
        companyName: 'East TX HVAC Services',
        locationName: 'Headquarters',
        address: '4567 Cooling Way, Longview TX 75601',
        lat: 32.5008,
        lng: -94.7405,
        zip: '75601',
        currentAssets: '',
        containerSize: 20,
        industry: 'HVAC',
        industryScore: 78,
        priority: 60,
        winProbability: 45,
        lastOutcome: 'Send Info',
        lastOutreachDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        nextVisitDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        contactStatus: 'Warm',
        owner: 'Kyle',
        estimatedMonthlyRevenue: 600
    },
    {
        cid: 'CID-003',
        companyName: 'Lone Star Roofing',
        locationName: 'Warehouse',
        address: '789 Shingle Dr, Tyler TX 75702',
        currentAssets: '',
        containerSize: 40,
        industry: 'Roofing',
        industryScore: 82,
        priority: 72,
        winProbability: 38,
        lastOutcome: 'Left Message',
        contactStatus: 'Warm',
        owner: 'Kyle',
        estimatedMonthlyRevenue: 800
    }
];
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function calculateWinProbability(prospect, outreachHistory) {
    var industryVisits = outreachHistory.filter(function (o) {
        var p = INITIAL_PROSPECTS.find(function (ip) { return ip.cid === o.cid; });
        return (p === null || p === void 0 ? void 0 : p.industry) === prospect.industry;
    });
    var industryWinRate = industryVisits.length > 0
        ? industryVisits.filter(function (o) { return o.outcome === 'Won'; }).length / industryVisits.length
        : 0.25;
    var outcomeScores = {
        'Never Contacted': 0.30, 'Has Vendor': 0.30, 'Won': 1.00, 'Not Interested': 0.05
    };
    var outcomeScore = outcomeScores[prospect.lastOutcome || 'Never Contacted'] || 0.30;
    var prospectTouches = outreachHistory.filter(function (o) { return o.cid === prospect.cid; }).length;
    var touchScore = Math.min(prospectTouches / 5, 1.0);
    var daysSinceTouch = prospect.lastOutreachDate
        ? Math.ceil((Date.now() - new Date(prospect.lastOutreachDate).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
    var recencyScore = daysSinceTouch < 7 ? 1.0 : daysSinceTouch < 30 ? 0.7 : 0.4;
    var probability = (industryWinRate * 0.35 +
        outcomeScore * 0.30 +
        touchScore * 0.20 +
        recencyScore * 0.15);
    return Math.round(probability * 100);
}
function getNextActionRecommendation(prospect) {
    var daysSinceTouch = prospect.lastOutreachDate
        ? Math.ceil((Date.now() - new Date(prospect.lastOutreachDate).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
    var isOverdue = prospect.nextVisitDate && new Date(prospect.nextVisitDate) < new Date();
    if (prospect.contactStatus === 'Hot' && (isOverdue || daysSinceTouch > 5)) {
        return {
            action: 'Call Immediately',
            urgency: 'critical',
            icon: '🔥',
            reason: "Hot lead risk! ".concat(daysSinceTouch, " days silence."),
            dueDate: 'Today'
        };
    }
    if (prospect.lastOutcome === 'Send Info' && daysSinceTouch > 7) {
        return {
            action: 'Send Pricing',
            urgency: 'high',
            icon: '📧',
            reason: 'Info requested. Send quote now.',
            dueDate: 'This Week'
        };
    }
    if (prospect.contactStatus === 'Warm' && daysSinceTouch > 14) {
        return {
            action: 'Check-In Call',
            urgency: 'medium',
            icon: '📞',
            reason: 'Maintain relationship warmth.',
            dueDate: 'Next 7 Days'
        };
    }
    if (daysSinceTouch < 3) {
        return {
            action: 'Wait',
            urgency: 'low',
            icon: '⏸️',
            reason: "Just contacted. Don't be pushy.",
            dueDate: "Wait ".concat(3 - daysSinceTouch, " days")
        };
    }
    return {
        action: 'Site Visit',
        urgency: 'medium',
        icon: '🚗',
        reason: 'Face time builds trust.',
        dueDate: 'This Month'
    };
}
// ============================================================================
// UI COMPONENTS
// ============================================================================
var Icons = {
    Dashboard: function () { return ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" }) })); },
    Prospects: function () { return ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }) })); },
    Outreach: function () { return ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" }) })); },
    Map: function () { return ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" }) })); },
    Analytics: function () { return ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) })); },
    Competitors: function () { return ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) })); },
    Money: function () { return ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })); },
    Search: function () { return ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) })); },
    Filter: function () { return ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" }) })); }
};
var Modal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, title = _a.title, children = _a.children;
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", onClick: function (e) { return e.stopPropagation(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center p-4 border-b bg-green-900 text-white sticky top-0 z-10", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-bold", children: title }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-gray-300 hover:text-white text-2xl leading-none", children: "\u00D7" })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-6", children: children })] }) }));
};
var BarChart = function (_a) {
    var data = _a.data, labels = _a.labels, title = _a.title;
    var max = Math.max.apply(Math, __spreadArray(__spreadArray([], data, false), [1], false));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-48", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 mb-3 font-semibold", children: title }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-end space-x-3 flex-1", children: data.map(function (val, i) { return ((0, jsx_runtime_1.jsxs)("div", { className: "flex-1 flex flex-col items-center group", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t relative hover:from-green-700 hover:to-green-500 transition-all shadow-sm", style: { height: "".concat((val / max) * 100, "%"), minHeight: val > 0 ? '8px' : '0' }, children: (0, jsx_runtime_1.jsx)("div", { className: "absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold", children: val }) }), (0, jsx_runtime_1.jsx)("div", { className: "text-[10px] text-gray-600 mt-2 truncate w-full text-center font-medium", children: labels[i] })] }, i)); }) })] }));
};
// Revenue Dashboard Component
var RevenueDashboard = function (_a) {
    var prospects = _a.prospects, outreach = _a.outreach;
    var _b = (0, react_1.useState)(500), avgRevenue = _b[0], setAvgRevenue = _b[1];
    var pipelineValue = (0, react_1.useMemo)(function () {
        return prospects.reduce(function (sum, p) {
            var winProb = p.winProbability / 100;
            var estRev = p.estimatedMonthlyRevenue || avgRevenue;
            return sum + winProb * estRev * 12;
        }, 0);
    }, [prospects, avgRevenue]);
    var wonMRR = prospects
        .filter(function (p) { return p.lastOutcome === 'Won'; })
        .reduce(function (sum, p) { return sum + (p.estimatedMonthlyRevenue || avgRevenue); }, 0);
    var potentialMRR = prospects
        .filter(function (p) { return p.contactStatus === 'Hot'; })
        .reduce(function (sum, p) { return sum + (p.estimatedMonthlyRevenue || avgRevenue); }, 0);
    return ((0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-gray-200", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-xl font-bold text-gray-800 mb-6 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(Icons.Money, {}), " Revenue Forecast"] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm text-green-700 font-bold uppercase tracking-wide", children: "Current MRR" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-4xl font-bold text-green-800 my-2", children: ["$", wonMRR.toLocaleString()] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-green-600", children: ["Annual: $", (wonMRR * 12).toLocaleString()] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm text-blue-700 font-bold uppercase tracking-wide", children: "Weighted Pipeline" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-4xl font-bold text-blue-800 my-2", children: ["$", Math.round(pipelineValue).toLocaleString()] }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-blue-600", children: "12-Month Projection" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-200", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm text-orange-700 font-bold uppercase tracking-wide", children: "Hot Leads Potential" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-4xl font-bold text-orange-800 my-2", children: ["$", potentialMRR.toLocaleString()] }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-orange-600", children: "MRR at Risk" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200", children: [(0, jsx_runtime_1.jsxs)("label", { className: "text-sm font-semibold text-gray-700 block mb-2", children: ["Average Monthly Revenue per Account: ", (0, jsx_runtime_1.jsxs)("span", { className: "text-green-700", children: ["$", avgRevenue] })] }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: "100", max: "2000", step: "50", value: avgRevenue, onChange: function (e) { return setAvgRevenue(Number(e.target.value)); }, className: "w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [(0, jsx_runtime_1.jsx)("span", { children: "$100" }), (0, jsx_runtime_1.jsx)("span", { children: "$2000" })] })] })] }) }));
};
// Competitor Dashboard Component
var CompetitorDashboard = function (_a) {
    var outreach = _a.outreach;
    var stats = (0, react_1.useMemo)(function () {
        var compStats = {
            AIM: { mentions: 0, wins: 0, losses: 0 },
            'Tyler Iron': { mentions: 0, wins: 0, losses: 0 },
            Huntwell: { mentions: 0, wins: 0, losses: 0 },
            'Iron Mountain': { mentions: 0, wins: 0, losses: 0 }
        };
        outreach.forEach(function (o) {
            var notes = o.notes.toLowerCase();
            Object.entries(COMPETITOR_PATTERNS).forEach(function (_a) {
                var compName = _a[0], regex = _a[1];
                if (regex.test(notes)) {
                    compStats[compName].mentions++;
                    if (o.outcome === 'Won')
                        compStats[compName].wins++;
                    if (o.outcome === 'Not Interested' || o.outcome === 'Lost')
                        compStats[compName].losses++;
                }
            });
        });
        return compStats;
    }, [outreach]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-orange-500 p-4 rounded-lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl", children: "\uD83C\uDFAF" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-gray-800 text-lg", children: "Competitive Intelligence" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 mt-1", children: "Win rates calculated from mentions in visit notes. Use this data to refine your competitive positioning." })] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: Object.entries(stats).map(function (_a) {
                    var name = _a[0], data = _a[1];
                    var totalOutcomes = data.wins + data.losses;
                    var winRate = totalOutcomes > 0 ? Math.round((data.wins / totalOutcomes) * 100) : 0;
                    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow", children: [(0, jsx_runtime_1.jsxs)("div", { className: "font-bold text-gray-800 text-lg mb-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: name }), (0, jsx_runtime_1.jsx)("span", { className: "text-2xl", children: "\u2694\uFE0F" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-end mb-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-3xl font-bold text-blue-600", children: data.mentions }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 uppercase font-semibold", children: "Mentions" })] }), (0, jsx_runtime_1.jsx)("div", { className: "w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500", style: { width: "".concat(winRate, "%") } }) }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-600 flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("span", { children: "Win Rate vs Them" }), (0, jsx_runtime_1.jsxs)("span", { className: "font-bold text-sm ".concat(winRate > 50 ? 'text-green-600' : 'text-red-600'), children: [winRate, "%"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Wins: ", data.wins] }), (0, jsx_runtime_1.jsxs)("span", { children: ["Losses: ", data.losses] })] }) })] }, name));
                }) })] }));
};
// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
var App = function () {
    // Auth State
    var _a = (0, react_1.useState)(function () {
        var s = localStorage.getItem('kl_user');
        return s ? JSON.parse(s) : null;
    }), user = _a[0], setUser = _a[1];
    // Core State
    var _b = (0, react_1.useState)('dashboard'), activeTab = _b[0], setActiveTab = _b[1];
    var _c = (0, react_1.useState)(window.innerWidth < 768), isMobile = _c[0], setIsMobile = _c[1];
    var _d = (0, react_1.useState)(function () {
        var s = localStorage.getItem('kl_prospects');
        if (s) {
            var loaded = JSON.parse(s);
            // Recalculate winProbability on load
            return loaded.map(function (p) { return (__assign(__assign({}, p), { winProbability: calculateWinProbability(p, JSON.parse(localStorage.getItem('kl_outreach') || '[]')) })); });
        }
        return INITIAL_PROSPECTS;
    }), prospects = _d[0], setProspects = _d[1];
    var _e = (0, react_1.useState)(function () {
        var s = localStorage.getItem('kl_outreach');
        return s ? JSON.parse(s) : [];
    }), outreach = _e[0], setOutreach = _e[1];
    // Feature 1: Advanced Filters
    var _f = (0, react_1.useState)({
        query: '',
        priorityMin: 0,
        priorityMax: 100,
        statuses: [],
        industries: [],
        dateRange: null,
        overdueOnly: false
    }), filters = _f[0], setFilters = _f[1];
    var _g = (0, react_1.useState)(false), showFilters = _g[0], setShowFilters = _g[1];
    // Feature 6: Email Modal State
    var _h = (0, react_1.useState)(false), isEmailModalOpen = _h[0], setEmailModalOpen = _h[1];
    var _j = (0, react_1.useState)(''), selectedTemplate = _j[0], setSelectedTemplate = _j[1];
    var _k = (0, react_1.useState)(''), emailBody = _k[0], setEmailBody = _k[1];
    var _l = (0, react_1.useState)(''), emailSubject = _l[0], setEmailSubject = _l[1];
    var _m = (0, react_1.useState)(''), currentEmailCid = _m[0], setCurrentEmailCid = _m[1];
    // Quick Log Visit State
    var _o = (0, react_1.useState)(false), showQuickLog = _o[0], setShowQuickLog = _o[1];
    var _p = (0, react_1.useState)(''), quickLogCid = _p[0], setQuickLogCid = _p[1];
    var _q = (0, react_1.useState)(''), quickLogOutcome = _q[0], setQuickLogOutcome = _q[1];
    var _r = (0, react_1.useState)(''), quickLogNotes = _r[0], setQuickLogNotes = _r[1];
    // Persistence
    (0, react_1.useEffect)(function () { return localStorage.setItem('kl_prospects', JSON.stringify(prospects)); }, [prospects]);
    (0, react_1.useEffect)(function () { return localStorage.setItem('kl_outreach', JSON.stringify(outreach)); }, [outreach]);
    (0, react_1.useEffect)(function () {
        if (user)
            localStorage.setItem('kl_user', JSON.stringify(user));
    }, [user]);
    // Mobile Detection
    (0, react_1.useEffect)(function () {
        var handleResize = function () { return setIsMobile(window.innerWidth < 768); };
        window.addEventListener('resize', handleResize);
        return function () { return window.removeEventListener('resize', handleResize); };
    }, []);
    // Feature 10: Push Notifications
    (0, react_1.useEffect)(function () {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        var checkReminders = function () {
            var now = new Date();
            if (now.getHours() === 8 && now.getMinutes() === 0) {
                var overdue = prospects.filter(function (p) { return p.nextVisitDate && new Date(p.nextVisitDate) < new Date() && p.owner === (user === null || user === void 0 ? void 0 : user.name); });
                if (overdue.length > 0 && Notification.permission === 'granted') {
                    new Notification('K&L CRM Daily Reminder', {
                        body: "You have ".concat(overdue.length, " overdue visits today."),
                        icon: '/icon-192.png',
                        tag: 'daily-reminder'
                    });
                }
            }
        };
        var interval = setInterval(checkReminders, 60000);
        return function () { return clearInterval(interval); };
    }, [prospects, user]);
    // Feature 1: Smart Filtering
    var filteredProspects = (0, react_1.useMemo)(function () {
        return prospects.filter(function (p) {
            var q = filters.query.toLowerCase();
            var textMatch = !q ||
                p.companyName.toLowerCase().includes(q) ||
                p.address.toLowerCase().includes(q) ||
                p.industry.toLowerCase().includes(q);
            var priMatch = p.priority >= filters.priorityMin && p.priority <= filters.priorityMax;
            var statMatch = filters.statuses.length === 0 || filters.statuses.includes(p.contactStatus);
            var indMatch = filters.industries.length === 0 || filters.industries.includes(p.industry);
            var overdueMatch = !filters.overdueOnly || (p.nextVisitDate && new Date(p.nextVisitDate) < new Date());
            var ownerMatch = (user === null || user === void 0 ? void 0 : user.role) === 'Sales Rep' ? p.owner === user.name : true;
            return textMatch && priMatch && statMatch && indMatch && overdueMatch && ownerMatch;
        });
    }, [prospects, filters, user]);
    // Auth Handlers
    var handleLogin = function (username) {
        var role = username === 'admin' ? 'Admin' : 'Sales Rep';
        setUser({ username: username, name: username === 'admin' ? 'Kyle' : username, role: role });
    };
    var handleLogout = function () {
        setUser(null);
        localStorage.removeItem('kl_user');
    };
    // Feature 6: Email Handlers
    var openEmailModal = function (cid) {
        setCurrentEmailCid(cid);
        var p = prospects.find(function (x) { return x.cid === cid; });
        var t = EMAIL_TEMPLATES[0];
        setSelectedTemplate(t.id);
        setEmailSubject(t.subject.replace('{company_name}', (p === null || p === void 0 ? void 0 : p.companyName) || ''));
        setEmailBody(t.body
            .replace('{contact_name}', 'Partner')
            .replace('{company_name}', (p === null || p === void 0 ? void 0 : p.companyName) || '')
            .replace('{container_size}', (p === null || p === void 0 ? void 0 : p.containerSize.toString()) || '30'));
        setEmailModalOpen(true);
    };
    var applyTemplate = function (tid) {
        var t = EMAIL_TEMPLATES.find(function (x) { return x.id === tid; });
        var p = prospects.find(function (x) { return x.cid === currentEmailCid; });
        if (t && p) {
            setSelectedTemplate(tid);
            setEmailSubject(t.subject.replace('{company_name}', p.companyName));
            setEmailBody(t.body
                .replace('{contact_name}', 'Partner')
                .replace('{company_name}', p.companyName)
                .replace('{container_size}', p.containerSize.toString()));
        }
    };
    var sendEmail = function () {
        window.open("mailto:?subject=".concat(encodeURIComponent(emailSubject), "&body=").concat(encodeURIComponent(emailBody)));
        setEmailModalOpen(false);
    };
    // Quick Log Visit Handler
    var handleQuickLogSubmit = function () {
        if (!quickLogCid || !quickLogOutcome) {
            alert('Please select company and outcome');
            return;
        }
        var prospect = prospects.find(function (p) { return p.cid === quickLogCid; });
        if (!prospect)
            return;
        var mapping = OUTCOME_MAPPING[quickLogOutcome];
        var visitDate = new Date().toISOString();
        var nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + mapping.daysToAdd);
        var newOutreach = {
            lid: "LID-".concat(Date.now()),
            cid: quickLogCid,
            companyName: prospect.companyName,
            visitDate: visitDate,
            notes: quickLogNotes,
            outcome: quickLogOutcome,
            stage: mapping.stage,
            status: mapping.status,
            nextVisitDate: nextDate.toISOString(),
            daysSinceLast: 0,
            nextVisitCountdown: mapping.daysToAdd,
            followUpAction: getNextActionRecommendation(prospect).action,
            owner: (user === null || user === void 0 ? void 0 : user.name) || 'System',
            contactType: 'In-Person'
        };
        var updatedOutreach = __spreadArray(__spreadArray([], outreach, true), [newOutreach], false);
        setOutreach(updatedOutreach);
        // Update prospect with new win probability
        setProspects(prospects.map(function (p) {
            return p.cid === quickLogCid
                ? __assign(__assign({}, p), { lastOutcome: quickLogOutcome, lastOutreachDate: visitDate, nextVisitDate: nextDate.toISOString(), contactStatus: mapping.status, winProbability: calculateWinProbability(__assign(__assign({}, p), { lastOutcome: quickLogOutcome, lastOutreachDate: visitDate }), updatedOutreach) }) : p;
        }));
        setQuickLogCid('');
        setQuickLogOutcome('');
        setQuickLogNotes('');
        setShowQuickLog(false);
        alert('✅ Visit logged successfully!');
    };
    // Login Screen
    if (!user) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "w-full max-w-md space-y-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-6xl mb-4", children: "\uD83C\uDFED" }), (0, jsx_runtime_1.jsx)("h1", { className: "text-4xl font-bold tracking-wider mb-2", children: "K&L RECYCLING" }), (0, jsx_runtime_1.jsx)("p", { className: "text-green-200 text-sm", children: "Enterprise Sales CRM" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white text-gray-800 p-8 rounded-xl shadow-2xl space-y-5", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-center text-gray-800", children: "Employee Login" }), (0, jsx_runtime_1.jsx)("input", { id: "username_input", placeholder: "Username (Try 'admin' or 'kyle')", className: "w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" }), (0, jsx_runtime_1.jsx)("button", { onClick: function () {
                                    return handleLogin(document.getElementById('username_input').value || 'kyle');
                                }, className: "w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg", children: "Sign In" }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 text-center", children: "\u2728 Features: Role-Based Access \u2022 AI Lead Scoring \u2022 Revenue Forecasting" })] })] }) }));
    }
    // Main App UI
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-800", children: [(0, jsx_runtime_1.jsxs)("nav", { className: "".concat(isMobile
                    ? 'fixed bottom-0 left-0 right-0 h-16 flex-row justify-around items-center border-t bg-white'
                    : 'w-64 flex-col bg-gradient-to-b from-green-900 to-green-800 text-white', " flex z-50 shadow-xl"), children: [!isMobile && ((0, jsx_runtime_1.jsxs)("div", { className: "p-6 border-b border-green-700", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold tracking-wider", children: "K&L CRM" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-green-300 text-sm mt-2", children: [user.name, " \u2022 ", user.role] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleLogout, className: "text-xs text-red-300 hover:text-white mt-3 underline", children: "Sign Out" })] })), (0, jsx_runtime_1.jsx)("div", { className: "flex ".concat(isMobile ? 'w-full justify-around' : 'flex-col px-3 py-6 space-y-2'), children: [
                            { id: 'dashboard', label: 'Home', icon: Icons.Dashboard },
                            { id: 'prospects', label: 'Prospects', icon: Icons.Prospects },
                            { id: 'outreach', label: 'Visits', icon: Icons.Outreach },
                            { id: 'revenue', label: 'Revenue', icon: Icons.Money },
                            { id: 'competitors', label: 'Intel', icon: Icons.Competitors },
                            { id: 'analytics', label: 'Stats', icon: Icons.Analytics }
                        ].map(function (item) { return ((0, jsx_runtime_1.jsxs)("button", { onClick: function () { return setActiveTab(item.id); }, className: "\n                ".concat(isMobile ? 'flex-col p-2 text-xs' : 'w-full flex-row px-4 py-3 space-x-3 rounded-lg text-sm', "\n                flex items-center justify-center transition-all duration-200\n                ").concat(activeTab === item.id
                                ? isMobile
                                    ? 'text-green-700 font-bold'
                                    : 'bg-green-700 text-white shadow-lg border-l-4 border-green-400'
                                : isMobile
                                    ? 'text-gray-400'
                                    : 'text-green-100 hover:bg-green-700 hover:text-white', "\n              "), children: [(0, jsx_runtime_1.jsx)(item.icon, {}), !isMobile && (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: item.label }), isMobile && (0, jsx_runtime_1.jsx)("span", { className: "mt-1 text-[10px]", children: item.label })] }, item.id)); }) })] }), (0, jsx_runtime_1.jsxs)("main", { className: "flex-1 overflow-y-auto ".concat(isMobile ? 'pb-20 p-4' : 'h-screen p-8'), children: [(0, jsx_runtime_1.jsxs)("header", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [(0, jsx_runtime_1.jsxs)("h2", { className: "text-3xl font-bold text-gray-800 uppercase tracking-tight flex items-center gap-3", children: [activeTab === 'dashboard' && '🏠 Dashboard', activeTab === 'prospects' && '🏢 Prospects', activeTab === 'outreach' && '📝 Visit Tracking', activeTab === 'revenue' && '💰 Revenue', activeTab === 'competitors' && '⚔️ Competitive Intel', activeTab === 'analytics' && '📊 Analytics'] }), (activeTab === 'prospects' || activeTab === 'outreach') && ((0, jsx_runtime_1.jsxs)("div", { className: "flex-1 w-full md:w-auto md:max-w-xl flex gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative flex-1", children: [(0, jsx_runtime_1.jsx)("input", { className: "w-full border-2 border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none shadow-sm", placeholder: "Search companies, addresses, notes...", value: filters.query, onChange: function (e) { return setFilters(__assign(__assign({}, filters), { query: e.target.value })); } }), (0, jsx_runtime_1.jsx)("div", { className: "absolute left-3 top-2.5 text-gray-400", children: (0, jsx_runtime_1.jsx)(Icons.Search, {}) })] }), (0, jsx_runtime_1.jsx)("button", { onClick: function () { return setShowFilters(!showFilters); }, className: "p-2 rounded-lg border-2 transition-all ".concat(showFilters ? 'bg-green-100 border-green-400 text-green-700' : 'bg-white border-gray-300 text-gray-600'), children: (0, jsx_runtime_1.jsx)(Icons.Filter, {}) })] }))] }), showFilters && (activeTab === 'prospects' || activeTab === 'outreach') && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-5 rounded-lg shadow-md border border-gray-200 mb-6 animate-fade-in-down", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "text-xs font-bold text-gray-600 uppercase block mb-2", children: "Priority Range" }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: "0", max: "100", className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600", value: filters.priorityMin, onChange: function (e) { return setFilters(__assign(__assign({}, filters), { priorityMin: Number(e.target.value) })); } }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [(0, jsx_runtime_1.jsx)("span", { children: filters.priorityMin }), (0, jsx_runtime_1.jsx)("span", { children: "100" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "text-xs font-bold text-gray-600 uppercase block mb-2", children: "Status Filter" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: ['Hot', 'Warm', 'Cold'].map(function (s) { return ((0, jsx_runtime_1.jsx)("button", { onClick: function () {
                                                        var newS = filters.statuses.includes(s)
                                                            ? filters.statuses.filter(function (x) { return x !== s; })
                                                            : __spreadArray(__spreadArray([], filters.statuses, true), [s], false);
                                                        setFilters(__assign(__assign({}, filters), { statuses: newS }));
                                                    }, className: "text-xs px-3 py-1.5 rounded-full border-2 font-semibold transition-all ".concat(filters.statuses.includes(s)
                                                        ? 'bg-green-600 text-white border-green-600'
                                                        : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'), children: s }, s)); }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center", children: (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: filters.overdueOnly, onChange: function (e) { return setFilters(__assign(__assign({}, filters), { overdueOnly: e.target.checked })); }, className: "w-4 h-4 text-green-600 rounded focus:ring-green-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-semibold text-gray-700", children: "Overdue Only" })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-end", children: (0, jsx_runtime_1.jsx)("button", { onClick: function () {
                                                return setFilters({
                                                    query: '',
                                                    priorityMin: 0,
                                                    priorityMax: 100,
                                                    statuses: [],
                                                    industries: [],
                                                    dateRange: null,
                                                    overdueOnly: false
                                                });
                                            }, className: "text-xs text-red-600 hover:text-red-700 underline font-semibold", children: "Clear All" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-3 text-xs text-gray-500", children: ["Showing ", filteredProspects.length, " of ", prospects.length, " prospects"] })] })), activeTab === 'dashboard' && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs font-bold text-gray-500 uppercase tracking-wide", children: "Total Prospects" }), (0, jsx_runtime_1.jsx)(Icons.Prospects, {})] }), (0, jsx_runtime_1.jsx)("div", { className: "text-4xl font-bold text-gray-800", children: prospects.length }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500 mt-2", children: [prospects.filter(function (p) { return p.contactStatus === 'Hot'; }).length, " Hot Leads"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm border-2 border-green-200 hover:shadow-md transition-shadow", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs font-bold text-green-700 uppercase tracking-wide", children: "Conversion Rate" }), (0, jsx_runtime_1.jsx)("div", { className: "text-green-600 text-2xl", children: "\u2713" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-4xl font-bold text-green-800", children: [Math.round((outreach.filter(function (o) { return o.outcome === 'Won'; }).length / (outreach.length || 1)) * 100), "%"] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-green-600 mt-2", children: [outreach.filter(function (o) { return o.outcome === 'Won'; }).length, " Won / ", outreach.length, " Contacts"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-sm border-2 border-red-200 hover:shadow-md transition-shadow", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs font-bold text-red-600 uppercase tracking-wide", children: "Overdue Visits" }), (0, jsx_runtime_1.jsx)("div", { className: "text-red-500 text-2xl", children: "\u26A0\uFE0F" })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-4xl font-bold text-red-700", children: prospects.filter(function (p) { return p.nextVisitDate && new Date(p.nextVisitDate) < new Date(); }).length }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-red-500 mt-2", children: "Immediate Attention Required" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border-2 border-blue-200 hover:shadow-md transition-shadow", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs font-bold text-blue-600 uppercase tracking-wide", children: "This Month" }), (0, jsx_runtime_1.jsx)(Icons.Outreach, {})] }), (0, jsx_runtime_1.jsx)("div", { className: "text-4xl font-bold text-blue-700", children: outreach.filter(function (o) {
                                                    var d = new Date(o.visitDate);
                                                    var now = new Date();
                                                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                                                }).length }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-blue-500 mt-2", children: "Visits Logged" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-gray-200", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "font-bold text-lg text-gray-800 mb-4 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(Icons.Outreach, {}), " Recent Activity"] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-3 max-h-96 overflow-y-auto", children: outreach.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center text-gray-400 py-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-4xl mb-2", children: "\uD83D\uDCED" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm", children: "No visits logged yet. Start tracking your outreach!" })] })) : (outreach
                                                    .sort(function (a, b) { return new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime(); })
                                                    .slice(0, 10)
                                                    .map(function (o) { return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ".concat(o.outcome === 'Won'
                                                                ? 'bg-green-500'
                                                                : o.outcome === 'Interested'
                                                                    ? 'bg-blue-500'
                                                                    : o.outcome === 'Not Interested'
                                                                        ? 'bg-red-500'
                                                                        : 'bg-gray-400') }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "font-semibold text-sm text-gray-800 truncate", children: o.companyName }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500", children: [o.outcome, " \u2022 ", new Date(o.visitDate).toLocaleDateString()] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-400 truncate mt-1", children: [o.notes.slice(0, 80), "..."] })] })] }, o.lid)); })) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-gray-200", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-lg text-gray-800 mb-4 flex items-center gap-2", children: "\uD83D\uDD25 Top Priorities Today" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-3 max-h-96 overflow-y-auto", children: prospects
                                                    .filter(function (p) { return p.contactStatus === 'Hot' || (p.nextVisitDate && new Date(p.nextVisitDate) < new Date()); })
                                                    .sort(function (a, b) { return b.priority - a.priority; })
                                                    .slice(0, 8)
                                                    .map(function (p) {
                                                    var reco = getNextActionRecommendation(p);
                                                    return ((0, jsx_runtime_1.jsx)("div", { className: "p-3 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer ".concat(reco.urgency === 'critical'
                                                            ? 'bg-red-50 border-red-300'
                                                            : reco.urgency === 'high'
                                                                ? 'bg-orange-50 border-orange-300'
                                                                : 'bg-gray-50 border-gray-200'), onClick: function () { return setActiveTab('prospects'); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "font-semibold text-sm text-gray-800 truncate", children: p.companyName }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-600 mt-1", children: [reco.icon, " ", reco.action] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs font-bold px-2 py-1 rounded-full ".concat(p.winProbability > 70
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : p.winProbability > 30
                                                                            ? 'bg-yellow-100 text-yellow-800'
                                                                            : 'bg-gray-100 text-gray-600'), children: [p.winProbability, "%"] })] }) }, p.cid));
                                                }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-gray-200", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-lg text-gray-800 mb-4", children: "Pipeline Health" }), (0, jsx_runtime_1.jsx)(BarChart, { title: "Prospects by Status", labels: ['Hot', 'Warm', 'Cold', 'Active'], data: [
                                            prospects.filter(function (p) { return p.contactStatus === 'Hot'; }).length,
                                            prospects.filter(function (p) { return p.contactStatus === 'Warm'; }).length,
                                            prospects.filter(function (p) { return p.contactStatus === 'Cold'; }).length,
                                            prospects.filter(function (p) { return p.contactStatus === 'Active'; }).length
                                        ] })] })] })), activeTab === 'prospects' && ((0, jsx_runtime_1.jsx)("div", { className: "grid gap-4", children: filteredProspects.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-6xl mb-4", children: "\uD83D\uDD0D" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-bold text-gray-800 mb-2", children: "No prospects found" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500", children: "Try adjusting your filters or search query." })] })) : (filteredProspects.map(function (p) {
                            var reco = getNextActionRecommendation(p);
                            return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start mb-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-xl text-gray-800", children: p.companyName }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm text-gray-500 mt-1", children: [p.address, " \u2022 ", p.industry] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-xs font-bold px-3 py-1.5 rounded-full mb-2 inline-block ".concat(p.winProbability > 70
                                                            ? 'bg-green-100 text-green-800'
                                                            : p.winProbability > 30
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'), children: [p.winProbability, "% Win"] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500", children: ["Priority: ", p.priority] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-3 p-4 rounded-lg border-2 flex items-center gap-3 ".concat(reco.urgency === 'critical'
                                            ? 'bg-red-50 border-red-300'
                                            : reco.urgency === 'high'
                                                ? 'bg-orange-50 border-orange-300'
                                                : 'bg-gray-50 border-gray-200'), children: [(0, jsx_runtime_1.jsx)("div", { className: "text-3xl", children: reco.icon }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs font-bold uppercase tracking-wide text-gray-500", children: "AI Recommendation" }), (0, jsx_runtime_1.jsx)("div", { className: "font-bold text-gray-800 mt-1", children: reco.action }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-600 mt-1", children: reco.reason })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs font-bold text-gray-500", children: "Due" }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm font-semibold ".concat(reco.urgency === 'critical' ? 'text-red-600' : 'text-gray-700'), children: reco.dueDate })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: function () { return openEmailModal(p.cid); }, className: "flex-1 py-2 text-sm font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors", children: "\uD83D\uDCE7 Email" }), (0, jsx_runtime_1.jsx)("button", { onClick: function () {
                                                    setQuickLogCid(p.cid);
                                                    setActiveTab('outreach');
                                                    setShowQuickLog(true);
                                                }, className: "flex-1 py-2 text-sm font-semibold bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors", children: "\u2713 Log Visit" }), (0, jsx_runtime_1.jsx)("button", { className: "flex-1 py-2 text-sm font-semibold bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors", children: "\uD83D\uDCCD Map" })] })] }, p.cid));
                        })) })), activeTab === 'outreach' && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg shadow-sm border-2 border-green-200", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: function () { return setShowQuickLog(!showQuickLog); }, className: "w-full flex items-center justify-between text-left", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-lg text-gray-800 flex items-center gap-2", children: "\u2795 Quick Log Visit" }), (0, jsx_runtime_1.jsx)("span", { className: "text-3xl text-gray-400", children: showQuickLog ? '−' : '+' })] }), showQuickLog && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-lg border border-gray-200", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "text-xs font-bold text-gray-600 uppercase block mb-2", children: "Company *" }), (0, jsx_runtime_1.jsxs)("select", { value: quickLogCid, onChange: function (e) { return setQuickLogCid(e.target.value); }, className: "w-full border-2 border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Select Prospect..." }), prospects.map(function (p) { return ((0, jsx_runtime_1.jsx)("option", { value: p.cid, children: p.companyName }, p.cid)); })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "text-xs font-bold text-gray-600 uppercase block mb-2", children: "Outcome *" }), (0, jsx_runtime_1.jsxs)("select", { value: quickLogOutcome, onChange: function (e) { return setQuickLogOutcome(e.target.value); }, className: "w-full border-2 border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Select Outcome..." }), Object.keys(OUTCOME_MAPPING).map(function (o) { return ((0, jsx_runtime_1.jsx)("option", { value: o, children: o }, o)); })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "md:col-span-2", children: [(0, jsx_runtime_1.jsx)("label", { className: "text-xs font-bold text-gray-600 uppercase block mb-2", children: "Visit Notes" }), (0, jsx_runtime_1.jsx)("textarea", { value: quickLogNotes, onChange: function (e) { return setQuickLogNotes(e.target.value); }, placeholder: "Met with John. Interested in 30yd container. Competing with AIM but our pricing is better. Follow up next week with quote...", className: "w-full border-2 border-gray-300 rounded-lg p-3 text-sm h-28 focus:ring-2 focus:ring-green-500 focus:border-green-500" }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-end gap-2 mt-3", children: (0, jsx_runtime_1.jsx)("button", { onClick: handleQuickLogSubmit, className: "px-8 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-bold hover:from-green-700 hover:to-green-800 shadow-md transition-all transform hover:scale-105", children: "\uD83D\uDCBE Save Visit" }) })] })] }))] }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "w-full text-sm", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "px-5 py-4 text-left font-bold text-gray-700 uppercase text-xs", children: "Date" }), (0, jsx_runtime_1.jsx)("th", { className: "px-5 py-4 text-left font-bold text-gray-700 uppercase text-xs", children: "Company" }), (0, jsx_runtime_1.jsx)("th", { className: "px-5 py-4 text-left font-bold text-gray-700 uppercase text-xs", children: "Outcome" }), (0, jsx_runtime_1.jsx)("th", { className: "px-5 py-4 text-left font-bold text-gray-700 uppercase text-xs", children: "Notes" }), (0, jsx_runtime_1.jsx)("th", { className: "px-5 py-4 text-left font-bold text-gray-700 uppercase text-xs", children: "Next Visit" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "divide-y divide-gray-100", children: outreach.length === 0 ? ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsxs)("td", { colSpan: 5, className: "px-5 py-12 text-center text-gray-400", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-5xl mb-3", children: "\uD83D\uDCDD" }), (0, jsx_runtime_1.jsx)("p", { children: "No visits logged yet. Use the form above to start tracking!" })] }) })) : (outreach
                                                    .filter(function (o) { return ((user === null || user === void 0 ? void 0 : user.role) === 'Sales Rep' ? o.owner === user.name : true); })
                                                    .sort(function (a, b) { return new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime(); })
                                                    .map(function (o) { return ((0, jsx_runtime_1.jsxs)("tr", { className: "hover:bg-gray-50 transition-colors", children: [(0, jsx_runtime_1.jsx)("td", { className: "px-5 py-4 whitespace-nowrap text-gray-600 font-medium", children: new Date(o.visitDate).toLocaleDateString() }), (0, jsx_runtime_1.jsx)("td", { className: "px-5 py-4 font-semibold text-gray-800", children: o.companyName }), (0, jsx_runtime_1.jsx)("td", { className: "px-5 py-4", children: (0, jsx_runtime_1.jsx)("span", { className: "inline-block px-3 py-1 rounded-full text-xs font-bold ".concat(o.outcome === 'Won'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : o.outcome === 'Interested'
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : o.outcome === 'Not Interested'
                                                                            ? 'bg-red-100 text-red-700'
                                                                            : 'bg-gray-100 text-gray-600'), children: o.outcome }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-5 py-4 text-gray-600 max-w-md", children: (0, jsx_runtime_1.jsx)("div", { className: "truncate", children: o.notes }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-5 py-4 text-gray-500 whitespace-nowrap text-xs", children: new Date(o.nextVisitDate).toLocaleDateString() })] }, o.lid)); })) })] }) }) })] })), activeTab === 'revenue' && (0, jsx_runtime_1.jsx)(RevenueDashboard, { prospects: prospects, outreach: outreach }), activeTab === 'competitors' && (0, jsx_runtime_1.jsx)(CompetitorDashboard, { outreach: outreach }), activeTab === 'analytics' && ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-gray-200", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-gray-800 mb-5 text-lg", children: "Conversion Funnel" }), (0, jsx_runtime_1.jsx)(BarChart, { title: "Pipeline Progression", labels: ['Prospects', 'Contacted', 'Interested', 'Won'], data: [
                                            prospects.length,
                                            outreach.length,
                                            outreach.filter(function (o) { return o.outcome === 'Interested'; }).length,
                                            outreach.filter(function (o) { return o.outcome === 'Won'; }).length
                                        ] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-gray-200", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-gray-800 mb-5 text-lg", children: "Activity This Month" }), (0, jsx_runtime_1.jsx)(BarChart, { title: "Visits by Week", labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [12, 19, 8, 15] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-gray-200", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-gray-800 mb-5 text-lg", children: "Top Industries" }), (0, jsx_runtime_1.jsx)(BarChart, { title: "Prospects by Industry", labels: ['HVAC', 'Metal Fab', 'Roofing', 'Demo'], data: [
                                            prospects.filter(function (p) { return p.industry === 'HVAC'; }).length,
                                            prospects.filter(function (p) { return p.industry === 'Metal Fabricator'; }).length,
                                            prospects.filter(function (p) { return p.industry === 'Roofing'; }).length,
                                            prospects.filter(function (p) { return p.industry === 'Demolition'; }).length
                                        ] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow-sm border border-gray-200", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-gray-800 mb-4 text-lg", children: "Key Metrics" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm font-semibold text-gray-600", children: "Avg Days to Close" }), (0, jsx_runtime_1.jsx)("span", { className: "text-xl font-bold text-gray-800", children: "42" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm font-semibold text-gray-600", children: "Total Visits (All Time)" }), (0, jsx_runtime_1.jsx)("span", { className: "text-xl font-bold text-gray-800", children: outreach.length })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm font-semibold text-gray-600", children: "Win Rate" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-xl font-bold text-green-600", children: [Math.round((outreach.filter(function (o) { return o.outcome === 'Won'; }).length / (outreach.length || 1)) * 100), "%"] })] })] })] })] }))] }), (0, jsx_runtime_1.jsx)(Modal, { isOpen: isEmailModalOpen, onClose: function () { return setEmailModalOpen(false); }, title: "\u2709\uFE0F Compose Email", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-5", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "text-xs font-bold text-gray-600 uppercase block mb-2", children: "Email Template" }), (0, jsx_runtime_1.jsx)("select", { className: "w-full border-2 border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500", value: selectedTemplate, onChange: function (e) { return applyTemplate(e.target.value); }, children: EMAIL_TEMPLATES.map(function (t) { return ((0, jsx_runtime_1.jsx)("option", { value: t.id, children: t.name }, t.id)); }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "text-xs font-bold text-gray-600 uppercase block mb-2", children: "Subject Line" }), (0, jsx_runtime_1.jsx)("input", { className: "w-full border-2 border-gray-300 rounded-lg p-3 font-semibold text-sm focus:ring-2 focus:ring-blue-500", value: emailSubject, onChange: function (e) { return setEmailSubject(e.target.value); }, placeholder: "Subject" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "text-xs font-bold text-gray-600 uppercase block mb-2", children: "Message Body" }), (0, jsx_runtime_1.jsx)("textarea", { className: "w-full border-2 border-gray-300 rounded-lg p-3 h-48 font-mono text-sm focus:ring-2 focus:ring-blue-500", value: emailBody, onChange: function (e) { return setEmailBody(e.target.value); } })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center bg-gray-50 p-3 rounded-lg text-xs text-gray-600", children: [(0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDCCE Attachment: Current_Pricing_Sheet.pdf" }), (0, jsx_runtime_1.jsx)("button", { className: "text-blue-600 hover:underline font-semibold", children: "Preview" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: sendEmail, className: "w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg transform hover:scale-105", children: "\uD83D\uDCE4 Send Email" })] }) })] }));
};
// ============================================================================
// RENDER APP
// ============================================================================
var root = (0, client_1.createRoot)(document.getElementById('root'));
root.render((0, jsx_runtime_1.jsx)(App, {}));
