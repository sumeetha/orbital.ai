import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Clock,
  Users,
  Mail,
  Eye,
  Plus,
  CheckCircle2,
  LayoutTemplate,
} from 'lucide-react';
import { useStore } from '../../store';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import Stepper from '../../components/Stepper';
import Badge from '../../components/Badge';
import { ORBITAL_IDS } from '../../orbital/ids';
import type { Campaign } from '../../types';

const STEPS = [
  { id: 'template', label: 'Template', orbitalId: ORBITAL_IDS.wizardStepTemplate },
  { id: 'audience', label: 'Audience', orbitalId: ORBITAL_IDS.wizardStepAudience },
  { id: 'content', label: 'Content', orbitalId: ORBITAL_IDS.wizardStepContent },
  { id: 'review', label: 'Review & Schedule', orbitalId: ORBITAL_IDS.wizardStepReview },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  newsletter: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'blue' },
  announcement: { bg: 'bg-purple-50', text: 'text-purple-600', badge: 'slate' },
  promo: { bg: 'bg-orange-50', text: 'text-orange-600', badge: 'amber' },
  transactional: { bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'emerald' },
  blank: { bg: 'bg-slate-50', text: 'text-slate-500', badge: 'slate' },
};

const CATEGORY_ICONS: Record<string, typeof Mail> = {
  newsletter: Mail,
  announcement: Send,
  promo: Eye,
  transactional: CheckCircle2,
  blank: LayoutTemplate,
};

export default function CampaignCreateWizard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const templates = useStore((s) => s.templates);
  const segments = useStore((s) => s.segments);
  const contacts = useStore((s) => s.contacts);
  const addCampaign = useStore((s) => s.addCampaign);
  const sendCampaign = useStore((s) => s.sendCampaign);
  const addToast = useStore((s) => s.addToast);

  const currentStep = Math.max(0, Math.min(3, (parseInt(searchParams.get('step') ?? '1', 10) - 1)));

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>('segment-all');
  const [fromName, setFromName] = useState('');
  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [body, setBody] = useState('');
  const [variantSubject, setVariantSubject] = useState('');
  const [showVariant, setShowVariant] = useState(false);
  const [sendMode, setSendMode] = useState<'now' | 'later'>('now');
  const [scheduleDate, setScheduleDate] = useState('');

  const setStep = (step: number) => {
    setSearchParams({ step: String(step + 1) });
  };

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId),
    [templates, selectedTemplateId],
  );

  const selectedSegment = useMemo(
    () => segments.find((s) => s.id === selectedAudienceId),
    [segments, selectedAudienceId],
  );

  const recipientCount = selectedAudienceId === 'segment-all'
    ? contacts.length
    : selectedSegment?.contactCount ?? 0;

  const canProceed = (() => {
    switch (currentStep) {
      case 0: return !!selectedTemplateId;
      case 1: return !!selectedAudienceId;
      case 2: return !!fromName && !!subject;
      case 3: return sendMode === 'now' || !!scheduleDate;
      default: return false;
    }
  })();

  const handleSaveDraft = () => {
    const campaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: subject || 'Untitled campaign',
      status: 'draft',
      audienceId: selectedAudienceId,
      templateId: selectedTemplateId,
      fromName,
      fromEmail: 'hello@mailflow.demo',
      subject,
      preheader: preheader || undefined,
      variants: showVariant && variantSubject
        ? [{ id: `variant-${Date.now()}`, subject: variantSubject }]
        : undefined,
    };
    addCampaign(campaign);
    addToast('Campaign saved as draft', 'success');
    navigate(`/campaigns/${campaign.id}`);
  };

  const handleSend = () => {
    const id = `campaign-${Date.now()}`;
    const campaign: Campaign = {
      id,
      name: subject || 'Untitled campaign',
      status: sendMode === 'later' ? 'scheduled' : 'draft',
      audienceId: selectedAudienceId,
      templateId: selectedTemplateId,
      fromName,
      fromEmail: 'hello@mailflow.demo',
      subject,
      preheader: preheader || undefined,
      scheduledFor: sendMode === 'later' ? scheduleDate : undefined,
      variants: showVariant && variantSubject
        ? [{ id: `variant-${Date.now()}`, subject: variantSubject }]
        : undefined,
    };
    addCampaign(campaign);
    if (sendMode === 'now') {
      sendCampaign(id);
    } else {
      addToast('Campaign scheduled', 'success');
    }
    navigate(`/campaigns/${id}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
        <h1 className="text-lg font-semibold text-text">Create Campaign</h1>
        <Button variant="ghost" size="sm" onClick={handleSaveDraft}>
          <Save size={14} />
          Save as draft
        </Button>
      </div>

      {/* Stepper */}
      <div className="px-6 py-4 bg-white border-b border-border">
        <Stepper steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {currentStep === 0 && (
          <StepTemplate
            templates={templates}
            selectedId={selectedTemplateId}
            onSelect={setSelectedTemplateId}
          />
        )}
        {currentStep === 1 && (
          <StepAudience
            segments={segments}
            selectedId={selectedAudienceId}
            onSelect={setSelectedAudienceId}
            recipientCount={recipientCount}
          />
        )}
        {currentStep === 2 && (
          <StepContent
            fromName={fromName}
            setFromName={setFromName}
            subject={subject}
            setSubject={setSubject}
            preheader={preheader}
            setPreheader={setPreheader}
            body={body}
            setBody={setBody}
            showVariant={showVariant}
            setShowVariant={setShowVariant}
            variantSubject={variantSubject}
            setVariantSubject={setVariantSubject}
            previewHtml={selectedTemplate?.previewHtml}
          />
        )}
        {currentStep === 3 && (
          <StepReview
            template={selectedTemplate}
            segment={selectedSegment}
            recipientCount={recipientCount}
            fromName={fromName}
            subject={subject}
            preheader={preheader}
            showVariant={showVariant}
            variantSubject={variantSubject}
            sendMode={sendMode}
            setSendMode={setSendMode}
            scheduleDate={scheduleDate}
            setScheduleDate={setScheduleDate}
          />
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-white">
        <div>
          {currentStep > 0 && (
            <Button
              variant="secondary"
              onClick={() => setStep(currentStep - 1)}
              data-orbital-id={ORBITAL_IDS.wizardBackBtn}
            >
              <ChevronLeft size={16} />
              Back
            </Button>
          )}
        </div>
        <div>
          {currentStep < 3 ? (
            <Button
              onClick={() => setStep(currentStep + 1)}
              disabled={!canProceed}
              data-orbital-id={ORBITAL_IDS.wizardNextBtn}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!canProceed}
              data-orbital-id={ORBITAL_IDS.wizardSendBtn}
            >
              {sendMode === 'now' ? <Send size={16} /> : <Clock size={16} />}
              {sendMode === 'now' ? 'Send campaign' : 'Schedule campaign'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Step 1: Template ────────────────────────────────────── */

function StepTemplate({
  templates,
  selectedId,
  onSelect,
}: {
  templates: ReturnType<typeof useStore.getState>['templates'];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-text mb-1">Choose a template</h2>
      <p className="text-sm text-text-muted mb-5">Select a starting point for your campaign.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {templates.map((tpl) => {
          const colors = CATEGORY_COLORS[tpl.category] ?? CATEGORY_COLORS.blank;
          const Icon = CATEGORY_ICONS[tpl.category] ?? LayoutTemplate;
          const isSelected = tpl.id === selectedId;
          return (
            <Card
              key={tpl.id}
              onClick={() => onSelect(tpl.id)}
              className={`overflow-hidden transition-all ${
                isSelected
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-slate-300'
              }`}
            >
              <div className={`h-32 flex items-center justify-center ${colors.bg}`}>
                <Icon size={36} className={colors.text} strokeWidth={1.5} />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-text truncate">{tpl.name}</p>
                <Badge
                  variant={colors.badge as 'slate' | 'emerald' | 'amber' | 'red' | 'blue'}
                  className="mt-1.5"
                >
                  {tpl.category}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 2: Audience ────────────────────────────────────── */

function StepAudience({
  segments,
  selectedId,
  onSelect,
  recipientCount,
}: {
  segments: ReturnType<typeof useStore.getState>['segments'];
  selectedId: string;
  onSelect: (id: string) => void;
  recipientCount: number;
}) {
  return (
    <div className="max-w-xl">
      <h2 className="text-base font-semibold text-text mb-1">Select audience</h2>
      <p className="text-sm text-text-muted mb-5">Choose who should receive this campaign.</p>

      <div className="space-y-2" data-orbital-id={ORBITAL_IDS.wizardAudienceSelect}>
        {segments.map((seg) => (
          <label
            key={seg.id}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedId === seg.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="audience"
              value={seg.id}
              checked={selectedId === seg.id}
              onChange={() => onSelect(seg.id)}
              className="accent-primary"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text">{seg.name}</p>
            </div>
            <span className="text-xs text-text-muted tabular-nums">
              {seg.contactCount.toLocaleString()} contacts
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-text-muted">
        <Users size={14} />
        <span>
          <strong className="text-text">{recipientCount.toLocaleString()}</strong> recipients selected
        </span>
      </div>
    </div>
  );
}

/* ── Step 3: Content ─────────────────────────────────────── */

function StepContent({
  fromName,
  setFromName,
  subject,
  setSubject,
  preheader,
  setPreheader,
  body,
  setBody,
  showVariant,
  setShowVariant,
  variantSubject,
  setVariantSubject,
  previewHtml,
}: {
  fromName: string;
  setFromName: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  preheader: string;
  setPreheader: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  showVariant: boolean;
  setShowVariant: (v: boolean) => void;
  variantSubject: string;
  setVariantSubject: (v: string) => void;
  previewHtml?: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-text mb-1">Compose your email</h2>
      <p className="text-sm text-text-muted mb-5">Fill in sender details and craft your message.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          id="from-name"
          label="From name"
          placeholder="e.g. Sarah from MailFlow"
          value={fromName}
          onChange={(e) => setFromName(e.target.value)}
        />
        <Input
          id="from-email"
          label="From email"
          value="hello@mailflow.demo"
          disabled
          className="opacity-60"
        />
      </div>

      <div className="space-y-4 mb-4">
        <Input
          id="subject"
          label="Subject"
          placeholder="Enter your subject line"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          data-orbital-id={ORBITAL_IDS.wizardSubjectInput}
        />
        {showVariant && (
          <Input
            id="variant-subject"
            label="A/B Variant — Subject"
            placeholder="Enter variant subject line"
            value={variantSubject}
            onChange={(e) => setVariantSubject(e.target.value)}
          />
        )}
        {!showVariant && (
          <button
            type="button"
            onClick={() => setShowVariant(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
            data-orbital-id={ORBITAL_IDS.wizardAddVariantBtn}
          >
            <Plus size={14} />
            Add A/B variant
          </button>
        )}
        <Input
          id="preheader"
          label="Preheader"
          placeholder="Short preview text shown in inbox"
          value={preheader}
          onChange={(e) => setPreheader(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="body" className="text-sm font-medium text-text">Email body</label>
          <textarea
            id="body"
            rows={12}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-white
              placeholder:text-text-muted resize-y
              focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            placeholder="Write your email content here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text">Preview</span>
          <div className="flex-1 border border-border rounded-md bg-slate-50 overflow-auto min-h-[200px]">
            {previewHtml ? (
              <div
                className="p-4"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : body ? (
              <div className="p-4 text-sm text-text whitespace-pre-wrap">{body}</div>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-text-muted p-6">
                Preview will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 4: Review & Schedule ───────────────────────────── */

function StepReview({
  template,
  segment,
  recipientCount,
  fromName,
  subject,
  preheader,
  showVariant,
  variantSubject,
  sendMode,
  setSendMode,
  scheduleDate,
  setScheduleDate,
}: {
  template?: ReturnType<typeof useStore.getState>['templates'][number];
  segment?: ReturnType<typeof useStore.getState>['segments'][number];
  recipientCount: number;
  fromName: string;
  subject: string;
  preheader: string;
  showVariant: boolean;
  variantSubject: string;
  sendMode: 'now' | 'later';
  setSendMode: (v: 'now' | 'later') => void;
  scheduleDate: string;
  setScheduleDate: (v: string) => void;
}) {
  const rows: { label: string; value: string }[] = [
    { label: 'Template', value: template?.name ?? '—' },
    { label: 'Audience', value: segment?.name ?? '—' },
    { label: 'Recipients', value: recipientCount.toLocaleString() },
    { label: 'From', value: fromName ? `${fromName} <hello@mailflow.demo>` : '—' },
    { label: 'Subject', value: subject || '—' },
    ...(preheader ? [{ label: 'Preheader', value: preheader }] : []),
    ...(showVariant && variantSubject ? [{ label: 'A/B Variant', value: variantSubject }] : []),
  ];

  return (
    <div className="max-w-xl">
      <h2 className="text-base font-semibold text-text mb-1">Review & schedule</h2>
      <p className="text-sm text-text-muted mb-5">Confirm your campaign details before sending.</p>

      <Card className="mb-6">
        <div className="divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start gap-4 px-4 py-3">
              <span className="text-xs font-medium text-text-muted w-24 shrink-0 pt-0.5">
                {row.label}
              </span>
              <span className="text-sm text-text">{row.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <h3 className="text-sm font-semibold text-text mb-3">When to send</h3>
      <div className="space-y-2">
        <label
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            sendMode === 'now' ? 'border-primary bg-primary/5' : 'border-border hover:border-slate-300'
          }`}
        >
          <input
            type="radio"
            name="sendMode"
            value="now"
            checked={sendMode === 'now'}
            onChange={() => setSendMode('now')}
            className="accent-primary"
          />
          <div>
            <p className="text-sm font-medium text-text">Send now</p>
            <p className="text-xs text-text-muted">Deliver immediately to all recipients</p>
          </div>
        </label>

        <label
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            sendMode === 'later' ? 'border-primary bg-primary/5' : 'border-border hover:border-slate-300'
          }`}
        >
          <input
            type="radio"
            name="sendMode"
            value="later"
            checked={sendMode === 'later'}
            onChange={() => setSendMode('later')}
            className="accent-primary"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-text">Schedule for later</p>
            <p className="text-xs text-text-muted">Pick a date and time</p>
          </div>
        </label>

        {sendMode === 'later' && (
          <div className="pl-8 pt-1">
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-md bg-white
                focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
}
