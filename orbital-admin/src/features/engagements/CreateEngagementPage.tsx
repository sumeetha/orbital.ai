import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp,
  MousePointerClick, Pencil, Trash2, X, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../../components/PageHeader';
import { Badge, Button, Card, Input, Modal, Textarea } from '../../components/ui';
import { useStore } from '../../store';
import { hotspots, pageLabels } from '../../mock/hotspots';
import type { EngagementSubType, EngagementType } from '../../mock/engagements';

/* ─── Config ─── */

const subTypeOptionsByType: Record<EngagementType, EngagementSubType[]> = {
  tour: [],
  nudge: ['spotlight', 'checklist', 'banner', 'popup', 'modal'],
  feedback: ['micro-survey', 'nps', 'like-dislike', 'star-rating', 'large-survey'],
};

const subTypeLabels: Record<EngagementSubType, string> = {
  spotlight: 'Spotlight',
  checklist: 'Checklist',
  banner: 'Banner',
  popup: 'Popup',
  modal: 'Modal',
  'micro-survey': 'Micro Survey',
  nps: 'NPS',
  'like-dislike': 'Like / Dislike',
  'star-rating': 'Star Rating',
  'large-survey': 'Large Survey',
};

const orderedPages = ['dashboard', 'campaigns', 'wizard', 'automations', 'settings'] as const;

const segmentOptions = [
  'All users',
  'Free plan users, first 7 days',
  'Trial users in first 14 days',
  'Pro trial users, day 7+',
  'Trial users nearing expiry',
  'New users, first 3 days',
  'All new users, post-tour',
  'All active users',
  'Active users, 14+ days',
  'All users with few contacts',
  'Users who sent 3+ campaigns',
  'Users who used templates',
  'Free plan users near limits',
  'Any user in campaign wizard, step 2',
];

type TriggerStepContent = {
  hotspotId: string;
  title: string;
  message: string;
  buttonLabel: string;
};

/* ─── Hotspot wrapper (mirrors annotation Hs) ─── */

function TriggerHs({
  id, children, selected, onClick, justSelected, className = '',
}: {
  id: string; children: React.ReactNode; selected: boolean;
  onClick: (id: string) => void; justSelected: boolean; className?: string;
}) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(id); }}
      className={`relative cursor-crosshair transition-all duration-200 rounded-lg ${
        selected
          ? 'ring-2 ring-orbital-primary/70 bg-orbital-primary/5'
          : 'hover:ring-2 hover:ring-violet-400/50 hover:bg-violet-50/20'
      } ${className}`}
    >
      {children}
      <AnimatePresence>
        {justSelected && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 bg-orbital-primary text-white text-[11px] px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-lg"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            Trigger added!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Browser mock (reuses same UI as annotation) ─── */

function TriggerBrowserMock({
  page, selectedSet, justSelectedId, onClick,
}: {
  page: string; selectedSet: Set<string>; justSelectedId: string | null;
  onClick: (id: string) => void;
}) {
  const hs = (id: string, children: React.ReactNode, className = '') => (
    <TriggerHs id={id} selected={selectedSet.has(id)} onClick={onClick}
      justSelected={justSelectedId === id} className={className}>
      {children}
    </TriggerHs>
  );

  const layouts: Record<string, React.ReactNode> = {
    dashboard: (
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {hs('hs-dash-kpi-sent',
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="text-[11px] text-slate-500">Emails Sent</div>
              <div className="text-xl font-bold text-slate-800 mt-1">12,847</div>
            </div>
          )}
          {hs('hs-dash-kpi-openrate',
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="text-[11px] text-slate-500">Open Rate</div>
              <div className="text-xl font-bold text-slate-800 mt-1">34.2%</div>
            </div>
          )}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-[11px] text-slate-500">Click Rate</div>
            <div className="text-xl font-bold text-slate-800 mt-1">5.8%</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-[11px] text-slate-500">Subscribers</div>
            <div className="text-xl font-bold text-slate-800 mt-1">2,340</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {hs('hs-dash-quickstart-create',
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 text-center">
              <div className="w-8 h-8 rounded-lg bg-blue-100 mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-700">Create a campaign</div>
            </div>
          )}
          {hs('hs-dash-quickstart-import',
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 text-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-700">Import contacts</div>
            </div>
          )}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 text-center">
            <div className="w-8 h-8 rounded-lg bg-violet-100 mx-auto mb-2" />
            <div className="text-sm font-medium text-slate-700">Browse templates</div>
          </div>
        </div>
        {hs('hs-dash-recent-table',
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-sm font-medium text-slate-700 mb-3">Recent Campaigns</div>
            {['Newsletter #14', 'Product Update', 'Welcome Series'].map((c) => (
              <div key={c} className="flex items-center justify-between py-2 border-t border-slate-100">
                <span className="text-sm text-slate-600">{c}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Sent</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-1 mt-2">
          {hs('hs-dash-sidebar-campaigns',
            <div className="px-3 py-1.5 rounded bg-slate-200 text-xs text-slate-600">Campaigns</div>
          )}
          {hs('hs-dash-sidebar-automations',
            <div className="px-3 py-1.5 rounded bg-slate-200 text-xs text-slate-600">Automations</div>
          , 'inline-block')}
        </div>
      </div>
    ),
    wizard: (
      <div className="p-5 space-y-4">
        <div className="flex gap-2 mb-4">{['Template', 'Audience', 'Content', 'Review'].map((s, i) => (
          <div key={s} className={`flex-1 text-center py-2 rounded-lg text-xs font-medium ${i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{s}</div>
        ))}</div>
        {hs('hs-wizard-template-gallery',
          <div className="grid grid-cols-3 gap-3">
            {['Newsletter', 'Announcement', 'Promo', 'Welcome', 'Re-engage', 'Blank'].map((t) => (
              <div key={t} className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 text-center">
                <div className="w-full h-14 rounded bg-slate-100 mb-2" />
                <div className="text-xs text-slate-600">{t}</div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 space-y-3">
          {hs('hs-wizard-audience-dropdown',
            <div>
              <div className="text-xs text-slate-500 mb-1">Audience</div>
              <div className="h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center px-3 text-sm text-slate-400">Select audience...</div>
            </div>
          )}
          {hs('hs-wizard-subject-input',
            <div>
              <div className="text-xs text-slate-500 mb-1">Subject Line</div>
              <div className="h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center px-3 text-sm text-slate-400">Enter subject...</div>
            </div>
          )}
          {hs('hs-wizard-add-variant',
            <div className="inline-block text-xs text-blue-600 font-medium px-2 py-1">+ Add A/B variant</div>
          )}
        </div>
        <div className="flex justify-end">
          {hs('hs-wizard-send-btn',
            <div className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium">Send Campaign</div>
          )}
        </div>
      </div>
    ),
    automations: (
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold text-slate-800">Automations</div>
          {hs('hs-auto-create-btn',
            <div className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">+ Create Automation</div>
          )}
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 flex flex-col items-center gap-3">
          <div className="w-full max-w-xs space-y-3">
            {hs('hs-auto-trigger-node',
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center text-sm">Trigger: Contact Added</div>
            )}
            <div className="text-center text-slate-400">↓</div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center text-sm">Wait 2 hours</div>
            <div className="text-center text-slate-400">↓</div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-sm">Send Email</div>
            {hs('hs-auto-add-step',
              <div className="text-center">
                <div className="inline-block px-3 py-1.5 rounded border border-dashed border-slate-300 text-xs text-slate-500">+ Add Step</div>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    campaigns: (
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold text-slate-800">Campaigns</div>
          {hs('hs-campaigns-create-btn',
            <div className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">+ Create Campaign</div>
          )}
        </div>
        {hs('hs-campaigns-filter-bar',
          <div className="flex gap-2">{['All', 'Draft', 'Scheduled', 'Sent'].map((f, i) => (
            <div key={f} className={`px-3 py-1 rounded-full text-xs ${i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{f}</div>
          ))}</div>
        )}
        {hs('hs-campaigns-list-table',
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            {['Newsletter #14', 'Product Update Q1', 'Welcome Email', 'Promo — Spring Sale'].map((c, i) => (
              <div key={c} className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                <span className="text-sm text-slate-700">{c}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">{['34.2%', '28.1%', '41.0%', '22.5%'][i]} open</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${i === 1 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{i === 1 ? 'Scheduled' : 'Sent'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    settings: (
      <div className="p-5 space-y-4">
        <div className="text-lg font-semibold text-slate-800">Settings</div>
        <div className="flex gap-2 border-b border-slate-200 pb-2">{['Profile', 'Workspace', 'Billing', 'Team', 'Integrations'].map((t, i) => (
          <div key={t} className={`px-3 py-1.5 text-sm ${i === 2 ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-slate-500'}`}>{t}</div>
        ))}</div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-700 mb-4">Current Plan</div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
              <div className="font-semibold text-blue-700">Pro Trial</div>
              <div className="text-xs text-blue-600 mt-1">4 days remaining</div>
            </div>
            {hs('hs-settings-upgrade-btn',
              <div className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium">Upgrade</div>
            )}
          </div>
          {hs('hs-settings-billing-tab',
            <div className="text-xs text-slate-500 mt-2 px-2 py-1">Billing tab</div>
          )}
          <div className="mt-6">
            <div className="text-sm font-medium text-slate-700 mb-3">Team</div>
            {hs('hs-settings-invite-btn',
              <div className="px-4 py-2.5 rounded-lg border border-dashed border-slate-300 text-sm text-blue-600 text-center">+ Invite Teammate</div>
            )}
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50/50 overflow-auto">
      {layouts[page] || layouts.dashboard}
    </div>
  );
}

/* ─── Step content modal ─── */

function StepContentModal({
  open, hotspotId, engagementType, initial, onSave, onCancel,
}: {
  open: boolean;
  hotspotId: string;
  engagementType: EngagementType;
  initial?: TriggerStepContent;
  onSave: (content: TriggerStepContent) => void;
  onCancel: () => void;
}) {
  const hotspot = hotspots.find((h) => h.id === hotspotId);
  const elementName = hotspot?.elementName ?? hotspotId;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [message, setMessage] = useState(initial?.message ?? '');
  const [buttonLabel, setButtonLabel] = useState(initial?.buttonLabel ?? '');
  const [error, setError] = useState('');

  const typeLabel = engagementType === 'tour' ? 'tour step' : engagementType === 'nudge' ? 'nudge' : 'feedback prompt';

  const handleSave = () => {
    if (!title.trim() && !message.trim()) {
      setError('Please fill in at least a title or message.');
      return;
    }
    onSave({ hotspotId, title: title.trim(), message: message.trim(), buttonLabel: buttonLabel.trim() || 'Got it' });
  };

  return (
    <Modal open={open} onClose={onCancel} title={`Configure ${typeLabel}`}>
      <div className="p-6 space-y-4">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[11px] text-orbital-text-muted uppercase tracking-wide">Target element</div>
          <div className="text-sm font-medium text-orbital-text-dark mt-0.5">{elementName}</div>
          {hotspot && (
            <div className="text-xs text-orbital-text-muted mt-1">{pageLabels[hotspot.page]} · {hotspot.elementType}</div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-orbital-text-muted">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={engagementType === 'feedback' ? 'Ex: How was this experience?' : 'Ex: Start here!'}
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-orbital-text-muted">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder={
              engagementType === 'tour'
                ? 'Ex: Click "Create Campaign" to build your first email in under 2 minutes.'
                : engagementType === 'nudge'
                  ? 'Ex: Did you know you can import contacts from a CSV file?'
                  : 'Ex: Rate your experience with this feature.'
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-orbital-text-muted">Button label</label>
          <Input
            value={buttonLabel}
            onChange={(e) => setButtonLabel(e.target.value)}
            placeholder={engagementType === 'tour' ? 'Next' : engagementType === 'feedback' ? 'Submit' : 'Got it'}
          />
        </div>

        {/* Live preview */}
        <div className="space-y-1">
          <div className="text-[11px] text-orbital-text-muted uppercase tracking-wide font-medium">Preview</div>
          <div className="rounded-lg border border-orbital-primary/30 bg-orbital-primary/5 p-4">
            {title && <div className="text-sm font-semibold text-orbital-text-dark">{title}</div>}
            {message && <div className="text-xs text-orbital-text-muted mt-1">{message}</div>}
            <div className="mt-3">
              <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orbital-primary text-white">
                {buttonLabel || (engagementType === 'tour' ? 'Next' : engagementType === 'feedback' ? 'Submit' : 'Got it')}
              </span>
            </div>
          </div>
        </div>

        {error && <div className="text-xs text-red-600">{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onCancel}><X size={14} /> Cancel</Button>
          <Button size="sm" onClick={handleSave}><Check size={14} /> Save Step</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Main page ─── */

export function CreateEngagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryType = searchParams.get('type') as EngagementType | null;
  const defaultType: EngagementType =
    queryType === 'tour' || queryType === 'nudge' || queryType === 'feedback' ? queryType : 'tour';
  const { createEngagement } = useStore();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 fields
  const [name, setName] = useState('');
  const [type, setType] = useState<EngagementType>(defaultType);
  const [subType, setSubType] = useState<EngagementSubType | ''>('');
  const [segment, setSegment] = useState('All users');
  const [status, setStatus] = useState<'draft' | 'active' | 'paused'>('draft');
  const [detailError, setDetailError] = useState('');

  // Step 2 fields
  const [activeScreen, setActiveScreen] = useState<(typeof orderedPages)[number]>('dashboard');
  const [triggerSteps, setTriggerSteps] = useState<TriggerStepContent[]>([]);
  const [justSelected, setJustSelected] = useState<string | null>(null);
  const [triggerError, setTriggerError] = useState('');

  // Content modal
  const [modalHotspotId, setModalHotspotId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const selectedIds = useMemo(() => new Set(triggerSteps.map((s) => s.hotspotId)), [triggerSteps]);

  const handleHotspotClick = (hotspotId: string) => {
    if (selectedIds.has(hotspotId)) {
      setTriggerSteps((prev) => prev.filter((s) => s.hotspotId !== hotspotId));
      return;
    }
    setModalHotspotId(hotspotId);
    setEditingIndex(null);
  };

  const handleModalSave = (content: TriggerStepContent) => {
    if (editingIndex !== null) {
      setTriggerSteps((prev) => prev.map((s, i) => i === editingIndex ? content : s));
    } else {
      setTriggerSteps((prev) => [...prev, content]);
      setJustSelected(content.hotspotId);
      setTimeout(() => setJustSelected(null), 1500);
    }
    setModalHotspotId(null);
    setEditingIndex(null);
  };

  const handleModalCancel = () => {
    setModalHotspotId(null);
    setEditingIndex(null);
  };

  const openEditModal = (index: number) => {
    const existing = triggerSteps[index];
    setModalHotspotId(existing.hotspotId);
    setEditingIndex(index);
  };

  const removeTrigger = (index: number) => {
    setTriggerSteps((prev) => prev.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const triggerSummary = useMemo(() => {
    if (triggerSteps.length === 0) return '';
    return triggerSteps
      .map((s) => hotspots.find((h) => h.id === s.hotspotId)?.elementName)
      .filter(Boolean)
      .join(' -> ');
  }, [triggerSteps]);

  const proceedToStep2 = () => {
    const trimmedName = name.trim();
    if (!trimmedName) { setDetailError('Please enter an engagement name.'); return; }
    if ((type === 'nudge' || type === 'feedback') && !subType) {
      setDetailError('Please choose a subtype.'); return;
    }
    setDetailError('');
    setStep(2);
  };

  const saveEngagement = () => {
    if (triggerSteps.length === 0) {
      setTriggerError('Click at least one UI element and configure its content.');
      return;
    }
    setTriggerError('');
    createEngagement({
      name: name.trim(),
      type,
      subType: subType || undefined,
      status,
      triggerSummary: triggerSummary || 'Manual trigger',
      segment: segment.trim() || 'All users',
      lastTriggered: 'Never',
      impressions: 0,
      completions: 0,
      dismissals: 0,
      conversionRate: 0,
      linkedDraftId: null,
    });
    navigate('/engagements');
  };

  /* ── Step 1: Details ── */
  if (step === 1) {
    return (
      <div>
        <PageHeader
          title="Create Engagement"
          subtitle="Step 1 of 2 — Fill in basic details, then click through your product to set triggers."
          actions={(
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Back
            </Button>
          )}
        />

        <div className="max-w-xl">
          <Card className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-orbital-text-muted">Engagement Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Campaign CTA Spotlight"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-orbital-text-muted">Type</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-orbital-border-light rounded-lg"
                  value={type}
                  onChange={(e) => { setType(e.target.value as EngagementType); setSubType(''); }}
                >
                  <option value="tour">Tour</option>
                  <option value="nudge">Nudge</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-orbital-text-muted">Subtype</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-orbital-border-light rounded-lg disabled:bg-slate-50 disabled:text-slate-400"
                  value={subType}
                  onChange={(e) => setSubType(e.target.value as EngagementSubType | '')}
                  disabled={subTypeOptionsByType[type].length === 0}
                >
                  <option value="">
                    {subTypeOptionsByType[type].length === 0 ? 'N/A' : 'Choose...'}
                  </option>
                  {subTypeOptionsByType[type].map((opt) => (
                    <option key={opt} value={opt}>{subTypeLabels[opt]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-orbital-text-muted">Audience Segment</label>
              <select
                className="w-full px-3 py-2 text-sm border border-orbital-border-light rounded-lg"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
              >
                {segmentOptions.map((seg) => (
                  <option key={seg} value={seg}>{seg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-orbital-text-muted">Initial Status</label>
              <select
                className="w-full px-3 py-2 text-sm border border-orbital-border-light rounded-lg"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'active' | 'paused')}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            {detailError && <div className="text-xs text-red-600">{detailError}</div>}

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={proceedToStep2}>
                Next: Set Trigger Points <ArrowRight size={14} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  /* ── Step 2: Click-through trigger flow ── */
  return (
    <div className="h-[calc(100vh-2rem)]">
      <PageHeader
        title="Set Trigger Points"
        subtitle="Step 2 of 2 — Click elements in the product UI, then configure what users will see."
        actions={(
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              <ArrowLeft size={14} /> Back to Details
            </Button>
            <Button size="sm" onClick={saveEngagement}>
              <Check size={14} /> Create Engagement
            </Button>
          </div>
        )}
      />

      <div className="flex gap-4 h-[calc(100%-5rem)]">
        {/* Left: Browser frame */}
        <div className="flex-[3] flex flex-col min-w-0">
          <div className="bg-orbital-bg text-white px-4 py-2.5 rounded-t-xl flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orbital-success animate-pulse" />
              <span className="text-xs font-medium">Trigger Selection Mode</span>
            </div>
            <div className="h-4 w-px bg-orbital-border" />
            <span className="text-xs text-orbital-text-muted">Click elements to add trigger points</span>
            <div className="flex-1" />
            <Badge color="blue">{triggerSteps.length} step{triggerSteps.length !== 1 ? 's' : ''}</Badge>
          </div>

          <div className="bg-slate-100 px-3 py-1 flex items-center gap-0.5 border-b border-slate-200">
            {orderedPages.map((p) => (
              <button
                key={p}
                onClick={() => setActiveScreen(p)}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-medium transition-colors ${
                  activeScreen === p
                    ? 'bg-white text-orbital-text-dark shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageLabels[p]}
              </button>
            ))}
            <div className="flex-1" />
            <div className="text-[11px] text-slate-400 px-2 font-mono">
              app.mailflow.io/{activeScreen === 'dashboard' ? '' : activeScreen === 'wizard' ? 'campaigns/new' : activeScreen}
            </div>
          </div>

          <div className="flex-1 bg-white rounded-b-xl overflow-auto border border-t-0 border-slate-200">
            <TriggerBrowserMock
              page={activeScreen}
              selectedSet={selectedIds}
              justSelectedId={justSelected}
              onClick={handleHotspotClick}
            />
          </div>
        </div>

        {/* Right: Trigger flow panel */}
        <div className="flex-[2] flex flex-col min-w-0 overflow-hidden">
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-orbital-border-light bg-slate-50 shrink-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap size={14} className="text-orbital-primary" />
                Trigger Flow
              </div>
              <div className="text-xs text-orbital-text-muted mt-1">
                <span className="font-medium text-orbital-text-dark">{name}</span> · {type}{subType ? ` / ${subTypeLabels[subType as EngagementSubType]}` : ''}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {triggerSteps.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MousePointerClick size={32} className="text-orbital-text-muted mb-3" />
                  <p className="text-sm text-orbital-text-muted">Click elements in the product to add steps</p>
                  <p className="text-xs text-orbital-text-muted mt-1">Each click opens a form to configure what users see</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {triggerSteps.map((trigStep, i) => {
                    const hotspot = hotspots.find((h) => h.id === trigStep.hotspotId);
                    if (!hotspot) return null;
                    const isExpanded = expandedIndex === i;
                    return (
                      <motion.div
                        key={`${trigStep.hotspotId}-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-lg border border-orbital-border-light overflow-hidden"
                      >
                        <div
                          className="flex items-center gap-2 p-2.5 hover:bg-slate-50 cursor-pointer group"
                          onClick={() => setExpandedIndex(isExpanded ? null : i)}
                        >
                          <span className="w-5 h-5 rounded-full bg-orbital-primary/10 text-orbital-primary text-xs flex items-center justify-center shrink-0 font-semibold">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-orbital-text-dark truncate">{hotspot.elementName}</div>
                            <div className="text-[11px] text-orbital-text-muted">{pageLabels[hotspot.page]}</div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(i); }}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 text-orbital-text-muted hover:text-orbital-primary hover:bg-orbital-primary/10 transition-all shrink-0"
                            title="Edit content"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeTrigger(i); }}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 text-orbital-text-muted hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                            title="Remove"
                          >
                            <Trash2 size={13} />
                          </button>
                          {isExpanded ? <ChevronUp size={14} className="text-orbital-text-muted shrink-0" /> : <ChevronDown size={14} className="text-orbital-text-muted shrink-0" />}
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 pt-1 ml-7 border-t border-orbital-border-light">
                                <div className="rounded-lg border border-orbital-primary/30 bg-orbital-primary/5 p-3 mt-2">
                                  {trigStep.title && <div className="text-sm font-semibold text-orbital-text-dark">{trigStep.title}</div>}
                                  {trigStep.message && <div className="text-xs text-orbital-text-muted mt-1">{trigStep.message}</div>}
                                  <div className="mt-2">
                                    <span className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-orbital-primary text-white">
                                      {trigStep.buttonLabel}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {triggerSteps.length > 0 && (
              <div className="px-4 py-3 border-t border-orbital-border-light bg-slate-50 shrink-0">
                <div className="text-[11px] font-medium text-orbital-text-muted uppercase tracking-wide mb-1">Flow summary</div>
                <div className="text-xs text-orbital-text-dark">{triggerSummary}</div>
              </div>
            )}
          </Card>

          {triggerError && <div className="text-xs text-red-600 mt-2">{triggerError}</div>}
        </div>
      </div>

      {/* Content configuration modal */}
      {modalHotspotId && (
        <StepContentModal
          open
          hotspotId={modalHotspotId}
          engagementType={type}
          initial={editingIndex !== null ? triggerSteps[editingIndex] : undefined}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
        />
      )}
    </div>
  );
}
