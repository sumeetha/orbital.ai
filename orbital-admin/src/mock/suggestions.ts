export type TriggerType = 'state' | 'behavioral' | 'metric';

export type TriggerCondition =
  | { type: 'state'; field: string; op: string; value: string | number | boolean }
  | { type: 'behavioral'; behavior: string; targetElement?: string; threshold?: string }
  | { type: 'metric'; metric: string; op: string; value: number };

export type SuggestionStep = {
  targetElement: string;
  message: string;
};

import type { EngagementSubType } from './engagements';

export type Suggestion = {
  id: string;
  title: string;
  status: 'suggested' | 'accepted' | 'dismissed';
  triggerType: TriggerType;
  triggers: TriggerCondition[];
  triggerSummary: string;
  segment: string;
  actionType: 'tour' | 'nudge' | 'feedback';
  actionSubType?: EngagementSubType;
  steps: SuggestionStep[];
  rationale: string;
};

export type RateLimits = {
  maxToursPerDay: number;
  maxNudgesPerSession: number;
  cooldownHours: number;
  cooldownAfterDismissalHours: number;
  maxTooltipsOnScreen: number;
  suppressAfterDismissals: number;
  priorityOrder: TriggerType[];
};

export const defaultRateLimits: RateLimits = {
  maxToursPerDay: 2,
  maxNudgesPerSession: 1,
  cooldownHours: 4,
  cooldownAfterDismissalHours: 24,
  maxTooltipsOnScreen: 1,
  suppressAfterDismissals: 3,
  priorityOrder: ['behavioral', 'metric', 'state'],
};

export const mockSuggestions: Suggestion[] = [
  {
    id: 'sug-1',
    title: 'First Campaign Activation Tour',
    status: 'suggested',
    triggerType: 'state',
    triggers: [
      { type: 'state', field: 'plan', op: 'eq', value: 'free' },
      { type: 'state', field: 'campaigns_sent', op: 'eq', value: 0 },
      { type: 'state', field: 'account_age_hours', op: 'gt', value: 48 },
    ],
    triggerSummary: 'New free user, no campaign sent in 48h',
    segment: 'Free plan users, first 7 days',
    actionType: 'tour',
    steps: [
      { targetElement: 'Dashboard empty state', message: 'Welcome to MailFlow! Let\'s send your first campaign — it only takes a few minutes.' },
      { targetElement: 'Create Campaign button', message: 'Click here to start creating your first campaign.' },
      { targetElement: 'Template gallery', message: 'Start by choosing a template. Newsletter templates work great for a first send.' },
      { targetElement: 'Audience selector', message: 'Not sure who to send to? Start with "All Contacts" for your first campaign.' },
      { targetElement: 'Subject line input', message: 'Your subject line drives opens. Try something clear and benefit-driven.' },
      { targetElement: 'Review & Send', message: 'Review everything here, then click "Send Campaign" when you\'re ready.' },
      { targetElement: 'Post-send celebration', message: 'Nice work — your first campaign is live! Want tips on tracking performance?' },
    ],
    rationale: 'Your primary activation goal is "first campaign sent." This tour targets the exact flow you annotated, guiding new users who haven\'t yet hit the aha moment.',
  },
  {
    id: 'sug-2',
    title: 'Import Contacts Reminder',
    status: 'suggested',
    triggerType: 'state',
    triggers: [
      { type: 'state', field: 'campaigns_sent', op: 'gte', value: 1 },
      { type: 'state', field: 'contact_count', op: 'lt', value: 10 },
    ],
    triggerSummary: 'Has sent a campaign but fewer than 10 contacts',
    segment: 'All users with few contacts',
    actionType: 'nudge',
    actionSubType: 'spotlight',
    steps: [
      { targetElement: 'Import Contacts button', message: 'Your campaigns will have more impact with a larger audience. Import your contacts in under a minute.' },
    ],
    rationale: 'Users with fewer than 10 contacts see limited campaign value. This nudge surfaces the import flow you annotated.',
  },
  {
    id: 'sug-3',
    title: 'Audience Selection Rescue',
    status: 'suggested',
    triggerType: 'behavioral',
    triggers: [
      { type: 'behavioral', behavior: 'rage_clicks', targetElement: 'Audience dropdown', threshold: '3+ clicks in 5s' },
    ],
    triggerSummary: 'Rage clicks on audience dropdown in campaign wizard',
    segment: 'Any user in campaign wizard, step 2',
    actionType: 'nudge',
    actionSubType: 'spotlight',
    steps: [
      { targetElement: 'Audience selector', message: 'Not sure who to send to? Start with "All Contacts" for your first campaign.' },
    ],
    rationale: 'You flagged audience selection as a friction risk during annotation. This spotlight fires when a user shows signs of confusion.',
  },
  {
    id: 'sug-4',
    title: 'Template Decision Paralysis Help',
    status: 'suggested',
    triggerType: 'behavioral',
    triggers: [
      { type: 'behavioral', behavior: 'decision_paralysis', targetElement: 'Template gallery', threshold: '30s+ without selecting' },
    ],
    triggerSummary: '30s+ on template gallery without selecting',
    segment: 'Users on wizard step 1',
    actionType: 'nudge',
    actionSubType: 'popup',
    steps: [
      { targetElement: 'Template gallery', message: 'Newsletter templates work great for a first send. Want me to recommend one?' },
    ],
    rationale: 'Your docs mention template choice can overwhelm new users. This popup intervenes when scrolling behavior suggests indecision.',
  },
  {
    id: 'sug-5',
    title: 'Wizard Abandonment Recovery',
    status: 'suggested',
    triggerType: 'behavioral',
    triggers: [
      { type: 'behavioral', behavior: 'exit_intent', targetElement: 'Campaign wizard', threshold: 'Navigate away from step 2 or 3' },
    ],
    triggerSummary: 'User navigates away from campaign wizard mid-flow',
    segment: 'Users who started but didn\'t finish a campaign',
    actionType: 'nudge',
    actionSubType: 'banner',
    steps: [
      { targetElement: 'Dashboard', message: 'You were halfway through creating a campaign. Want to pick up where you left off?' },
    ],
    rationale: 'You defined "campaign wizard abandoned mid-flow" as a risk metric. This recovers users who left before sending.',
  },
  {
    id: 'sug-6',
    title: 'Settings Page Confusion Rescue',
    status: 'suggested',
    triggerType: 'behavioral',
    triggers: [
      { type: 'behavioral', behavior: 'scroll_thrashing', targetElement: 'Settings page', threshold: '3+ rapid scrolls in 10s' },
    ],
    triggerSummary: 'Scroll thrashing on settings page',
    segment: 'Any user on Settings',
    actionType: 'nudge',
    actionSubType: 'spotlight',
    steps: [
      { targetElement: 'Settings tabs', message: 'Looking for something specific? Billing is under the "Billing" tab, team invites are under "Team".' },
    ],
    rationale: 'Settings pages with multiple tabs often cause disorientation. This fires when scroll behavior suggests the user can\'t find what they need.',
  },
  {
    id: 'sug-7',
    title: 'Automation Discovery Tour',
    status: 'suggested',
    triggerType: 'metric',
    triggers: [
      { type: 'metric', metric: 'campaigns_sent', op: 'gte', value: 3 },
      { type: 'metric', metric: 'automations_created', op: 'eq', value: 0 },
      { type: 'metric', metric: 'trial_day', op: 'gte', value: 7 },
    ],
    triggerSummary: '3+ campaigns sent, no automations, trial day 7+',
    segment: 'Pro trial users, day 7+',
    actionType: 'tour',
    steps: [
      { targetElement: 'Dashboard', message: "You're getting great engagement on your campaigns. Want to automate follow-ups?" },
      { targetElement: 'Automations sidebar', message: 'This is where you can create automated workflows.' },
      { targetElement: 'Create Automation button', message: 'Click here to build your first automation.' },
      { targetElement: 'Trigger selection', message: 'Choose what starts the automation — for example, "Email not opened".' },
      { targetElement: 'Add email step', message: 'Now create your follow-up email here.' },
      { targetElement: 'Completion', message: 'Nice — this automation will help you recover missed engagement.' },
    ],
    rationale: 'You defined "no automation by day 7" as a conversion risk. Automations are a paid feature — discovering them increases upgrade likelihood.',
  },
  {
    id: 'sug-8',
    title: 'Trial Expiry Conversion Banner',
    status: 'suggested',
    triggerType: 'metric',
    triggers: [
      { type: 'metric', metric: 'trial_days_remaining', op: 'lte', value: 3 },
      { type: 'state', field: 'has_used_paid_feature', op: 'eq', value: true },
    ],
    triggerSummary: 'Trial ending in ≤3 days, has used paid features',
    segment: 'Trial users nearing expiry',
    actionType: 'nudge',
    actionSubType: 'banner',
    steps: [
      { targetElement: 'Upgrade button', message: "You've been using automations and A/B testing — upgrading ensures they keep running after your trial ends." },
    ],
    rationale: 'Tied to your "trial expiring without upgrade" risk metric. Only shown to users who\'ve engaged with paid features, so the message is relevant.',
  },
  {
    id: 'sug-9',
    title: 'Engagement Drop-off Alert',
    status: 'suggested',
    triggerType: 'metric',
    triggers: [
      { type: 'metric', metric: 'open_rate_7d', op: 'lt', value: 15 },
    ],
    triggerSummary: 'Open rate drops below 15% over 7 days',
    segment: 'Users with 3+ sent campaigns',
    actionType: 'nudge',
    actionSubType: 'modal',
    steps: [
      { targetElement: 'Analytics page', message: 'Your open rates dipped this week. Want tips on improving subject lines and send times?' },
    ],
    rationale: 'Linked to your "low open rates" risk metric. Surfaces guidance before the user gets discouraged by declining performance.',
  },
  {
    id: 'sug-10',
    title: 'Post-Onboarding Satisfaction Check',
    status: 'suggested',
    triggerType: 'state',
    triggers: [
      { type: 'state', field: 'onboarding_complete', op: 'eq', value: true },
      { type: 'state', field: 'campaigns_sent', op: 'gte', value: 1 },
    ],
    triggerSummary: 'User completed onboarding and sent first campaign',
    segment: 'All new users, post-onboarding',
    actionType: 'feedback',
    actionSubType: 'micro-survey',
    steps: [
      { targetElement: 'Post-tour overlay', message: 'How was your onboarding experience? (1-5 scale)' },
    ],
    rationale: 'Gathering quick feedback immediately after onboarding helps identify friction points while the experience is fresh. Micro survey format keeps response rates high.',
  },
  {
    id: 'sug-11',
    title: 'Monthly NPS Collection',
    status: 'suggested',
    triggerType: 'metric',
    triggers: [
      { type: 'metric', metric: 'days_since_last_nps', op: 'gte', value: 30 },
      { type: 'metric', metric: 'sessions_last_7d', op: 'gte', value: 2 },
    ],
    triggerSummary: '30+ days since last NPS, active in last 7 days',
    segment: 'All active users',
    actionType: 'feedback',
    actionSubType: 'nps',
    steps: [
      { targetElement: 'Dashboard overlay', message: 'How likely are you to recommend MailFlow to a colleague? (0-10)' },
    ],
    rationale: 'Regular NPS tracking provides a health score for your user base. Only shown to active users to ensure meaningful responses.',
  },
  {
    id: 'sug-12',
    title: 'Template Usefulness Rating',
    status: 'suggested',
    triggerType: 'state',
    triggers: [
      { type: 'state', field: 'campaign_sent_with_template', op: 'eq', value: true },
    ],
    triggerSummary: 'User sends a campaign using a template',
    segment: 'Users who used templates',
    actionType: 'feedback',
    actionSubType: 'like-dislike',
    steps: [
      { targetElement: 'Post-send confirmation', message: 'Was this template helpful?' },
    ],
    rationale: 'A quick like/dislike after template use helps surface which templates drive value and which need improvement. Minimal friction ensures high response rate.',
  },
];
