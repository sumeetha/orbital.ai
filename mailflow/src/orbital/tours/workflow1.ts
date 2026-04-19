import type { TourStep } from '../TourEngine';

export const workflow1Steps: TourStep[] = [
  {
    id: 'w1-welcome',
    targetId: 'dashboard-quickstart-create',
    message:
      "Looks like you're setting up your first campaign. I'll walk you through it — it only takes a few minutes.",
    ctaLabel: "Let's go",
  },
  {
    id: 'w1-campaigns-list',
    targetId: 'campaigns-list-create-btn',
    route: '/campaigns',
    message: "Here's where all your campaigns live. Click **Create campaign** to begin.",
    ctaLabel: 'Got it',
    waitForEvent: 'route:prefix:/campaigns/new',
  },
  {
    id: 'w1-template',
    targetId: 'wizard-step-template',
    route: '/campaigns/new?step=1',
    message:
      'Start by choosing a template. For newsletters, the **Newsletter** category tends to perform best.',
  },
  {
    id: 'w1-audience',
    targetId: 'wizard-step-audience',
    route: '/campaigns/new?step=2',
    message:
      "Not sure who to send this to? Most first campaigns go to your full contact list — that's totally fine.",
  },
  {
    id: 'w1-subject',
    targetId: 'wizard-subject-input',
    route: '/campaigns/new?step=3',
    message:
      'Your subject line drives opens. Try something clear and benefit-driven — avoid vague phrases like "Monthly update".',
  },
  {
    id: 'w1-send',
    targetId: 'wizard-send-btn',
    route: '/campaigns/new?step=4',
    message:
      "You're ready to send your first campaign. Review everything here, then click **Send Campaign** when you're ready.",
    ctaLabel: 'Send it!',
    waitForEvent: 'campaign:sent',
  },
  {
    id: 'w1-done',
    isModal: true,
    excludeFromProgress: true,
    message:
      "Nice work — your first campaign is live! 🎉\n\nYour contacts will start receiving it shortly.",
    ctaLabel: 'Continue',
    subMessage: 'When you are ready, open Analytics in the sidebar to track opens and clicks.',
  },
  {
    id: 'w1-survey-ease',
    isModal: true,
    modalKind: 'surveyEase',
    message: 'How easy was it to create your first campaign?',
  },
  {
    id: 'w1-survey-issue',
    isModal: true,
    modalKind: 'surveyIssue',
    message: 'Thanks for letting us know.',
  },
];
