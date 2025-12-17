// ============================================================================
// EXPORTED TYPES FOR OTHER MODULES
// ============================================================================

export type UserRole = 'Admin' | 'Manager' | 'Sales Rep';
export type TabType = 'dashboard' | 'prospects' | 'outreach' | 'map' | 'analytics' | 'competitors' | 'revenue';

export interface User {
  username: string;
  role: UserRole;
  name: string;
}

export interface SearchFilters {
  query: string;
  priorityMin: number;
  priorityMax: number;
  statuses: string[];
  industries: string[];
  dateRange: { start: string; end: string } | null;
  overdueOnly: boolean;
}

export interface Prospect {
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

export interface Outreach {
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

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}
