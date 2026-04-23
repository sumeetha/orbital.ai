export type MessageType = 'agent' | 'prefill-card' | 'quick-reply' | 'user-response' | 'completion';

export type QuickReply = { label: string; value: string };

export type PrefillField = {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'chips' | 'table';
};

export type AgentMessage = {
  id: string;
  topic: 'intro' | 'overview' | 'activation' | 'plans' | 'metrics' | 'friction' | 'guidelines' | 'complete';
  type: MessageType;
  content: string;
  prefillFields?: PrefillField[];
  quickReplies?: QuickReply[];
  sourceAttribution?: string;
  isFollowUp?: boolean;
};

export const conversationScript: AgentMessage[] = [
  // Intro
  {
    id: 'intro-1',
    topic: 'intro',
    type: 'agent',
    content: "Hi Sarah! I've reviewed the docs you uploaded and your product annotation. Let me walk you through a few questions so I can set up the right guidance for your users. I've pre-filled what I could — just confirm or edit.",
  },

  // Topic 1: Product Overview
  {
    id: 'overview-1',
    topic: 'overview',
    type: 'agent',
    content: "Let's start with the basics. Here's what I understand about MailFlow:",
  },
  {
    id: 'overview-2',
    topic: 'overview',
    type: 'prefill-card',
    content: 'Product Overview',
    prefillFields: [
      { key: 'productName', label: 'Product Name', value: 'MailFlow', type: 'text' },
      { key: 'productCategory', label: 'Category', value: 'B2B email marketing SaaS', type: 'text' },
      { key: 'primaryUsers', label: 'Primary Users', value: 'Marketing managers at SMBs, Growth leads at startups', type: 'textarea' },
      { key: 'valueProposition', label: 'Core Value Prop', value: 'Fast path from contact list to measurable email campaign', type: 'textarea' },
    ],
    sourceAttribution: 'Based on: MailFlow Product Guide.pdf, mailflow.io/pricing',
  },
  {
    id: 'overview-3',
    topic: 'overview',
    type: 'agent',
    content: "Got it! Let's talk about activation.",
    isFollowUp: true,
  },

  // Topic 2: Activation Goals
  {
    id: 'activation-1',
    topic: 'activation',
    type: 'agent',
    content: "From your docs and the UI elements you annotated, these look like key activation moments:",
  },
  {
    id: 'activation-2',
    topic: 'activation',
    type: 'prefill-card',
    content: 'Activation Events',
    prefillFields: [
      { key: 'activationEvents', label: 'Activation Events', value: 'First campaign sent, Contacts imported, Template selected, Automation created', type: 'chips' },
    ],
    sourceAttribution: 'Based on: Product docs + annotation tags',
  },
  {
    id: 'activation-3',
    topic: 'activation',
    type: 'agent',
    content: 'Which of these is the primary "aha moment" — the action that most strongly predicts a user will stick around?',
    isFollowUp: true,
  },
  {
    id: 'activation-4',
    topic: 'activation',
    type: 'quick-reply',
    content: '',
    quickReplies: [
      { label: 'First campaign sent', value: 'first_campaign_sent' },
      { label: 'Contacts imported', value: 'contacts_imported' },
      { label: 'Template selected', value: 'template_selected' },
      { label: 'Automation created', value: 'automation_created' },
    ],
  },
  {
    id: 'activation-5',
    topic: 'activation',
    type: 'agent',
    content: "That matches what I've seen in similar products. Users who send their first campaign within 48 hours have the highest retention.",
    isFollowUp: true,
  },

  // Topic 3: Plans
  {
    id: 'plans-1',
    topic: 'plans',
    type: 'agent',
    content: "From your pricing page, I see these plan tiers:",
  },
  {
    id: 'plans-2',
    topic: 'plans',
    type: 'prefill-card',
    content: 'Plan Tiers',
    prefillFields: [
      { key: 'planFree', label: 'Free', value: '500 contacts, Basic templates, Single user', type: 'text' },
      { key: 'planPro', label: 'Pro ($49/mo)', value: 'Unlimited contacts, A/B testing, Automations, Analytics', type: 'text' },
      { key: 'planEnterprise', label: 'Enterprise (Custom)', value: 'Team management, Integrations, Priority support', type: 'text' },
    ],
    sourceAttribution: 'Based on: Pricing & Plans.md, mailflow.io/pricing',
  },
  {
    id: 'plans-3',
    topic: 'plans',
    type: 'agent',
    content: "What's the trial setup?",
    isFollowUp: true,
  },
  {
    id: 'plans-4',
    topic: 'plans',
    type: 'quick-reply',
    content: '',
    quickReplies: [
      { label: '14-day Pro trial', value: '14_day_trial' },
      { label: '7-day trial', value: '7_day_trial' },
      { label: 'No trial, freemium only', value: 'freemium' },
    ],
  },
  {
    id: 'plans-5',
    topic: 'plans',
    type: 'agent',
    content: "And what happens at trial end?",
    isFollowUp: true,
  },
  {
    id: 'plans-6',
    topic: 'plans',
    type: 'quick-reply',
    content: '',
    quickReplies: [
      { label: 'Downgrade to Free', value: 'downgrade' },
      { label: 'Lose access entirely', value: 'lose_access' },
      { label: 'Grace period (7 days)', value: 'grace_period' },
    ],
  },

  // Topic 4: Metrics
  {
    id: 'metrics-1',
    topic: 'metrics',
    type: 'agent',
    content: "Now for the metrics that matter. What signals tell you a user is at risk of not converting — or churning?",
  },
  {
    id: 'metrics-2',
    topic: 'metrics',
    type: 'quick-reply',
    content: 'Select all that apply, or type your own:',
    quickReplies: [
      { label: 'No campaign sent in 3+ days', value: 'no_campaign_3d' },
      { label: 'Trial expiring without upgrade', value: 'trial_expiring' },
      { label: 'Low open rates (< 15%)', value: 'low_open_rates' },
      { label: 'No automation created by day 7', value: 'no_automation_d7' },
      { label: 'Visited pricing but didn\'t upgrade', value: 'pricing_no_upgrade' },
      { label: 'Campaign wizard abandoned mid-flow', value: 'wizard_abandoned' },
    ],
  },
  {
    id: 'metrics-3',
    topic: 'metrics',
    type: 'agent',
    content: "Great choices. I'll use these as trigger signals for the guidance I suggest.",
    isFollowUp: true,
  },

  // Topic 5: Friction
  {
    id: 'friction-1',
    topic: 'friction',
    type: 'agent',
    content: "Based on your annotation and docs, I spotted some potential friction areas:",
  },
  {
    id: 'friction-2',
    topic: 'friction',
    type: 'prefill-card',
    content: 'Friction Points',
    prefillFields: [
      { key: 'frictionPoints', label: 'Known Friction Points', value: 'Audience selection in campaign wizard (tagged as Friction Risk during annotation), Template gallery — new users overwhelmed by choices, Automation builder — powerful but undiscovered by trial users', type: 'chips' },
    ],
    sourceAttribution: 'Based on: Annotation tags + Help Center docs',
  },
  {
    id: 'friction-3',
    topic: 'friction',
    type: 'agent',
    content: "Are there others you've observed?",
    isFollowUp: true,
  },
  {
    id: 'friction-4',
    topic: 'friction',
    type: 'quick-reply',
    content: '',
    quickReplies: [
      { label: 'Subject line writing', value: 'subject_lines' },
      { label: 'Deliverability settings', value: 'deliverability' },
      { label: 'That covers it', value: 'none' },
    ],
  },

  // Topic 6: General Guidelines
  {
    id: 'guidelines-1',
    topic: 'guidelines',
    type: 'agent',
    content: "Almost done. Beyond friction areas, is there anything else the in-product assistant should always follow—internal rules, preferred terminology, compliance notes, or topics to avoid?",
  },
  {
    id: 'guidelines-2',
    topic: 'guidelines',
    type: 'prefill-card',
    content: 'General Guidelines',
    prefillFields: [
      {
        key: 'generalGuidelines',
        label: 'Additional instructions, rules & things to address',
        value: 'Use plain language; avoid promising specific deliverability outcomes; when users ask about GDPR, point them to our Trust Center.',
        type: 'textarea',
      },
    ],
    sourceAttribution: 'Optional — add anything not already covered above',
  },
  {
    id: 'guidelines-3',
    topic: 'guidelines',
    type: 'agent',
    content: "Got it. I'll treat these as guardrails when drafting tours, nudges, and in-app copy.",
    isFollowUp: true,
  },

  // Completion
  {
    id: 'complete-1',
    topic: 'complete',
    type: 'agent',
    content: "Setup complete! I now have a clear picture of MailFlow, your goals, your plan structure, risk signals, and how you want guidance framed. Let me generate some intelligent suggestions for your users.",
  },
  {
    id: 'complete-2',
    topic: 'complete',
    type: 'completion',
    content: 'View AI Suggestions',
  },
];

export const topicOrder = ['overview', 'activation', 'plans', 'metrics', 'friction', 'guidelines'] as const;
export type Topic = (typeof topicOrder)[number];

export const topicLabels: Record<string, string> = {
  overview: 'Product Overview',
  activation: 'Activation Goals',
  plans: 'Trial & Plan Structure',
  metrics: 'Key Metrics',
  friction: 'Friction Points',
  guidelines: 'General Guidelines',
};
