export type KpiMetric = {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: number[];
};

export type RiskSignal = {
  id: string;
  label: string;
  orgCount: number;
  severity: 'high' | 'medium' | 'low';
  description: string;
};

export type EngagementPerformance = {
  engagementId: string;
  name: string;
  type: 'tour' | 'nudge' | 'feedback';
  impressions: number;
  completions: number;
  dismissals: number;
  conversionLift: number;
};

export const mockKpis: KpiMetric[] = [
  {
    id: 'kpi-activation',
    label: 'Activation Rate',
    value: '34.2%',
    change: 5.3,
    trend: [28, 29, 31, 30, 32, 33, 34],
  },
  {
    id: 'kpi-trial-conversion',
    label: 'Trial Conversion',
    value: '18.7%',
    change: 2.1,
    trend: [15, 16, 15, 17, 16, 18, 19],
  },
  {
    id: 'kpi-aha-time',
    label: 'Avg Time to Aha',
    value: '2.3 days',
    change: -0.4,
    trend: [3.1, 2.9, 2.8, 2.7, 2.6, 2.4, 2.3],
  },
  {
    id: 'kpi-reach',
    label: 'Engagement Reach',
    value: '72.4%',
    change: 8.6,
    trend: [58, 61, 63, 65, 68, 70, 72],
  },
];

export const mockRiskSignals: RiskSignal[] = [
  {
    id: 'risk-no-campaign',
    label: 'No campaign sent in 3+ days',
    orgCount: 42,
    severity: 'high',
    description: 'Orgs that signed up but haven\'t sent their first campaign within 3 days',
  },
  {
    id: 'risk-trial-expiring',
    label: 'Trial expiring without upgrade',
    orgCount: 18,
    severity: 'high',
    description: 'Trial orgs with ≤3 days remaining that haven\'t started an upgrade',
  },
  {
    id: 'risk-low-open',
    label: 'Low open rates (< 15%)',
    orgCount: 27,
    severity: 'medium',
    description: 'Orgs whose 7-day average open rate has dropped below 15%',
  },
  {
    id: 'risk-no-automation',
    label: 'No automation by day 7',
    orgCount: 35,
    severity: 'medium',
    description: 'Pro trial orgs that haven\'t created any automations by their 7th day',
  },
  {
    id: 'risk-wizard-abandon',
    label: 'Campaign wizard abandoned',
    orgCount: 14,
    severity: 'low',
    description: 'Orgs that started the campaign wizard but navigated away before sending',
  },
  {
    id: 'risk-pricing-bounce',
    label: 'Visited pricing but didn\'t upgrade',
    orgCount: 23,
    severity: 'low',
    description: 'Orgs that viewed the pricing page in the last 7 days without converting',
  },
];

export const mockEngagementPerformance: EngagementPerformance[] = [
  { engagementId: 'eng-1', name: 'First Campaign Activation Tour', type: 'tour', impressions: 342, completions: 198, dismissals: 44, conversionLift: 12.4 },
  { engagementId: 'eng-2', name: 'Import Contacts Reminder', type: 'nudge', impressions: 189, completions: 72, dismissals: 31, conversionLift: 8.2 },
  { engagementId: 'eng-3', name: 'Audience Selection Rescue', type: 'nudge', impressions: 87, completions: 61, dismissals: 8, conversionLift: 15.7 },
  { engagementId: 'eng-5', name: 'Trial Expiry Conversion Nudge', type: 'nudge', impressions: 124, completions: 41, dismissals: 19, conversionLift: 6.3 },
  { engagementId: 'eng-6', name: 'Onboarding Satisfaction Check', type: 'feedback', impressions: 210, completions: 156, dismissals: 22, conversionLift: 3.1 },
  { engagementId: 'eng-7', name: 'Feature Request Feedback', type: 'feedback', impressions: 98, completions: 45, dismissals: 17, conversionLift: 1.8 },
];
