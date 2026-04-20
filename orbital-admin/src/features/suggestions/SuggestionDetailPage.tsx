import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Flag, MousePointerClick, BarChart3, Check, X, Eye, GripVertical, Plus, Trash2,
  Crosshair, ListChecks, MessageCircle, SquareStack, Megaphone, ThumbsUp, Star, FileText,
} from 'lucide-react';
import { Card, Button, Badge, Input, Textarea } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { useStore } from '../../store';
import type { TriggerType } from '../../mock/suggestions';
import type { EngagementSubType } from '../../mock/engagements';

const triggerIcons: Record<TriggerType, typeof Flag> = { state: Flag, behavioral: MousePointerClick, metric: BarChart3 };

const subTypeConfig: Record<string, { icon: typeof Flag; label: string; color: string }> = {
  'spotlight': { icon: Crosshair, label: 'Spotlight', color: 'bg-amber-50 text-amber-700' },
  'checklist': { icon: ListChecks, label: 'Checklist', color: 'bg-orange-50 text-orange-700' },
  'banner': { icon: Flag, label: 'Banner', color: 'bg-yellow-50 text-yellow-700' },
  'popup': { icon: MessageCircle, label: 'Popup', color: 'bg-rose-50 text-rose-700' },
  'modal': { icon: SquareStack, label: 'Modal', color: 'bg-red-50 text-red-700' },
  'micro-survey': { icon: Megaphone, label: 'Micro Survey', color: 'bg-violet-50 text-violet-700' },
  'nps': { icon: BarChart3, label: 'NPS', color: 'bg-purple-50 text-purple-700' },
  'like-dislike': { icon: ThumbsUp, label: 'Like / Dislike', color: 'bg-fuchsia-50 text-fuchsia-700' },
  'star-rating': { icon: Star, label: 'Star Rating', color: 'bg-pink-50 text-pink-700' },
  'large-survey': { icon: FileText, label: 'Large Survey', color: 'bg-indigo-50 text-indigo-700' },
};

function SubTypeBadge({ subType }: { subType?: EngagementSubType }) {
  if (!subType) return null;
  const cfg = subTypeConfig[subType];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

export function SuggestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { suggestions, updateSuggestion, acceptSuggestion, dismissSuggestion } = useStore();
  const suggestion = suggestions.find((s) => s.id === id);

  if (!suggestion) {
    return (
      <div className="text-center py-12">
        <p className="text-orbital-text-muted">Draft not found.</p>
        <Button variant="ghost" onClick={() => navigate('/suggestions')} className="mt-4"><ArrowLeft size={16} /> Back</Button>
      </div>
    );
  }

  const TriggerIcon = triggerIcons[suggestion.triggerType];

  return (
    <div>
      <div className="mb-4">
        <button onClick={() => navigate('/suggestions')} className="flex items-center gap-1 text-sm text-orbital-text-muted hover:text-orbital-text-dark">
          <ArrowLeft size={14} /> Back to Drafts
        </button>
      </div>

      <PageHeader
        title={suggestion.title}
        actions={
          <div className="flex items-center gap-2">
            {suggestion.status !== 'accepted' && (
              <Button onClick={() => { acceptSuggestion(suggestion.id); navigate('/suggestions'); }}>
                <Check size={16} /> Accept
              </Button>
            )}
            {suggestion.status !== 'dismissed' && (
              <Button variant="ghost" onClick={() => { dismissSuggestion(suggestion.id); navigate('/suggestions'); }}>
                <X size={16} /> Dismiss
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Main: Trigger + Steps */}
        <div className="col-span-2 space-y-6">
          {/* Trigger Conditions */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TriggerIcon size={16} className="text-orbital-primary" />
              Trigger Conditions
            </h2>
            <div className="space-y-3">
              {suggestion.triggers.map((trigger, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <Badge color={trigger.type === 'behavioral' ? 'amber' : trigger.type === 'metric' ? 'blue' : 'slate'}>
                    {trigger.type}
                  </Badge>
                  {trigger.type === 'state' && (
                    <div className="flex items-center gap-2 text-sm flex-1">
                      <span className="text-orbital-text-muted">When</span>
                      <Input className="w-32" value={trigger.field} readOnly />
                      <select className="px-2 py-1.5 text-sm border border-orbital-border-light rounded-lg" defaultValue={trigger.op}>
                        <option value="eq">equals</option>
                        <option value="neq">not equal</option>
                        <option value="gt">greater than</option>
                        <option value="lt">less than</option>
                        <option value="gte">at least</option>
                        <option value="lte">at most</option>
                      </select>
                      <Input className="w-24" defaultValue={String(trigger.value)} />
                    </div>
                  )}
                  {trigger.type === 'behavioral' && (
                    <div className="flex items-center gap-2 text-sm flex-1">
                      <span className="text-orbital-text-muted">When user exhibits</span>
                      <select className="px-2 py-1.5 text-sm border border-orbital-border-light rounded-lg" defaultValue={trigger.behavior}>
                        <option value="rage_clicks">Rage clicks</option>
                        <option value="dead_clicks">Dead clicks</option>
                        <option value="scroll_thrashing">Scroll thrashing</option>
                        <option value="exit_intent">Exit intent</option>
                        <option value="decision_paralysis">Decision paralysis</option>
                        <option value="back_and_forth">Repeated back-and-forth</option>
                      </select>
                      <span className="text-orbital-text-muted">on</span>
                      <Input className="flex-1" defaultValue={trigger.targetElement || ''} />
                    </div>
                  )}
                  {trigger.type === 'metric' && (
                    <div className="flex items-center gap-2 text-sm flex-1">
                      <span className="text-orbital-text-muted">When</span>
                      <Input className="w-40" defaultValue={trigger.metric} />
                      <select className="px-2 py-1.5 text-sm border border-orbital-border-light rounded-lg" defaultValue={trigger.op}>
                        <option value="gt">is above</option>
                        <option value="lt">is below</option>
                        <option value="eq">equals</option>
                        <option value="gte">is at least</option>
                        <option value="lte">is at most</option>
                      </select>
                      <Input className="w-24" type="number" defaultValue={trigger.value} />
                    </div>
                  )}
                  <button className="p-1 text-orbital-text-muted hover:text-orbital-danger"><Trash2 size={14} /></button>
                </div>
              ))}
              <button className="flex items-center gap-1 text-sm text-orbital-primary hover:underline">
                <Plus size={14} /> Add condition
              </button>
            </div>
          </Card>

          {/* Tour Steps */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-4">Tour Steps ({suggestion.steps.length})</h2>
            <div className="space-y-3">
              {suggestion.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <GripVertical size={16} className="text-slate-400 mt-1 cursor-grab shrink-0" />
                  <div className="w-6 h-6 rounded-full bg-orbital-primary text-white text-xs flex items-center justify-center shrink-0">{i + 1}</div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="text-xs text-orbital-text-muted">Target Element</label>
                      <Input className="mt-1" defaultValue={step.targetElement} />
                    </div>
                    <div>
                      <label className="text-xs text-orbital-text-muted">Message</label>
                      <Textarea className="mt-1" rows={2} defaultValue={step.message} />
                    </div>
                  </div>
                  <button className="p-1 text-orbital-text-muted hover:text-orbital-danger mt-1"><Trash2 size={14} /></button>
                </div>
              ))}
              <button className="flex items-center gap-1 text-sm text-orbital-primary hover:underline">
                <Plus size={14} /> Add step
              </button>
            </div>
          </Card>
        </div>

        {/* Sidebar: Meta */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-3">Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-orbital-text-muted">Trigger Type</label>
                <div className="flex items-center gap-1 mt-1 text-sm">
                  <TriggerIcon size={14} /> <span className="capitalize">{suggestion.triggerType}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-orbital-text-muted">Action Type</label>
                <div className="mt-1"><Badge color={suggestion.actionType === 'tour' ? 'blue' : suggestion.actionType === 'nudge' ? 'amber' : 'violet'}>{suggestion.actionType}</Badge></div>
              </div>
              {suggestion.actionSubType && (
                <div>
                  <label className="text-xs text-orbital-text-muted">Kind</label>
                  <div className="mt-1"><SubTypeBadge subType={suggestion.actionSubType} /></div>
                </div>
              )}
              <div>
                <label className="text-xs text-orbital-text-muted">Target Segment</label>
                <Input className="mt-1" defaultValue={suggestion.segment} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-3">Timing</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-orbital-text-muted">Schedule</label>
                <select className="w-full mt-1 px-3 py-2 text-sm border border-orbital-border-light rounded-lg">
                  <option>Always active</option>
                  <option>Date range</option>
                  <option>One-time per user</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-orbital-text-muted">Delay after trigger (seconds)</label>
                <Input type="number" className="mt-1" defaultValue="2" />
              </div>
              <div>
                <label className="text-xs text-orbital-text-muted">Rate limit override</label>
                <select className="w-full mt-1 px-3 py-2 text-sm border border-orbital-border-light rounded-lg">
                  <option>Use global limits</option>
                  <option>Custom for this draft</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-2">Rationale</h3>
            <p className="text-sm text-orbital-text-muted">{suggestion.rationale}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
