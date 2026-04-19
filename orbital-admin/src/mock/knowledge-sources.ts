export type KnowledgeSource = {
  id: string;
  type: 'document' | 'url';
  name: string;
  status: 'processing' | 'ready' | 'failed';
  addedAt: string;
};

export type ExtractedKnowledge = {
  productSummary: string;
  planTiers: { name: string; features: string[]; price: string }[];
  activationEvents: string[];
  paidFeatures: string[];
  frictionPoints: string[];
};

export const sampleSources: KnowledgeSource[] = [
  { id: 'doc-1', type: 'document', name: 'MailFlow Product Guide.pdf', status: 'ready', addedAt: new Date().toISOString() },
  { id: 'doc-2', type: 'document', name: 'Pricing & Plans.md', status: 'ready', addedAt: new Date().toISOString() },
  { id: 'doc-3', type: 'document', name: 'Help Center — Getting Started.txt', status: 'ready', addedAt: new Date().toISOString() },
  { id: 'url-1', type: 'url', name: 'docs.mailflow.io/getting-started', status: 'ready', addedAt: new Date().toISOString() },
  { id: 'url-2', type: 'url', name: 'mailflow.io/pricing', status: 'ready', addedAt: new Date().toISOString() },
  { id: 'url-3', type: 'url', name: 'mailflow.io/changelog', status: 'ready', addedAt: new Date().toISOString() },
];

export const sampleExtracted: ExtractedKnowledge = {
  productSummary:
    'MailFlow is a B2B email marketing platform for small and mid-sized marketing teams. It helps users create, send, and measure email campaigns with an intuitive interface that bridges the gap between simple newsletter tools and enterprise marketing clouds.',
  planTiers: [
    { name: 'Free', features: ['500 contacts', 'Basic templates', 'Single user', 'Standard analytics'], price: '$0' },
    { name: 'Pro', features: ['Unlimited contacts', 'A/B testing', 'Automations', 'Advanced analytics', '3 team seats'], price: '$49/mo' },
    { name: 'Enterprise', features: ['Everything in Pro', 'Team management', 'Integrations (Slack, HubSpot, Salesforce)', 'Priority support', 'Custom domain'], price: 'Custom' },
  ],
  activationEvents: ['First campaign sent', 'Contacts imported', 'Template selected', 'Automation created'],
  paidFeatures: ['A/B testing', 'Automations', 'Advanced analytics', 'Team seats', 'Integrations'],
  frictionPoints: [
    'Audience selection is confusing for new users who haven\'t created segments',
    'Template gallery can overwhelm first-time users with too many choices',
    'Automation builder is powerful but undiscovered by most trial users',
  ],
};
