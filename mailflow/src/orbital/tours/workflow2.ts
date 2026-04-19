import type { TourStep } from '../TourEngine';

export const workflow2Steps: TourStep[] = [
  {
    id: 'w2-nav-automations',
    targetId: 'sidebar-automations',
    message:
      'This is where you build automated workflows — they run in the background without you lifting a finger.',
    ctaLabel: 'Open Automations',
    waitForEvent: 'route:/automations',
  },
  {
    id: 'w2-create',
    targetId: 'automations-create-btn',
    route: '/automations',
    spotlightBounds: 'nearest-dialog',
    message:
      "Click **Create automation** to start building your first workflow. A common one: follow up with contacts who didn't open your last email.",
    ctaLabel: "Let's create one",
    // Wait for navigation to any /automations/:id page (prefix match)
    waitForEvent: 'route:prefix:/automations/',
  },
  {
    id: 'w2-trigger',
    targetId: 'automations-trigger-node',
    // No 'route' here — user is already in the builder after creating the automation
    message:
      'Choose what **triggers** the automation. For a re-engagement flow, select "Campaign not opened" as the trigger.',
  },
  {
    id: 'w2-add-step',
    targetId: 'automations-add-step-btn',
    message:
      'Now **add a step** — select "Send email" to create your follow-up message. You can also add a delay so it doesn\'t arrive immediately.',
  },
  {
    id: 'w2-done',
    isModal: true,
    excludeFromProgress: true,
    message:
      "Automation set up — this workflow will now run for every contact who matches the trigger. Completely hands-free. 🤖\n\nWith your trial ending in 4 days, this automation will pause unless you upgrade.",
    ctaLabel: 'See upgrade options',
    subMessage: 'Upgrading preserves all automations and keeps them running without interruption.',
  },
  {
    id: 'w2-upgrade',
    targetId: 'settings-upgrade-btn',
    route: '/settings?tab=billing',
    spotlightBounds: 'nearest-dialog',
    message:
      "You've set up automations that are already working for you. Upgrading ensures they keep running after your trial ends — no interruption.",
    ctaLabel: 'Upgrade now',
    subMessage: 'Many users upgrade after setting up their first automation.',
  },
];
