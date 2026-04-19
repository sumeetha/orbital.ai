export type HotspotTag = 'Key Activation Point' | 'Paid Feature' | 'Friction Risk' | 'Navigation';

export type Hotspot = {
  id: string;
  page: 'dashboard' | 'campaigns' | 'wizard' | 'automations' | 'settings';
  elementName: string;
  elementType: 'button' | 'link' | 'input' | 'section';
  position: { top: string; left: string; width: string; height: string };
  aiDescription: string;
  tags: HotspotTag[];
  confidence: 'high' | 'medium';
  relatedTo?: string[];
};

export const hotspots: Hotspot[] = [
  // Dashboard
  {
    id: 'hs-dash-kpi-sent',
    page: 'dashboard',
    elementName: 'Emails Sent KPI',
    elementType: 'section',
    position: { top: '12%', left: '4%', width: '22%', height: '12%' },
    aiDescription: 'Top-level metric card showing total emails sent in the last 30 days. Gives users immediate feedback on campaign activity.',
    tags: [],
    confidence: 'high',
  },
  {
    id: 'hs-dash-kpi-openrate',
    page: 'dashboard',
    elementName: 'Open Rate KPI',
    elementType: 'section',
    position: { top: '12%', left: '27%', width: '22%', height: '12%' },
    aiDescription: 'Displays the average open rate across all campaigns. A key health indicator for email performance.',
    tags: [],
    confidence: 'high',
  },
  {
    id: 'hs-dash-quickstart-create',
    page: 'dashboard',
    elementName: 'Create Campaign Quickstart',
    elementType: 'button',
    position: { top: '28%', left: '4%', width: '28%', height: '10%' },
    aiDescription: 'Primary call-to-action on the dashboard that initiates the campaign creation wizard. Key activation point — new users who click this within their first session are 3x more likely to send their first campaign.',
    tags: ['Key Activation Point'],
    confidence: 'high',
    relatedTo: ['hs-wizard-template-gallery'],
  },
  {
    id: 'hs-dash-quickstart-import',
    page: 'dashboard',
    elementName: 'Import Contacts Quickstart',
    elementType: 'button',
    position: { top: '28%', left: '34%', width: '28%', height: '10%' },
    aiDescription: 'Secondary quickstart action for importing contacts. Prerequisite for meaningful campaign sends.',
    tags: ['Key Activation Point'],
    confidence: 'high',
  },
  {
    id: 'hs-dash-recent-table',
    page: 'dashboard',
    elementName: 'Recent Campaigns Table',
    elementType: 'section',
    position: { top: '42%', left: '4%', width: '60%', height: '30%' },
    aiDescription: 'Shows the 5 most recent campaigns with status and key metrics. Provides at-a-glance performance feedback.',
    tags: [],
    confidence: 'high',
  },
  {
    id: 'hs-dash-sidebar-campaigns',
    page: 'dashboard',
    elementName: 'Sidebar: Campaigns',
    elementType: 'link',
    position: { top: '25%', left: '0%', width: '3.5%', height: '4%' },
    aiDescription: 'Primary navigation to the campaigns list. Most-used nav item after dashboard.',
    tags: ['Navigation'],
    confidence: 'high',
  },
  {
    id: 'hs-dash-sidebar-automations',
    page: 'dashboard',
    elementName: 'Sidebar: Automations',
    elementType: 'link',
    position: { top: '37%', left: '0%', width: '3.5%', height: '4%' },
    aiDescription: 'Navigation to automations. This is a paid-plan feature area that trial users often don\'t discover.',
    tags: ['Paid Feature'],
    confidence: 'high',
  },
  // Campaign Wizard
  {
    id: 'hs-wizard-template-gallery',
    page: 'wizard',
    elementName: 'Template Gallery',
    elementType: 'section',
    position: { top: '18%', left: '8%', width: '84%', height: '45%' },
    aiDescription: 'Step 1 of campaign creation. Users choose from categorized templates. Can cause decision paralysis for new users.',
    tags: ['Friction Risk'],
    confidence: 'high',
  },
  {
    id: 'hs-wizard-audience-dropdown',
    page: 'wizard',
    elementName: 'Audience Selector',
    elementType: 'input',
    position: { top: '20%', left: '8%', width: '50%', height: '8%' },
    aiDescription: 'Step 2 — audience selection dropdown. Users choose a segment or "All Contacts". Frequently confusing for first-time users who haven\'t created segments yet.',
    tags: ['Friction Risk'],
    confidence: 'high',
  },
  {
    id: 'hs-wizard-subject-input',
    page: 'wizard',
    elementName: 'Subject Line Input',
    elementType: 'input',
    position: { top: '32%', left: '8%', width: '60%', height: '6%' },
    aiDescription: 'Step 3 — subject line input. Drives open rates. Many users struggle with writing effective subjects.',
    tags: [],
    confidence: 'high',
  },
  {
    id: 'hs-wizard-add-variant',
    page: 'wizard',
    elementName: 'Add A/B Variant Button',
    elementType: 'button',
    position: { top: '40%', left: '8%', width: '20%', height: '5%' },
    aiDescription: 'Adds a second subject line for split testing. This is a Pro-only feature. Free users see this but can\'t use it.',
    tags: ['Paid Feature'],
    confidence: 'high',
  },
  {
    id: 'hs-wizard-send-btn',
    page: 'wizard',
    elementName: 'Send Campaign Button',
    elementType: 'button',
    position: { top: '80%', left: '60%', width: '20%', height: '7%' },
    aiDescription: 'Final CTA in the wizard. Clicking this sends the campaign and completes the primary activation goal.',
    tags: ['Key Activation Point'],
    confidence: 'high',
  },
  // Automations
  {
    id: 'hs-auto-create-btn',
    page: 'automations',
    elementName: 'Create Automation Button',
    elementType: 'button',
    position: { top: '10%', left: '70%', width: '22%', height: '6%' },
    aiDescription: 'Primary CTA to start building an automation workflow. Automations are a key paid feature that drives conversion.',
    tags: ['Paid Feature', 'Key Activation Point'],
    confidence: 'high',
  },
  {
    id: 'hs-auto-trigger-node',
    page: 'automations',
    elementName: 'Trigger Selection Node',
    elementType: 'section',
    position: { top: '25%', left: '25%', width: '50%', height: '12%' },
    aiDescription: 'First step in the automation builder — user chooses what starts the workflow (e.g., "Contact added", "Email not opened").',
    tags: [],
    confidence: 'medium',
  },
  {
    id: 'hs-auto-add-step',
    page: 'automations',
    elementName: 'Add Step Button',
    elementType: 'button',
    position: { top: '42%', left: '40%', width: '20%', height: '6%' },
    aiDescription: 'Adds a new action to the automation sequence. The builder uses a linear stepper layout.',
    tags: [],
    confidence: 'medium',
  },
  // Settings
  {
    id: 'hs-settings-billing-tab',
    page: 'settings',
    elementName: 'Billing Tab',
    elementType: 'link',
    position: { top: '8%', left: '25%', width: '12%', height: '5%' },
    aiDescription: 'Navigation to the billing section showing current plan, invoices, and upgrade option.',
    tags: ['Navigation'],
    confidence: 'high',
  },
  {
    id: 'hs-settings-upgrade-btn',
    page: 'settings',
    elementName: 'Upgrade Button',
    elementType: 'button',
    position: { top: '35%', left: '60%', width: '18%', height: '6%' },
    aiDescription: 'Primary conversion CTA on the billing page. Initiates the upgrade flow.',
    tags: ['Key Activation Point'],
    confidence: 'high',
  },
  {
    id: 'hs-settings-invite-btn',
    page: 'settings',
    elementName: 'Invite Teammate Button',
    elementType: 'button',
    position: { top: '55%', left: '60%', width: '18%', height: '6%' },
    aiDescription: 'Opens the team invite modal. Expansion signal — users who invite teammates are more likely to upgrade to Enterprise.',
    tags: [],
    confidence: 'medium',
  },
];

export const pageLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  campaigns: 'Campaigns',
  wizard: 'Campaign Wizard',
  automations: 'Automations',
  settings: 'Settings',
};
