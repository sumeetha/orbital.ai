export type ID = string;

export type User = {
  id: ID;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  plan: 'free' | 'pro' | 'enterprise';
  avatarUrl?: string;
};

export type Contact = {
  id: ID;
  email: string;
  firstName?: string;
  lastName?: string;
  tags: string[];
  subscribed: boolean;
  createdAt: string;
};

export type SegmentRule =
  | { type: 'tag'; op: 'is' | 'isNot'; value: string }
  | { type: 'signupDate'; op: 'after' | 'before'; value: string }
  | { type: 'engagement'; op: 'opened' | 'clicked' | 'notOpened'; campaignId?: ID };

export type Segment = {
  id: ID;
  name: string;
  rules: SegmentRule[];
  contactCount: number;
};

export type Template = {
  id: ID;
  name: string;
  category: 'newsletter' | 'announcement' | 'promo' | 'transactional' | 'blank';
  thumbnailUrl: string;
  previewHtml?: string;
};

export type CampaignVariant = {
  id: ID;
  subject: string;
  stats?: CampaignStats;
};

export type CampaignStats = {
  recipients: number;
  delivered: number;
  opens: number;
  clicks: number;
  bounces: number;
  unsubscribes: number;
};

export type Campaign = {
  id: ID;
  name: string;
  status: 'draft' | 'scheduled' | 'sent';
  audienceId: ID;
  templateId: ID;
  fromName: string;
  fromEmail: string;
  subject: string;
  preheader?: string;
  scheduledFor?: string;
  sentAt?: string;
  variants?: CampaignVariant[];
  stats?: CampaignStats;
};

export type AutomationTrigger =
  | { type: 'contactAdded' }
  | { type: 'tagApplied'; tag: string }
  | { type: 'campaignNotOpened'; campaignId: ID };

export type AutomationStep =
  | { type: 'delay'; hours: number }
  | { type: 'sendEmail'; templateId: ID; subject: string }
  | { type: 'branch'; on: 'opened' | 'clicked'; yes: AutomationStep[]; no: AutomationStep[] };

export type Automation = {
  id: ID;
  name: string;
  status: 'active' | 'paused' | 'draft';
  trigger: AutomationTrigger;
  steps: AutomationStep[];
  contactsInWorkflow: number;
  lastRunAt?: string;
};

export type Notification = {
  id: ID;
  message: string;
  read: boolean;
  createdAt: string;
};

export type Invoice = {
  id: ID;
  date: string;
  amount: number;
  status: 'paid' | 'pending';
  description: string;
};
