import { create } from 'zustand';
import type {
  Campaign,
  Contact,
  Segment,
  Template,
  Automation,
  User,
  Notification,
  Invoice,
  CampaignStats,
} from '../types';
import { currentUser, teammates as initialTeammates } from '../mock/user';
import { generateContacts, generateImportedContacts } from '../mock/contacts';
import { generateSegments } from '../mock/segments';
import { templates as initialTemplates } from '../mock/templates';
import { generateCampaigns } from '../mock/campaigns';
import { generateAutomations } from '../mock/automations';
import { generateNotifications } from '../mock/notifications';
import { generateInvoices } from '../mock/invoices';
import type { DemoScenario, ScenarioId } from '../demo/scenarios';

export type OrbitalTourId = 'workflow1' | 'workflow2';

export type OrbitalChatLine = {
  id: string;
  role: 'orbital';
  text: string;
  tourCta?: { ctaLabel: string; tourId: OrbitalTourId };
};

export interface AppState {
  // Auth
  currentUser: User;
  plan: 'free' | 'pro' | 'enterprise';

  // Campaigns
  campaigns: Campaign[];
  addCampaign: (c: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  sendCampaign: (id: string) => void;

  // Contacts
  contacts: Contact[];
  contactsUploaded: boolean;
  importContacts: () => void;
  addContact: (c: Contact) => void;

  // Segments
  segments: Segment[];
  addSegment: (s: Segment) => void;

  // Templates
  templates: Template[];

  // Automations
  automations: Automation[];
  addAutomation: (a: Automation) => void;
  updateAutomation: (id: string, updates: Partial<Automation>) => void;

  // Billing
  checkoutInitiated: boolean;
  checkoutAbandoned: boolean;
  setCheckoutInitiated: (v: boolean) => void;
  setCheckoutAbandoned: (v: boolean) => void;
  upgradePlan: (plan: 'pro' | 'enterprise') => void;

  // Team
  teammates: User[];
  teammateCountDelta: number;
  inviteTeammate: (email: string, role: User['role']) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;

  // Invoices
  invoices: Invoice[];

  // UI
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Demo scenarios
  activeScenario: ScenarioId | null;
  trialDaysLeft: number | undefined;
  loadScenario: (scenario: DemoScenario) => void;

  /** Proactive bubble — drained into Orbital Chat; optional tourCta renders inline with the message */
  orbitalPendingChat: OrbitalChatLine[];
  enqueueOrbitalProactive: (args: {
    messageId: string;
    message: string;
    ctaLabel: string;
    tourId: 'workflow1' | 'workflow2';
  }) => void;
  drainOrbitalPendingChat: () => OrbitalChatLine[];
  stripOrbitalPendingTourCta: () => void;
  clearOrbitalProactiveInbox: () => void;

  /** Scenario IDs whose proactive bubble has already been shown/accepted/dismissed — persists across tour starts so the nudge never re-appears. */
  proactiveBubbleHandled: ScenarioId[];
  markProactiveBubbleHandled: (scenarioId: ScenarioId) => void;
}

const seedContacts = generateContacts();

export const useStore = create<AppState>((set, get) => ({
  // Auth
  currentUser,
  plan: 'free',

  // Campaigns
  campaigns: generateCampaigns(),
  addCampaign: (c) => set((s) => ({ campaigns: [...s.campaigns, c] })),
  updateCampaign: (id, updates) =>
    set((s) => ({
      campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  sendCampaign: (id) => {
    const state = get();
    const campaign = state.campaigns.find((c) => c.id === id);
    if (!campaign) return;
    const recipientCount = campaign.audienceId === 'segment-all'
      ? state.contacts.length
      : state.segments.find((s) => s.id === campaign.audienceId)?.contactCount ?? state.contacts.length;
    const delivered = Math.floor(recipientCount * (0.97 + Math.random() * 0.02));
    const stats: CampaignStats = {
      recipients: recipientCount,
      delivered,
      opens: Math.floor(delivered * (0.2 + Math.random() * 0.25)),
      clicks: Math.floor(delivered * (0.02 + Math.random() * 0.06)),
      bounces: recipientCount - delivered,
      unsubscribes: Math.floor(Math.random() * 5),
    };
    set((s) => ({
      campaigns: s.campaigns.map((c) =>
        c.id === id ? { ...c, status: 'sent' as const, sentAt: new Date().toISOString(), stats } : c
      ),
    }));
    get().addToast(`Campaign sent to ${recipientCount} recipients`, 'success');
  },

  // Contacts
  contacts: seedContacts,
  contactsUploaded: false,
  importContacts: () =>
    set((s) => {
      const imported = generateImportedContacts(s.contacts.length + 1);
      const newContacts = [...s.contacts, ...imported];
      return {
        contacts: newContacts,
        contactsUploaded: true,
        segments: generateSegments(newContacts.length),
      };
    }),
  addContact: (c) =>
    set((s) => ({
      contacts: [...s.contacts, c],
      segments: generateSegments(s.contacts.length + 1),
    })),

  // Segments
  segments: generateSegments(seedContacts.length),
  addSegment: (s) => set((state) => ({ segments: [...state.segments, s] })),

  // Templates
  templates: initialTemplates,

  // Automations
  automations: generateAutomations(),
  addAutomation: (a) => set((s) => ({ automations: [...s.automations, a] })),
  updateAutomation: (id, updates) =>
    set((s) => ({
      automations: s.automations.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  // Billing
  checkoutInitiated: false,
  checkoutAbandoned: false,
  setCheckoutInitiated: (v) => set({ checkoutInitiated: v }),
  setCheckoutAbandoned: (v) => set({ checkoutAbandoned: v }),
  upgradePlan: (plan) =>
    set((s) => ({
      plan,
      currentUser: { ...s.currentUser, plan },
      checkoutInitiated: false,
      trialDaysLeft: undefined,
    })),

  // Team
  teammates: initialTeammates,
  teammateCountDelta: 0,
  inviteTeammate: (email, role) =>
    set((s) => {
      const newMate: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role,
        plan: s.plan,
      };
      return {
        teammates: [...s.teammates, newMate],
        teammateCountDelta: s.teammateCountDelta + 1,
      };
    }),

  // Notifications
  notifications: generateNotifications(),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  // Invoices
  invoices: generateInvoices(),

  // UI
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `toast-${Date.now()}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // Demo scenarios
  activeScenario: null,
  trialDaysLeft: undefined,
  loadScenario: (scenario) =>
    set({
      activeScenario: scenario.id,
      currentUser: scenario.user,
      plan: scenario.plan,
      trialDaysLeft: scenario.trialDaysLeft,
      campaigns: scenario.campaigns,
      contacts: scenario.contacts,
      contactsUploaded: scenario.contactsUploaded,
      segments: scenario.segments,
      automations: scenario.automations,
      notifications: scenario.notifications,
      checkoutInitiated: scenario.checkoutInitiated,
      checkoutAbandoned: scenario.checkoutAbandoned,
      teammateCountDelta: 0,
      toasts: [],
      orbitalPendingChat: [],
      proactiveBubbleHandled: [],
    }),

  orbitalPendingChat: [],
  enqueueOrbitalProactive: ({ messageId, message, ctaLabel, tourId }) =>
    set((s) => ({
      orbitalPendingChat: [
        ...s.orbitalPendingChat,
        {
          id: messageId,
          role: 'orbital' as const,
          text: message,
          tourCta: { ctaLabel, tourId },
        },
      ],
    })),
  drainOrbitalPendingChat: () => {
    const pending = get().orbitalPendingChat;
    set({ orbitalPendingChat: [] });
    return pending;
  },
  stripOrbitalPendingTourCta: () =>
    set((s) => ({
      orbitalPendingChat: s.orbitalPendingChat.map((m) => ({ id: m.id, role: m.role, text: m.text })),
    })),
  clearOrbitalProactiveInbox: () => set({ orbitalPendingChat: [] }),

  proactiveBubbleHandled: [],
  markProactiveBubbleHandled: (scenarioId) =>
    set((s) =>
      s.proactiveBubbleHandled.includes(scenarioId)
        ? s
        : { proactiveBubbleHandled: [...s.proactiveBubbleHandled, scenarioId] }
    ),
}));
