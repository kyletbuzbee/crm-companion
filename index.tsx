import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type UserRole = 'Admin' | 'Manager' | 'Sales Rep';
type TabType = 'dashboard' | 'prospects' | 'outreach' | 'map' | 'analytics' | 'competitors' | 'revenue';

interface User {
  username: string;
  role: UserRole;
  name: string;
}

interface SearchFilters {
  query: string;
  priorityMin: number;
  priorityMax: number;
  statuses: string[];
  industries: string[];
  dateRange: { start: string; end: string } | null;
  overdueOnly: boolean;
}

interface Prospect {
  cid: string;
  companyName: string;
  locationName: string;
  address: string;
  lat?: number;
  lng?: number;
  zip?: string;
  currentAssets: string;
  containerSize: number;
  industry: string;
  industryScore: number;
  priority: number;
  winProbability: number;
  lastOutcome?: string;
  lastOutreachDate?: string;
  nextVisitDate?: string;
  contactStatus: 'Hot' | 'Warm' | 'Cold' | 'Active';
  email?: string;
  estimatedMonthlyRevenue?: number;
  owner: string;
}

interface Outreach {
  lid: string;
  cid: string;
  companyName: string;
  visitDate: string;
  notes: string;
  outcome: string;
  stage: string;
  status: string;
  nextVisitDate: string;
  daysSinceLast: number;
  nextVisitCountdown: number;
  followUpAction: string;
  owner: string;
  contactType: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

// ============================================================================
// CONSTANTS & DATA
// ============================================================================

const OUTCOME_MAPPING: Record<string, { stage: string; status: string; daysToAdd: number }> = {
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

const EMAIL_TEMPLATES: EmailTemplate[] = [
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

const COMPETITOR_PATTERNS = {
  'AIM': /\b(aim|a\.i\.m\.|tyler iron & metal)\b/i,
  'Tyler Iron': /\btyler iron\b/i,
  'Huntwell': /\bhuntwell\b/i,
  'Iron Mountain': /\biron mountain\b/i
};

const INITIAL_PROSPECTS: Prospect[] = [
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

function calculateWinProbability(prospect: Prospect, outreachHistory: Outreach[]): number {
  const industryVisits = outreachHistory.filter(o => {
    const p = INITIAL_PROSPECTS.find(ip => ip.cid === o.cid);
    return p?.industry === prospect.industry;
  });
  const industryWinRate = industryVisits.length > 0
    ? industryVisits.filter(o => o.outcome === 'Won').length / industryVisits.length
    : 0.25;

  const outcomeScores: Record<string, number> = {
    'Never Contacted': 0.30, 'Has Vendor': 0.30, 'Won': 1.00, 'Not Interested': 0.05
  };
  const outcomeScore = outcomeScores[prospect.lastOutcome || 'Never Contacted'] || 0.30;

  const prospectTouches = outreachHistory.filter(o => o.cid === prospect.cid).length;
  const touchScore = Math.min(prospectTouches / 5, 1.0);

  const daysSinceTouch = prospect.lastOutreachDate
    ? Math.ceil((Date.now() - new Date(prospect.lastOutreachDate).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  const recencyScore = daysSinceTouch < 7 ? 1.0 : daysSinceTouch < 30 ? 0.7 : 0.4;

  const probability = (
    industryWinRate * 0.35 +
    outcomeScore * 0.30 +
    touchScore * 0.20 +
    recencyScore * 0.15
  );

  return Math.round(probability * 100);
}

function getNextActionRecommendation(prospect: Prospect): {
  action: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  icon: string;
  reason: string;
  dueDate: string;
} {
  const daysSinceTouch = prospect.lastOutreachDate
    ? Math.ceil((Date.now() - new Date(prospect.lastOutreachDate).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  const isOverdue = prospect.nextVisitDate && new Date(prospect.nextVisitDate) < new Date();

  if (prospect.contactStatus === 'Hot' && (isOverdue || daysSinceTouch > 5)) {
    return {
      action: 'Call Immediately',
      urgency: 'critical',
      icon: '🔥',
      reason: `Hot lead risk! ${daysSinceTouch} days silence.`,
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
      dueDate: `Wait ${3 - daysSinceTouch} days`
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

const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Prospects: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Outreach: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
  ),
  Map: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
    </svg>
  ),
  Analytics: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Competitors: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Money: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  )
};

const Modal = ({ isOpen, onClose, title, children }: ) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b bg-green-900 text-white sticky top-0 z-10">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-300 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const BarChart = ({ data, labels, title }: { data: number[]; labels: string[]; title: string }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex flex-col h-48">
      <div className="text-xs text-gray-500 mb-3 font-semibold">{title}</div>
      <div className="flex items-end space-x-3 flex-1">
        {data.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center group">
            <div
              className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t relative hover:from-green-700 hover:to-green-500 transition-all shadow-sm"
              style={{ height: `${(val / max) * 100}%`, minHeight: val > 0 ? '8px' : '0' }}
            >
              <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                {val}
              </div>
            </div>
            <div className="text-[10px] text-gray-600 mt-2 truncate w-full text-center font-medium">{labels[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Revenue Dashboard Component
const RevenueDashboard = ({ prospects, outreach }: { prospects: Prospect[]; outreach: Outreach[] }) => {
  const [avgRevenue, setAvgRevenue] = useState(500);

  const pipelineValue = useMemo(() => {
    return prospects.reduce((sum, p) => {
      const winProb = p.winProbability / 100;
      const estRev = p.estimatedMonthlyRevenue || avgRevenue;
      return sum + winProb * estRev * 12;
    }, 0);
  }, [prospects, avgRevenue]);

  const wonMRR = prospects
    .filter(p => p.lastOutcome === 'Won')
    .reduce((sum, p) => sum + (p.estimatedMonthlyRevenue || avgRevenue), 0);

  const potentialMRR = prospects
    .filter(p => p.contactStatus === 'Hot')
    .reduce((sum, p) => sum + (p.estimatedMonthlyRevenue || avgRevenue), 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Icons.Money /> Revenue Forecast
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200">
            <div className="text-sm text-green-700 font-bold uppercase tracking-wide">Current MRR</div>
            <div className="text-4xl font-bold text-green-800 my-2">${wonMRR.toLocaleString()}</div>
            <div className="text-xs text-green-600">Annual: ${(wonMRR * 12).toLocaleString()}</div>
          </div>
          <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
            <div className="text-sm text-blue-700 font-bold uppercase tracking-wide">Weighted Pipeline</div>
            <div className="text-4xl font-bold text-blue-800 my-2">${Math.round(pipelineValue).toLocaleString()}</div>
            <div className="text-xs text-blue-600">12-Month Projection</div>
          </div>
          <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-200">
            <div className="text-sm text-orange-700 font-bold uppercase tracking-wide">Hot Leads Potential</div>
            <div className="text-4xl font-bold text-orange-800 my-2">${potentialMRR.toLocaleString()}</div>
            <div className="text-xs text-orange-600">MRR at Risk</div>
          </div>
        </div>
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Average Monthly Revenue per Account: <span className="text-green-700">${avgRevenue}</span>
          </label>
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            value={avgRevenue}
            onChange={e => setAvgRevenue(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$100</span>
            <span>$2000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Competitor Dashboard Component
const CompetitorDashboard = ({ outreach }: { outreach: Outreach[] }) => {
  const stats = useMemo(() => {
    const compStats: Record<string, { mentions: number; wins: number; losses: number }> = {
      AIM: { mentions: 0, wins: 0, losses: 0 },
      'Tyler Iron': { mentions: 0, wins: 0, losses: 0 },
      Huntwell: { mentions: 0, wins: 0, losses: 0 },
      'Iron Mountain': { mentions: 0, wins: 0, losses: 0 }
    };

    outreach.forEach(o => {
      const notes = o.notes.toLowerCase();
      Object.entries(COMPETITOR_PATTERNS).forEach(([compName, regex]) => {
        if (regex.test(notes)) {
          compStats[compName].mentions++;
          if (o.outcome === 'Won') compStats[compName].wins++;
          if (o.outcome === 'Not Interested' || o.outcome === 'Lost') compStats[compName].losses++;
        }
      });
    });
    return compStats;
  }, [outreach]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🎯</div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Competitive Intelligence</h3>
            <p className="text-sm text-gray-600 mt-1">
              Win rates calculated from mentions in visit notes. Use this data to refine your competitive positioning.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats).map(([name, data]) => {
          const totalOutcomes = data.wins + data.losses;
          const winRate = totalOutcomes > 0 ? Math.round((data.wins / totalOutcomes) * 100) : 0;
          return (
            <div key={name} className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="font-bold text-gray-800 text-lg mb-3 flex items-center justify-between">
                <span>{name}</span>
                <span className="text-2xl">⚔️</span>
              </div>
              <div className="flex justify-between items-end mb-3">
                <div className="text-3xl font-bold text-blue-600">{data.mentions}</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Mentions</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${winRate}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 flex justify-between items-center">
                <span>Win Rate vs Them</span>
                <span className={`font-bold text-sm ${winRate > 50 ? 'text-green-600' : 'text-red-600'}`}>
                  {winRate}%
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Wins: {data.wins}</span>
                  <span>Losses: {data.losses}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const App = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(() => {
    const s = localStorage.getItem('kl_user');
    return s ? JSON.parse(s) : null;
  });

  // Core State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [prospects, setProspects] = useState<Prospect[]>(() => {
    const s = localStorage.getItem('kl_prospects');
    if (s) {
      const loaded = JSON.parse(s);
      // Recalculate winProbability on load
      return loaded.map((p: Prospect) => ({
        ...p,
        winProbability: calculateWinProbability(p, JSON.parse(localStorage.getItem('kl_outreach') || '[]'))
      }));
    }
    return INITIAL_PROSPECTS;
  });
  const [outreach, setOutreach] = useState<Outreach[]>(() => {
    const s = localStorage.getItem('kl_outreach');
    return s ? JSON.parse(s) : [];
  });

  // Feature 1: Advanced Filters
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    priorityMin: 0,
    priorityMax: 100,
    statuses: [],
    industries: [],
    dateRange: null,
    overdueOnly: false
  });
  const [showFilters, setShowFilters] = useState(false);

  // Feature 6: Email Modal State
  const [isEmailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [currentEmailCid, setCurrentEmailCid] = useState('');

  // Quick Log Visit State
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickLogCid, setQuickLogCid] = useState('');
  const [quickLogOutcome, setQuickLogOutcome] = useState('');
  const [quickLogNotes, setQuickLogNotes] = useState('');

  // Persistence
  useEffect(() => localStorage.setItem('kl_prospects', JSON.stringify(prospects)), [prospects]);
  useEffect(() => localStorage.setItem('kl_outreach', JSON.stringify(outreach)), [outreach]);
  useEffect(() => {
    if (user) localStorage.setItem('kl_user', JSON.stringify(user));
  }, [user]);

  // Mobile Detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Feature 10: Push Notifications
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      const now = new Date();
      if (now.getHours() === 8 && now.getMinutes() === 0) {
        const overdue = prospects.filter(
          p => p.nextVisitDate && new Date(p.nextVisitDate) < new Date() && p.owner === user?.name
        );
        if (overdue.length > 0 && Notification.permission === 'granted') {
          new Notification('K&L CRM Daily Reminder', {
            body: `You have ${overdue.length} overdue visits today.`,
            icon: '/icon-192.png',
            tag: 'daily-reminder'
          });
        }
      }
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [prospects, user]);

  // Feature 1: Smart Filtering
  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      const q = filters.query.toLowerCase();
      const textMatch =
        !q ||
        p.companyName.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q);
      const priMatch = p.priority >= filters.priorityMin && p.priority <= filters.priorityMax;
      const statMatch = filters.statuses.length === 0 || filters.statuses.includes(p.contactStatus);
      const indMatch = filters.industries.length === 0 || filters.industries.includes(p.industry);
      const overdueMatch = !filters.overdueOnly || (p.nextVisitDate && new Date(p.nextVisitDate) < new Date());
      const ownerMatch = user?.role === 'Sales Rep' ? p.owner === user.name : true;

      return textMatch && priMatch && statMatch && indMatch && overdueMatch && ownerMatch;
    });
  }, [prospects, filters, user]);

  // Auth Handlers
  const handleLogin = (username: string) => {
    const role: UserRole = username === 'admin' ? 'Admin' : 'Sales Rep';
    setUser({ username, name: username === 'admin' ? 'Kyle' : username, role });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kl_user');
  };

  // Feature 6: Email Handlers
  const openEmailModal = (cid: string) => {
    setCurrentEmailCid(cid);
    const p = prospects.find(x => x.cid === cid);
    const t = EMAIL_TEMPLATES[0];
    setSelectedTemplate(t.id);
    setEmailSubject(t.subject.replace('{company_name}', p?.companyName || ''));
    setEmailBody(
      t.body
        .replace('{contact_name}', 'Partner')
        .replace('{company_name}', p?.companyName || '')
        .replace('{container_size}', p?.containerSize.toString() || '30')
    );
    setEmailModalOpen(true);
  };

  const applyTemplate = (tid: string) => {
    const t = EMAIL_TEMPLATES.find(x => x.id === tid);
    const p = prospects.find(x => x.cid === currentEmailCid);
    if (t && p) {
      setSelectedTemplate(tid);
      setEmailSubject(t.subject.replace('{company_name}', p.companyName));
      setEmailBody(
        t.body
          .replace('{contact_name}', 'Partner')
          .replace('{company_name}', p.companyName)
          .replace('{container_size}', p.containerSize.toString())
      );
    }
  };

  const sendEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
    setEmailModalOpen(false);
  };

  // Quick Log Visit Handler
  const handleQuickLogSubmit = () => {
    if (!quickLogCid || !quickLogOutcome) {
      alert('Please select company and outcome');
      return;
    }

    const prospect = prospects.find(p => p.cid === quickLogCid);
    if (!prospect) return;

    const mapping = OUTCOME_MAPPING[quickLogOutcome];
    const visitDate = new Date().toISOString();
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + mapping.daysToAdd);

    const newOutreach: Outreach = {
      lid: `LID-${Date.now()}`,
      cid: quickLogCid,
      companyName: prospect.companyName,
      visitDate,
      notes: quickLogNotes,
      outcome: quickLogOutcome,
      stage: mapping.stage,
      status: mapping.status,
      nextVisitDate: nextDate.toISOString(),
      daysSinceLast: 0,
      nextVisitCountdown: mapping.daysToAdd,
      followUpAction: getNextActionRecommendation(prospect).action,
      owner: user?.name || 'System',
      contactType: 'In-Person'
    };

    const updatedOutreach = [...outreach, newOutreach];
    setOutreach(updatedOutreach);

    // Update prospect with new win probability
    setProspects(
      prospects.map(p =>
        p.cid === quickLogCid
          ? {
              ...p,
              lastOutcome: quickLogOutcome,
              lastOutreachDate: visitDate,
              nextVisitDate: nextDate.toISOString(),
              contactStatus: mapping.status as any,
              winProbability: calculateWinProbability(
                { ...p, lastOutcome: quickLogOutcome, lastOutreachDate: visitDate },
                updatedOutreach
              )
            }
          : p
      )
    );

    setQuickLogCid('');
    setQuickLogOutcome('');
    setQuickLogNotes('');
    setShowQuickLog(false);
    alert('✅ Visit logged successfully!');
  };

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🏭</div>
            <h1 className="text-4xl font-bold tracking-wider mb-2">K&L RECYCLING</h1>
            <p className="text-green-200 text-sm">Enterprise Sales CRM</p>
          </div>
          <div className="bg-white text-gray-800 p-8 rounded-xl shadow-2xl space-y-5">
            <h2 className="text-2xl font-bold text-center text-gray-800">Employee Login</h2>
            <input
              id="username_input"
              placeholder="Username (Try 'admin' or 'kyle')"
              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={() =>
                handleLogin((document.getElementById('username_input') as HTMLInputElement).value || 'kyle')
              }
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg"
            >
              Sign In
            </button>
            <div className="text-xs text-gray-500 text-center">
              ✨ Features: Role-Based Access • AI Lead Scoring • Revenue Forecasting
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App UI
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-800">
      {/* Sidebar Navigation */}
      <nav
        className={`${
          isMobile
            ? 'fixed bottom-0 left-0 right-0 h-16 flex-row justify-around items-center border-t bg-white'
            : 'w-64 flex-col bg-gradient-to-b from-green-900 to-green-800 text-white'
        } flex z-50 shadow-xl`}
      >
        {!isMobile && (
          <div className="p-6 border-b border-green-700">
            <h1 className="text-2xl font-bold tracking-wider">K&L CRM</h1>
            <p className="text-green-300 text-sm mt-2">
              {user.name} • {user.role}
            </p>
            <button onClick={handleLogout} className="text-xs text-red-300 hover:text-white mt-3 underline">
              Sign Out
            </button>
          </div>
        )}

        <div className={`flex ${isMobile ? 'w-full justify-around' : 'flex-col px-3 py-6 space-y-2'}`}>
          {[
            { id: 'dashboard', label: 'Home', icon: Icons.Dashboard },
            { id: 'prospects', label: 'Prospects', icon: Icons.Prospects },
            { id: 'outreach', label: 'Visits', icon: Icons.Outreach },
            { id: 'revenue', label: 'Revenue', icon: Icons.Money },
            { id: 'competitors', label: 'Intel', icon: Icons.Competitors },
            { id: 'analytics', label: 'Stats', icon: Icons.Analytics }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`
                ${isMobile ? 'flex-col p-2 text-xs' : 'w-full flex-row px-4 py-3 space-x-3 rounded-lg text-sm'}
                flex items-center justify-center transition-all duration-200
                ${
                  activeTab === item.id
                    ? isMobile
                      ? 'text-green-700 font-bold'
                      : 'bg-green-700 text-white shadow-lg border-l-4 border-green-400'
                    : isMobile
                    ? 'text-gray-400'
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                }
              `}
            >
              <item.icon />
              {!isMobile && <span className="font-medium">{item.label}</span>}
              {isMobile && <span className="mt-1 text-[10px]">{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto ${isMobile ? 'pb-20 p-4' : 'h-screen p-8'}`}>
        {/* Header with Search */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-tight flex items-center gap-3">
            {activeTab === 'dashboard' && '🏠 Dashboard'}
            {activeTab === 'prospects' && '🏢 Prospects'}
            {activeTab === 'outreach' && '📝 Visit Tracking'}
            {activeTab === 'revenue' && '💰 Revenue'}
            {activeTab === 'competitors' && '⚔️ Competitive Intel'}
            {activeTab === 'analytics' && '📊 Analytics'}
          </h2>

          {(activeTab === 'prospects' || activeTab === 'outreach') && (
            <div className="flex-1 w-full md:w-auto md:max-w-xl flex gap-2">
              <div className="relative flex-1">
                <input
                  className="w-full border-2 border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none shadow-sm"
                  placeholder="Search companies, addresses, notes..."
                  value={filters.query}
                  onChange={e => setFilters({ ...filters, query: e.target.value })}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Icons.Search />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  showFilters ? 'bg-green-100 border-green-400 text-green-700' : 'bg-white border-gray-300 text-gray-600'
                }`}
              >
                <Icons.Filter />
              </button>
            </div>
          )}
        </header>

        {/* Feature 1: Advanced Filters Panel */}
        {showFilters && (activeTab === 'prospects' || activeTab === 'outreach') && (
          <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 mb-6 animate-fade-in-down">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase block mb-2">Priority Range</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  value={filters.priorityMin}
                  onChange={e => setFilters({ ...filters, priorityMin: Number(e.target.value) })}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{filters.priorityMin}</span>
                  <span>100</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase block mb-2">Status Filter</label>
                <div className="flex flex-wrap gap-2">
                  {['Hot', 'Warm', 'Cold'].map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        const newS = filters.statuses.includes(s)
                          ? filters.statuses.filter(x => x !== s)
                          : [...filters.statuses, s];
                        setFilters({ ...filters, statuses: newS });
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full border-2 font-semibold transition-all ${
                        filters.statuses.includes(s)
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.overdueOnly}
                    onChange={e => setFilters({ ...filters, overdueOnly: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Overdue Only</span>
                </label>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() =>
                    setFilters({
                      query: '',
                      priorityMin: 0,
                      priorityMax: 100,
                      statuses: [],
                      industries: [],
                      dateRange: null,
                      overdueOnly: false
                    })
                  }
                  className="text-xs text-red-600 hover:text-red-700 underline font-semibold"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Showing {filteredProspects.length} of {prospects.length} prospects
            </div>
          </div>
        )}

        {/* TAB CONTENT */}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Prospects</div>
                  <Icons.Prospects />
                </div>
                <div className="text-4xl font-bold text-gray-800">{prospects.length}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {prospects.filter(p => p.contactStatus === 'Hot').length} Hot Leads
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm border-2 border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-green-700 uppercase tracking-wide">Conversion Rate</div>
                  <div className="text-green-600 text-2xl">✓</div>
                </div>
                <div className="text-4xl font-bold text-green-800">
                  {Math.round((outreach.filter(o => o.outcome === 'Won').length / (outreach.length || 1)) * 100)}%
                </div>
                <div className="text-xs text-green-600 mt-2">
                  {outreach.filter(o => o.outcome === 'Won').length} Won / {outreach.length} Contacts
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-sm border-2 border-red-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-red-600 uppercase tracking-wide">Overdue Visits</div>
                  <div className="text-red-500 text-2xl">⚠️</div>
                </div>
                <div className="text-4xl font-bold text-red-700">
                  {prospects.filter(p => p.nextVisitDate && new Date(p.nextVisitDate) < new Date()).length}
                </div>
                <div className="text-xs text-red-500 mt-2">Immediate Attention Required</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border-2 border-blue-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">This Month</div>
                  <Icons.Outreach />
                </div>
                <div className="text-4xl font-bold text-blue-700">
                  {
                    outreach.filter(o => {
                      const d = new Date(o.visitDate);
                      const now = new Date();
                      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    }).length
                  }
                </div>
                <div className="text-xs text-blue-500 mt-2">Visits Logged</div>
              </div>
            </div>

            {/* Recent Activity + Top Priorities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Visits */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <Icons.Outreach /> Recent Activity
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {outreach.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-4xl mb-2">📭</div>
                      <p className="text-sm">No visits logged yet. Start tracking your outreach!</p>
                    </div>
                  ) : (
                    outreach
                      .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
                      .slice(0, 10)
                      .map(o => (
                        <div key={o.lid} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                          <div
                            className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                              o.outcome === 'Won'
                                ? 'bg-green-500'
                                : o.outcome === 'Interested'
                                ? 'bg-blue-500'
                                : o.outcome === 'Not Interested'
                                ? 'bg-red-500'
                                : 'bg-gray-400'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-800 truncate">{o.companyName}</div>
                            <div className="text-xs text-gray-500">
                              {o.outcome} • {new Date(o.visitDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400 truncate mt-1">{o.notes.slice(0, 80)}...</div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Top Priorities */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  🔥 Top Priorities Today
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {prospects
                    .filter(p => p.contactStatus === 'Hot' || (p.nextVisitDate && new Date(p.nextVisitDate) < new Date()))
                    .sort((a, b) => b.priority - a.priority)
                    .slice(0, 8)
                    .map(p => {
                      const reco = getNextActionRecommendation(p);
                      return (
                        <div
                          key={p.cid}
                          className={`p-3 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer ${
                            reco.urgency === 'critical'
                              ? 'bg-red-50 border-red-300'
                              : reco.urgency === 'high'
                              ? 'bg-orange-50 border-orange-300'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                          onClick={() => setActiveTab('prospects')}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-gray-800 truncate">{p.companyName}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                {reco.icon} {reco.action}
                              </div>
                            </div>
                            <div
                              className={`text-xs font-bold px-2 py-1 rounded-full ${
                                p.winProbability > 70
                                  ? 'bg-green-100 text-green-800'
                                  : p.winProbability > 30
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {p.winProbability}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Pipeline Health Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Pipeline Health</h3>
              <BarChart
                title="Prospects by Status"
                labels={['Hot', 'Warm', 'Cold', 'Active']}
                data={[
                  prospects.filter(p => p.contactStatus === 'Hot').length,
                  prospects.filter(p => p.contactStatus === 'Warm').length,
                  prospects.filter(p => p.contactStatus === 'Cold').length,
                  prospects.filter(p => p.contactStatus === 'Active').length
                ]}
              />
            </div>
          </div>
        )}

        {/* PROSPECTS TAB */}
        {activeTab === 'prospects' && (
          <div className="grid gap-4">
            {filteredProspects.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No prospects found</h3>
                <p className="text-gray-500">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              filteredProspects.map(p => {
                const reco = getNextActionRecommendation(p);
                return (
                  <div
                    key={p.cid}
                    className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-800">{p.companyName}</h3>
                        <div className="text-sm text-gray-500 mt-1">
                          {p.address} • {p.industry}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xs font-bold px-3 py-1.5 rounded-full mb-2 inline-block ${
                            p.winProbability > 70
                              ? 'bg-green-100 text-green-800'
                              : p.winProbability > 30
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.winProbability}% Win
                        </div>
                        <div className="text-xs text-gray-500">Priority: {p.priority}</div>
                      </div>
                    </div>

                    {/* Next Action Recommendation */}
                    <div
                      className={`mt-3 p-4 rounded-lg border-2 flex items-center gap-3 ${
                        reco.urgency === 'critical'
                          ? 'bg-red-50 border-red-300'
                          : reco.urgency === 'high'
                          ? 'bg-orange-50 border-orange-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="text-3xl">{reco.icon}</div>
                      <div className="flex-1">
                        <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
                          AI Recommendation
                        </div>
                        <div className="font-bold text-gray-800 mt-1">{reco.action}</div>
                        <div className="text-xs text-gray-600 mt-1">{reco.reason}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-500">Due</div>
                        <div className={`text-sm font-semibold ${reco.urgency === 'critical' ? 'text-red-600' : 'text-gray-700'}`}>
                          {reco.dueDate}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openEmailModal(p.cid)}
                        className="flex-1 py-2 text-sm font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        📧 Email
                      </button>
                      <button
                        onClick={() => {
                          setQuickLogCid(p.cid);
                          setActiveTab('outreach');
                          setShowQuickLog(true);
                        }}
                        className="flex-1 py-2 text-sm font-semibold bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        ✓ Log Visit
                      </button>
                      <button className="flex-1 py-2 text-sm font-semibold bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        📍 Map
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* OUTREACH TAB */}
        {activeTab === 'outreach' && (
          <div className="space-y-6">
            {/* Quick Log Visit Form */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg shadow-sm border-2 border-green-200">
              <button
                onClick={() => setShowQuickLog(!showQuickLog)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  ➕ Quick Log Visit
                </h3>
                <span className="text-3xl text-gray-400">{showQuickLog ? '−' : '+'}</span>
              </button>

              {showQuickLog && (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-lg border border-gray-200">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase block mb-2">Company *</label>
                    <select
                      value={quickLogCid}
                      onChange={e => setQuickLogCid(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Prospect...</option>
                      {prospects.map(p => (
                        <option key={p.cid} value={p.cid}>
                          {p.companyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase block mb-2">Outcome *</label>
                    <select
                      value={quickLogOutcome}
                      onChange={e => setQuickLogOutcome(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Outcome...</option>
                      {Object.keys(OUTCOME_MAPPING).map(o => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-600 uppercase block mb-2">Visit Notes</label>
                    <textarea
                      value={quickLogNotes}
                      onChange={e => setQuickLogNotes(e.target.value)}
                      placeholder="Met with John. Interested in 30yd container. Competing with AIM but our pricing is better. Follow up next week with quote..."
                      className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm h-28 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={handleQuickLogSubmit}
                        className="px-8 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-bold hover:from-green-700 hover:to-green-800 shadow-md transition-all transform hover:scale-105"
                      >
                        💾 Save Visit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Outreach History Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-5 py-4 text-left font-bold text-gray-700 uppercase text-xs">Date</th>
                      <th className="px-5 py-4 text-left font-bold text-gray-700 uppercase text-xs">Company</th>
                      <th className="px-5 py-4 text-left font-bold text-gray-700 uppercase text-xs">Outcome</th>
                      <th className="px-5 py-4 text-left font-bold text-gray-700 uppercase text-xs">Notes</th>
                      <th className="px-5 py-4 text-left font-bold text-gray-700 uppercase text-xs">Next Visit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {outreach.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                          <div className="text-5xl mb-3">📝</div>
                          <p>No visits logged yet. Use the form above to start tracking!</p>
                        </td>
                      </tr>
                    ) : (
                      outreach
                        .filter(o => (user?.role === 'Sales Rep' ? o.owner === user.name : true))
                        .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
                        .map(o => (
                          <tr key={o.lid} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4 whitespace-nowrap text-gray-600 font-medium">
                              {new Date(o.visitDate).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-4 font-semibold text-gray-800">{o.companyName}</td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                  o.outcome === 'Won'
                                    ? 'bg-green-100 text-green-800'
                                    : o.outcome === 'Interested'
                                    ? 'bg-blue-100 text-blue-700'
                                    : o.outcome === 'Not Interested'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {o.outcome}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-gray-600 max-w-md">
                              <div className="truncate">{o.notes}</div>
                            </td>
                            <td className="px-5 py-4 text-gray-500 whitespace-nowrap text-xs">
                              {new Date(o.nextVisitDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REVENUE TAB */}
        {activeTab === 'revenue' && <RevenueDashboard prospects={prospects} outreach={outreach} />}

        {/* COMPETITORS TAB */}
        {activeTab === 'competitors' && <CompetitorDashboard outreach={outreach} />}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-5 text-lg">Conversion Funnel</h3>
              <BarChart
                title="Pipeline Progression"
                labels={['Prospects', 'Contacted', 'Interested', 'Won']}
                data={[
                  prospects.length,
                  outreach.length,
                  outreach.filter(o => o.outcome === 'Interested').length,
                  outreach.filter(o => o.outcome === 'Won').length
                ]}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-5 text-lg">Activity This Month</h3>
              <BarChart
                title="Visits by Week"
                labels={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
                data={[12, 19, 8, 15]} // Mock data
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-5 text-lg">Top Industries</h3>
              <BarChart
                title="Prospects by Industry"
                labels={['HVAC', 'Metal Fab', 'Roofing', 'Demo']}
                data={[
                  prospects.filter(p => p.industry === 'HVAC').length,
                  prospects.filter(p => p.industry === 'Metal Fabricator').length,
                  prospects.filter(p => p.industry === 'Roofing').length,
                  prospects.filter(p => p.industry === 'Demolition').length
                ]}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600">Avg Days to Close</span>
                  <span className="text-xl font-bold text-gray-800">42</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600">Total Visits (All Time)</span>
                  <span className="text-xl font-bold text-gray-800">{outreach.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600">Win Rate</span>
                  <span className="text-xl font-bold text-green-600">
                    {Math.round((outreach.filter(o => o.outcome === 'Won').length / (outreach.length || 1)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Feature 6: Email Compose Modal */}
      <Modal isOpen={isEmailModalOpen} onClose={() => setEmailModalOpen(false)} title="✉️ Compose Email">
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase block mb-2">Email Template</label>
            <select
              className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
              value={selectedTemplate}
              onChange={e => applyTemplate(e.target.value)}
            >
              {EMAIL_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase block mb-2">Subject Line</label>
            <input
              className="w-full border-2 border-gray-300 rounded-lg p-3 font-semibold text-sm focus:ring-2 focus:ring-blue-500"
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              placeholder="Subject"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase block mb-2">Message Body</label>
            <textarea
              className="w-full border-2 border-gray-300 rounded-lg p-3 h-48 font-mono text-sm focus:ring-2 focus:ring-blue-500"
              value={emailBody}
              onChange={e => setEmailBody(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
            <span>📎 Attachment: Current_Pricing_Sheet.pdf</span>
            <button className="text-blue-600 hover:underline font-semibold">Preview</button>
          </div>

          <button
            onClick={sendEmail}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg transform hover:scale-105"
          >
            📤 Send Email
          </button>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// RENDER APP
// ============================================================================

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
