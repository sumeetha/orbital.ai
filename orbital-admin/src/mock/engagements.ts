export type EngagementType = 'tour' | 'nudge' | 'feedback';
export type EngagementStatus = 'active' | 'paused' | 'draft';

export type FeedbackSubType = 'micro-survey' | 'nps' | 'like-dislike' | 'star-rating' | 'large-survey';
export type NudgeSubType = 'spotlight' | 'checklist' | 'banner' | 'popup' | 'modal';
export type EngagementSubType = FeedbackSubType | NudgeSubType;

export type Engagement = {
  id: string;
  name: string;
  type: EngagementType;
  subType?: EngagementSubType;
  status: EngagementStatus;
  triggerSummary: string;
  segment: string;
  lastTriggered: string;
  impressions: number;
  completions: number;
  dismissals: number;
  conversionRate: number;
  linkedDraftId: string | null;
};

export const mockEngagements: Engagement[] = [
  // --- Tours ---
  {
    id: 'eng-1',
    name: 'First Campaign Activation Tour',
    type: 'tour',
    status: 'active',
    triggerSummary: 'New free user, no campaign sent in 48h',
    segment: 'Free plan users, first 7 days',
    lastTriggered: '2 hours ago',
    impressions: 342,
    completions: 198,
    dismissals: 44,
    conversionRate: 57.9,
    linkedDraftId: 'sug-1',
  },
  {
    id: 'eng-4',
    name: 'Automation Discovery Tour',
    type: 'tour',
    status: 'paused',
    triggerSummary: '3+ campaigns sent, no automations, trial day 7+',
    segment: 'Pro trial users, day 7+',
    lastTriggered: '3 days ago',
    impressions: 56,
    completions: 23,
    dismissals: 12,
    conversionRate: 41.1,
    linkedDraftId: 'sug-7',
  },

  // --- Nudges: Spotlights ---
  {
    id: 'eng-2',
    name: 'Import Contacts Reminder',
    type: 'nudge',
    subType: 'spotlight',
    status: 'active',
    triggerSummary: 'Has sent a campaign but fewer than 10 contacts',
    segment: 'All users with few contacts',
    lastTriggered: '35 min ago',
    impressions: 189,
    completions: 72,
    dismissals: 31,
    conversionRate: 38.1,
    linkedDraftId: 'sug-2',
  },
  {
    id: 'eng-3',
    name: 'Audience Selection Rescue',
    type: 'nudge',
    subType: 'spotlight',
    status: 'active',
    triggerSummary: 'Rage clicks on audience dropdown',
    segment: 'Any user in campaign wizard, step 2',
    lastTriggered: '1 hour ago',
    impressions: 87,
    completions: 61,
    dismissals: 8,
    conversionRate: 70.1,
    linkedDraftId: 'sug-3',
  },

  // --- Nudges: Checklist ---
  {
    id: 'eng-10',
    name: 'New User Onboarding Checklist',
    type: 'nudge',
    subType: 'checklist',
    status: 'active',
    triggerSummary: 'First login, no campaign sent',
    segment: 'New users, first 3 days',
    lastTriggered: '1 hour ago',
    impressions: 410,
    completions: 267,
    dismissals: 38,
    conversionRate: 65.1,
    linkedDraftId: null,
  },

  // --- Nudges: Banner ---
  {
    id: 'eng-5',
    name: 'Trial Expiry Conversion Banner',
    type: 'nudge',
    subType: 'banner',
    status: 'active',
    triggerSummary: 'Trial ending in ≤3 days, has used paid features',
    segment: 'Trial users nearing expiry',
    lastTriggered: '6 hours ago',
    impressions: 124,
    completions: 41,
    dismissals: 19,
    conversionRate: 33.1,
    linkedDraftId: 'sug-8',
  },

  // --- Nudges: Popup ---
  {
    id: 'eng-11',
    name: 'Template Gallery Highlight',
    type: 'nudge',
    subType: 'popup',
    status: 'active',
    triggerSummary: 'User has not used templates after 5+ campaigns',
    segment: 'Active users, no templates used',
    lastTriggered: '4 hours ago',
    impressions: 156,
    completions: 89,
    dismissals: 21,
    conversionRate: 57.1,
    linkedDraftId: null,
  },

  // --- Nudges: Modal ---
  {
    id: 'eng-12',
    name: 'Upgrade Plan Prompt',
    type: 'nudge',
    subType: 'modal',
    status: 'paused',
    triggerSummary: 'Reached 80% of free plan limits',
    segment: 'Free plan users near limits',
    lastTriggered: '2 days ago',
    impressions: 78,
    completions: 32,
    dismissals: 15,
    conversionRate: 41.0,
    linkedDraftId: null,
  },

  // --- Feedback: Micro Survey ---
  {
    id: 'eng-6',
    name: 'Onboarding Satisfaction Check',
    type: 'feedback',
    subType: 'micro-survey',
    status: 'active',
    triggerSummary: 'User completes onboarding tour',
    segment: 'All new users, post-tour',
    lastTriggered: '4 hours ago',
    impressions: 210,
    completions: 156,
    dismissals: 22,
    conversionRate: 74.3,
    linkedDraftId: null,
  },

  // --- Feedback: NPS ---
  {
    id: 'eng-8',
    name: 'Monthly NPS Score',
    type: 'feedback',
    subType: 'nps',
    status: 'active',
    triggerSummary: 'Monthly NPS collection',
    segment: 'All active users',
    lastTriggered: '1 day ago',
    impressions: 430,
    completions: 289,
    dismissals: 54,
    conversionRate: 67.2,
    linkedDraftId: null,
  },

  // --- Feedback: Like/Dislike ---
  {
    id: 'eng-13',
    name: 'Template Usefulness Rating',
    type: 'feedback',
    subType: 'like-dislike',
    status: 'active',
    triggerSummary: 'After user sends campaign using a template',
    segment: 'Users who used templates',
    lastTriggered: '3 hours ago',
    impressions: 315,
    completions: 248,
    dismissals: 12,
    conversionRate: 78.7,
    linkedDraftId: null,
  },

  // --- Feedback: Star Rating ---
  {
    id: 'eng-14',
    name: 'Campaign Editor Experience',
    type: 'feedback',
    subType: 'star-rating',
    status: 'active',
    triggerSummary: 'After 3rd campaign published',
    segment: 'Users who sent 3+ campaigns',
    lastTriggered: '5 hours ago',
    impressions: 142,
    completions: 98,
    dismissals: 18,
    conversionRate: 69.0,
    linkedDraftId: null,
  },

  // --- Feedback: Large Survey ---
  {
    id: 'eng-7',
    name: 'Feature Request Feedback',
    type: 'feedback',
    subType: 'large-survey',
    status: 'paused',
    triggerSummary: 'User has been active for 14+ days',
    segment: 'Active users, 14+ days',
    lastTriggered: '1 day ago',
    impressions: 98,
    completions: 45,
    dismissals: 17,
    conversionRate: 45.9,
    linkedDraftId: null,
  },
];
