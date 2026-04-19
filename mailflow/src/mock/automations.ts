import type { Automation } from '../types';
import { daysAgo } from '../lib/dates';

export function generateAutomations(): Automation[] {
  return [
    {
      id: 'auto-1',
      name: 'Welcome Series',
      status: 'active',
      trigger: { type: 'contactAdded' },
      steps: [
        { type: 'sendEmail', templateId: 'tpl-8', subject: 'Welcome aboard!' },
        { type: 'delay', hours: 48 },
        { type: 'sendEmail', templateId: 'tpl-2', subject: 'Getting started with MailFlow' },
        { type: 'delay', hours: 72 },
        { type: 'branch', on: 'opened', yes: [
          { type: 'sendEmail', templateId: 'tpl-3', subject: 'You\'re on a roll! Check out these features' },
        ], no: [
          { type: 'sendEmail', templateId: 'tpl-1', subject: 'We miss you — here\'s what you\'re missing' },
        ]},
      ],
      contactsInWorkflow: 23,
      lastRunAt: daysAgo(1),
    },
    {
      id: 'auto-2',
      name: 'Re-engagement Flow',
      status: 'paused',
      trigger: { type: 'campaignNotOpened', campaignId: 'camp-1' },
      steps: [
        { type: 'delay', hours: 72 },
        { type: 'sendEmail', templateId: 'tpl-6', subject: 'We have something special for you' },
        { type: 'delay', hours: 48 },
        { type: 'sendEmail', templateId: 'tpl-5', subject: 'Last chance: exclusive offer inside' },
      ],
      contactsInWorkflow: 0,
      lastRunAt: daysAgo(14),
    },
    {
      id: 'auto-3',
      name: 'VIP Onboarding',
      status: 'draft',
      trigger: { type: 'tagApplied', tag: 'vip' },
      steps: [
        { type: 'sendEmail', templateId: 'tpl-4', subject: 'Welcome to the VIP club' },
        { type: 'delay', hours: 24 },
        { type: 'sendEmail', templateId: 'tpl-7', subject: 'Your VIP perks are waiting' },
      ],
      contactsInWorkflow: 0,
    },
  ];
}
