import { create } from 'zustand';
import { type KnowledgeSource, type ExtractedKnowledge, sampleSources, sampleExtracted } from '../mock/knowledge-sources';
import { type Hotspot, hotspots } from '../mock/hotspots';
import { type Suggestion, type RateLimits, mockSuggestions, defaultRateLimits } from '../mock/suggestions';
import { type Engagement, type EngagementStatus, mockEngagements } from '../mock/engagements';
import { type BrandSettings, defaultBrandSettings, autoDetectedBrand } from '../mock/branding';
import { type TeamMember, type TeamRole, mockTeamMembers, type BillingInfo, mockBillingInfo } from '../mock/settings';

type CapturedElement = {
  hotspot: Hotspot;
  capturedAt: number;
  description: string;
  tags: string[];
};

type SetupAnswers = {
  productName: string;
  productCategory: string;
  primaryUsers: string;
  valueProposition: string;
  activationEvents: string[];
  primaryAhaMoment: string;
  riskMetrics: string[];
  frictionPoints: string[];
};

type AppState = {
  // Journey completion
  journeyComplete: { knowledge: boolean; annotation: boolean; setup: boolean; suggestions: boolean };

  // Knowledge
  sources: KnowledgeSource[];
  extracted: ExtractedKnowledge | null;
  isProcessing: boolean;
  addSource: (source: KnowledgeSource) => void;
  removeSource: (id: string) => void;
  loadSampleDocs: () => void;
  updateExtractedField: (field: keyof ExtractedKnowledge, value: unknown) => void;
  completeKnowledge: () => void;

  // Annotation
  activePage: string;
  capturedElements: CapturedElement[];
  setActivePage: (page: string) => void;
  captureElement: (hotspotId: string) => void;
  updateElementDescription: (hotspotId: string, description: string) => void;
  updateElementTags: (hotspotId: string, tags: string[]) => void;
  removeElement: (hotspotId: string) => void;
  completeAnnotation: () => void;

  // Setup
  setupAnswers: SetupAnswers;
  currentTopic: number;
  completedTopics: string[];
  confirmTopic: (topic: string) => void;
  updateSetupAnswer: (field: string, value: unknown) => void;
  completeSetup: () => void;

  // Suggestions
  suggestions: Suggestion[];
  rateLimits: RateLimits;
  isGenerating: boolean;
  generateSuggestions: () => void;
  acceptSuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  updateSuggestion: (id: string, data: Partial<Suggestion>) => void;
  updateRateLimits: (limits: Partial<RateLimits>) => void;
  completeSuggestions: () => void;

  // Engagements
  engagements: Engagement[];
  createEngagement: (engagement: Omit<Engagement, 'id'>) => void;
  pauseEngagement: (id: string) => void;
  resumeEngagement: (id: string) => void;
  archiveEngagement: (id: string) => void;

  // Branding
  brandSettings: BrandSettings;
  styleGuideUrl: string;
  isExtracting: boolean;
  updateBrandSetting: <K extends keyof BrandSettings>(field: K, value: BrandSettings[K]) => void;
  fetchBrandFromUrl: (url: string) => void;

  // Settings — Team
  teamMembers: TeamMember[];
  inviteMember: (email: string, role: TeamRole) => void;
  updateMemberRole: (id: string, role: TeamRole) => void;
  removeMember: (id: string) => void;

  // Settings — Billing
  billingInfo: BillingInfo;

  // UI
  previewSuggestionId: string | null;
  openPreview: (id: string) => void;
  closePreview: () => void;
};

export const useStore = create<AppState>((set, get) => ({
  journeyComplete: { knowledge: false, annotation: false, setup: false, suggestions: false },

  // Knowledge
  sources: [],
  extracted: null,
  isProcessing: false,
  addSource: (source) => set((s) => ({ sources: [...s.sources, source] })),
  removeSource: (id) => set((s) => ({ sources: s.sources.filter((src) => src.id !== id) })),
  loadSampleDocs: () => {
    set({ isProcessing: true });
    setTimeout(() => {
      set({ sources: sampleSources, extracted: sampleExtracted, isProcessing: false });
    }, 2000);
  },
  updateExtractedField: (field, value) =>
    set((s) => ({
      extracted: s.extracted ? { ...s.extracted, [field]: value } : null,
    })),
  completeKnowledge: () =>
    set((s) => ({ journeyComplete: { ...s.journeyComplete, knowledge: true } })),

  // Annotation
  activePage: 'dashboard',
  capturedElements: [],
  setActivePage: (page) => set({ activePage: page }),
  captureElement: (hotspotId) => {
    const existing = get().capturedElements.find((e) => e.hotspot.id === hotspotId);
    if (existing) return;
    const hotspot = hotspots.find((h) => h.id === hotspotId);
    if (!hotspot) return;
    set((s) => ({
      capturedElements: [
        ...s.capturedElements,
        { hotspot, capturedAt: Date.now(), description: hotspot.aiDescription, tags: [...hotspot.tags] },
      ],
    }));
  },
  updateElementDescription: (hotspotId, description) =>
    set((s) => ({
      capturedElements: s.capturedElements.map((e) =>
        e.hotspot.id === hotspotId ? { ...e, description } : e
      ),
    })),
  updateElementTags: (hotspotId, tags) =>
    set((s) => ({
      capturedElements: s.capturedElements.map((e) =>
        e.hotspot.id === hotspotId ? { ...e, tags } : e
      ),
    })),
  removeElement: (hotspotId) =>
    set((s) => ({
      capturedElements: s.capturedElements.filter((e) => e.hotspot.id !== hotspotId),
    })),
  completeAnnotation: () =>
    set((s) => ({ journeyComplete: { ...s.journeyComplete, annotation: true } })),

  // Setup
  setupAnswers: {
    productName: 'MailFlow',
    productCategory: 'B2B email marketing SaaS',
    primaryUsers: 'Marketing managers at SMBs, Growth leads at startups',
    valueProposition: 'Fast path from contact list to measurable email campaign',
    activationEvents: ['First campaign sent', 'Contacts imported', 'Template selected', 'Automation created'],
    primaryAhaMoment: 'First campaign sent',
    riskMetrics: [],
    frictionPoints: [],
  },
  currentTopic: 0,
  completedTopics: [],
  confirmTopic: (topic) =>
    set((s) => ({
      completedTopics: s.completedTopics.includes(topic) ? s.completedTopics : [...s.completedTopics, topic],
      currentTopic: Math.min(s.currentTopic + 1, 4),
    })),
  updateSetupAnswer: (field, value) =>
    set((s) => ({ setupAnswers: { ...s.setupAnswers, [field]: value } })),
  completeSetup: () =>
    set((s) => ({ journeyComplete: { ...s.journeyComplete, setup: true } })),

  // Suggestions
  suggestions: [],
  rateLimits: defaultRateLimits,
  isGenerating: false,
  generateSuggestions: () => {
    set({ isGenerating: true });
    setTimeout(() => {
      set({ suggestions: mockSuggestions, isGenerating: false });
    }, 3000);
  },
  acceptSuggestion: (id) =>
    set((s) => ({
      suggestions: s.suggestions.map((sug) =>
        sug.id === id ? { ...sug, status: 'accepted' as const } : sug
      ),
    })),
  dismissSuggestion: (id) =>
    set((s) => ({
      suggestions: s.suggestions.map((sug) =>
        sug.id === id ? { ...sug, status: 'dismissed' as const } : sug
      ),
    })),
  updateSuggestion: (id, data) =>
    set((s) => ({
      suggestions: s.suggestions.map((sug) =>
        sug.id === id ? { ...sug, ...data } : sug
      ),
    })),
  updateRateLimits: (limits) =>
    set((s) => ({ rateLimits: { ...s.rateLimits, ...limits } })),
  completeSuggestions: () =>
    set((s) => ({ journeyComplete: { ...s.journeyComplete, suggestions: true } })),

  // Engagements
  engagements: mockEngagements,
  createEngagement: (engagement) =>
    set((s) => ({
      engagements: [
        {
          ...engagement,
          id: `eng-${Date.now()}`,
        },
        ...s.engagements,
      ],
    })),
  pauseEngagement: (id) =>
    set((s) => ({
      engagements: s.engagements.map((e) =>
        e.id === id ? { ...e, status: 'paused' as EngagementStatus } : e
      ),
    })),
  resumeEngagement: (id) =>
    set((s) => ({
      engagements: s.engagements.map((e) =>
        e.id === id ? { ...e, status: 'active' as EngagementStatus } : e
      ),
    })),
  archiveEngagement: (id) =>
    set((s) => ({
      engagements: s.engagements.filter((e) => e.id !== id),
    })),

  // Branding
  brandSettings: defaultBrandSettings,
  styleGuideUrl: '',
  isExtracting: false,
  updateBrandSetting: (field, value) =>
    set((s) => ({ brandSettings: { ...s.brandSettings, [field]: value } })),
  fetchBrandFromUrl: (url) => {
    set({ styleGuideUrl: url, isExtracting: true });
    setTimeout(() => {
      set((s) => ({
        brandSettings: { ...s.brandSettings, ...autoDetectedBrand },
        isExtracting: false,
      }));
    }, 1500);
  },

  // Settings — Team
  teamMembers: mockTeamMembers,
  inviteMember: (email, role) =>
    set((s) => ({
      teamMembers: [
        ...s.teamMembers,
        {
          id: `tm-${Date.now()}`,
          name: email.split('@')[0],
          email,
          role,
          status: 'invited' as const,
          lastActive: 'Never',
          avatarInitials: email.slice(0, 2).toUpperCase(),
        },
      ],
    })),
  updateMemberRole: (id, role) =>
    set((s) => ({
      teamMembers: s.teamMembers.map((m) => (m.id === id ? { ...m, role } : m)),
    })),
  removeMember: (id) =>
    set((s) => ({
      teamMembers: s.teamMembers.filter((m) => m.id !== id),
    })),

  // Settings — Billing
  billingInfo: mockBillingInfo,

  // UI
  previewSuggestionId: null,
  openPreview: (id) => set({ previewSuggestionId: id }),
  closePreview: () => set({ previewSuggestionId: null }),
}));
