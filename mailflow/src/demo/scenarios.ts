import type { Campaign, Contact, Segment, Automation, User, Notification } from '../types';
import { generateContacts } from '../mock/contacts';
import { generateSegments } from '../mock/segments';
import { generateNotifications } from '../mock/notifications';
import { daysAgo } from '../lib/dates';

export type ScenarioId = 'maya' | 'devon' | 'riley';

export interface DemoScenario {
  id: ScenarioId;
  label: string;
  persona: string;
  description: string;
  startRoute: string;
  user: User;
  plan: 'free' | 'pro' | 'enterprise';
  trialDaysLeft?: number;
  campaigns: Campaign[];
  contacts: Contact[];
  contactsUploaded: boolean;
  segments: Segment[];
  automations: Automation[];
  notifications: Notification[];
  checkoutInitiated: boolean;
  checkoutAbandoned: boolean;
}

const allContacts = generateContacts();

export const scenarios: Record<ScenarioId, DemoScenario> = {
  maya: {
    id: 'maya',
    label: 'Scenario 1: Maya — New User',
    persona: 'Marketing Manager · Free Trial',
    description:
      'First login with no campaigns yet. Orbital detects the new user and guides her to the Aha moment — sending a first campaign.',
    startRoute: '/',
    user: {
      id: 'user-1',
      name: 'Maya Chen',
      email: 'maya@mailflow.demo',
      role: 'owner',
      plan: 'free',
    },
    plan: 'free',
    campaigns: [],
    contacts: [],
    contactsUploaded: false,
    segments: generateSegments(0),
    automations: [],
    notifications: generateNotifications(),
    checkoutInitiated: false,
    checkoutAbandoned: false,
  },

  devon: {
    id: 'devon',
    label: 'Scenario 2: Devon — Trial Conversion',
    persona: 'Growth Lead · Pro Trial (4 days left)',
    description:
      '10 days into a 14-day trial with 3 campaigns sent. Has not explored automations. Orbital surfaces the high-value feature and nudges upgrade.',
    startRoute: '/',
    user: {
      id: 'user-6',
      name: 'Devon Park',
      email: 'devon@mailflow.demo',
      role: 'owner',
      plan: 'pro',
    },
    plan: 'pro',
    trialDaysLeft: 4,
    campaigns: [
      {
        id: 'camp-d1',
        name: 'Welcome Email',
        status: 'sent',
        audienceId: 'segment-all',
        templateId: 'tpl-8',
        fromName: 'Devon from GrowthCo',
        fromEmail: 'devon@mailflow.demo',
        subject: "Welcome to GrowthCo — here's what to expect",
        sentAt: daysAgo(9),
        stats: {
          recipients: 842,
          delivered: 830,
          opens: 299,
          clicks: 52,
          bounces: 12,
          unsubscribes: 1,
        },
      },
      {
        id: 'camp-d2',
        name: 'March Product Update',
        status: 'sent',
        audienceId: 'segment-all',
        templateId: 'tpl-3',
        fromName: 'Devon from GrowthCo',
        fromEmail: 'devon@mailflow.demo',
        subject: 'What we shipped this month 🚀',
        sentAt: daysAgo(5),
        stats: {
          recipients: 842,
          delivered: 835,
          opens: 342,
          clicks: 71,
          bounces: 7,
          unsubscribes: 0,
        },
      },
      {
        id: 'camp-d3',
        name: 'Engagement Check-in',
        status: 'sent',
        audienceId: 'segment-engaged',
        templateId: 'tpl-1',
        fromName: 'Devon from GrowthCo',
        fromEmail: 'devon@mailflow.demo',
        subject: 'Quick question for our most engaged readers',
        sentAt: daysAgo(2),
        stats: {
          recipients: 380,
          delivered: 377,
          opens: 189,
          clicks: 43,
          bounces: 3,
          unsubscribes: 2,
        },
      },
    ],
    contacts: allContacts,
    contactsUploaded: true,
    segments: generateSegments(allContacts.length),
    automations: [],
    notifications: generateNotifications(),
    checkoutInitiated: false,
    checkoutAbandoned: false,
  },

  riley: {
    id: 'riley',
    label: 'Scenario 3: Riley — Question-Led Guidance',
    persona: 'Ops Manager · Pro Plan',
    description:
      'Experienced user asks a specific workflow question. Orbital converts that question into a contextual, generated tour using UI annotations.',
    startRoute: '/audiences?tab=segments',
    user: {
      id: 'user-9',
      name: 'Riley Morgan',
      email: 'riley@mailflow.demo',
      role: 'owner',
      plan: 'pro',
    },
    plan: 'pro',
    campaigns: [
      {
        id: 'camp-r1',
        name: 'June Product Roundup',
        status: 'sent',
        audienceId: 'segment-all',
        templateId: 'tpl-3',
        fromName: 'Riley from Northstar',
        fromEmail: 'riley@mailflow.demo',
        subject: 'What shipped in June',
        sentAt: daysAgo(6),
        stats: {
          recipients: 1240,
          delivered: 1228,
          opens: 401,
          clicks: 79,
          bounces: 12,
          unsubscribes: 3,
        },
      },
      {
        id: 'camp-r2',
        name: 'Feature Highlight',
        status: 'sent',
        audienceId: 'segment-engaged',
        templateId: 'tpl-1',
        fromName: 'Riley from Northstar',
        fromEmail: 'riley@mailflow.demo',
        subject: 'A quick look at our newest feature',
        sentAt: daysAgo(2),
        stats: {
          recipients: 520,
          delivered: 516,
          opens: 246,
          clicks: 61,
          bounces: 4,
          unsubscribes: 1,
        },
      },
    ],
    contacts: allContacts,
    contactsUploaded: true,
    segments: generateSegments(allContacts.length),
    automations: [],
    notifications: generateNotifications(),
    checkoutInitiated: false,
    checkoutAbandoned: false,
  },
};
