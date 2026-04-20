import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Flag, MousePointerClick, BarChart3, ChevronDown, ChevronUp, Eye, Pencil, Check, X, Shield, Loader2, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge, Input } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { useStore } from '../../store';
import type { Suggestion, TriggerType } from '../../mock/suggestions';

const triggerIcons: Record<TriggerType, typeof Flag> = { state: Flag, behavioral: MousePointerClick, metric: BarChart3 };
const triggerColors: Record<TriggerType, 'slate' | 'amber' | 'blue'> = { state: 'slate', behavioral: 'amber', metric: 'blue' };
const actionColors: Record<string, 'violet' | 'blue' | 'amber'> = { tour: 'violet', nudge: 'blue', tooltip: 'amber' };

const generatingMessages = [
  'Analyzing your product structure...',
  'Matching goals to UI elements...',
  'Identifying behavioral patterns...',
  'Evaluating risk metrics...',
  'Generating recommendations...',
];

function RateLimitsCard() {
  const { rateLimits, updateRateLimits } = useStore();
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="p-5 mb-6 border-l-4 border-l-orbital-primary">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-orbital-primary" />
          <h3 className="text-sm font-semibold">Guidance Limits</h3>
          <span className="text-xs text-orbital-text-muted">— auto-configured to prevent tour fatigue</span>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="space-y-1">
                <label className="text-xs text-orbital-text-muted">Max tours/user/day</label>
                <Input type="number" value={rateLimits.maxToursPerDay} onChange={(e) => updateRateLimits({ maxToursPerDay: +e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-orbital-text-muted">Max nudges/session</label>
                <Input type="number" value={rateLimits.maxNudgesPerSession} onChange={(e) => updateRateLimits({ maxNudgesPerSession: +e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-orbital-text-muted">Cooldown between nudges</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-orbital-border-light rounded-lg"
                  value={rateLimits.cooldownHours}
                  onChange={(e) => updateRateLimits({ cooldownHours: +e.target.value })}
                >
                  {[1, 2, 4, 8, 24].map((h) => <option key={h} value={h}>{h} hours</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-orbital-text-muted">Cooldown after dismissal</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-orbital-border-light rounded-lg"
                  value={rateLimits.cooldownAfterDismissalHours}
                  onChange={(e) => updateRateLimits({ cooldownAfterDismissalHours: +e.target.value })}
                >
                  {[4, 8, 12, 24, 48].map((h) => <option key={h} value={h}>{h} hours</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-orbital-text-muted">Max tooltips on screen</label>
                <Input type="number" value={rateLimits.maxTooltipsOnScreen} onChange={(e) => updateRateLimits({ maxTooltipsOnScreen: +e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-orbital-text-muted">Suppress after X dismissals</label>
                <Input type="number" value={rateLimits.suppressAfterDismissals} onChange={(e) => updateRateLimits({ suppressAfterDismissals: +e.target.value })} />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs text-orbital-text-muted">Priority order (when multiple triggers fire)</label>
              <div className="flex items-center gap-2 mt-2">
                {rateLimits.priorityOrder.map((type, i) => {
                  const Icon = triggerIcons[type];
                  return (
                    <div key={type} className="flex items-center gap-1">
                      {i > 0 && <span className="text-xs text-orbital-text-muted mx-1">→</span>}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                        <GripVertical size={12} className="text-slate-400" />
                        <Icon size={12} />
                        <span className="capitalize">{type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-[11px] text-orbital-text-muted mt-3 italic">
              Based on industry benchmarks. Excessive interruptions reduce engagement by ~40%.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const { acceptSuggestion, dismissSuggestion } = useStore();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const TriggerIcon = triggerIcons[suggestion.triggerType];

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`overflow-hidden transition-colors ${suggestion.status === 'dismissed' ? 'opacity-50' : ''}`}>
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              suggestion.triggerType === 'behavioral' ? 'bg-amber-50' : suggestion.triggerType === 'metric' ? 'bg-blue-50' : 'bg-slate-100'
            }`}>
              <TriggerIcon size={18} className={
                suggestion.triggerType === 'behavioral' ? 'text-amber-600' : suggestion.triggerType === 'metric' ? 'text-blue-600' : 'text-slate-600'
              } />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm">{suggestion.title}</h3>
                <Badge color={triggerColors[suggestion.triggerType]}>{suggestion.triggerType}</Badge>
                <Badge color={actionColors[suggestion.actionType] || 'slate'}>{suggestion.actionType}</Badge>
                <Badge color={suggestion.status === 'accepted' ? 'green' : suggestion.status === 'dismissed' ? 'slate' : 'blue'}>
                  {suggestion.status}
                </Badge>
              </div>
              <p className="text-xs text-orbital-text-muted mt-1">{suggestion.triggerSummary}</p>
              <p className="text-xs text-orbital-text-muted">Segment: {suggestion.segment}</p>
            </div>
            <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-slate-100 rounded">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-orbital-border-light space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-orbital-text-muted uppercase tracking-wide mb-1">Rationale</h4>
                    <p className="text-sm text-orbital-text-dark">{suggestion.rationale}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-orbital-text-muted uppercase tracking-wide mb-2">Steps ({suggestion.steps.length})</h4>
                    <div className="space-y-1.5">
                      {suggestion.steps.map((step, i) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-orbital-primary/10 text-orbital-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div>
                            <span className="font-medium text-orbital-text-dark">{step.targetElement}</span>
                            <p className="text-xs text-orbital-text-muted mt-0.5">"{step.message}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-orbital-text-muted uppercase tracking-wide mb-1">Trigger Conditions</h4>
                    <div className="space-y-1">
                      {suggestion.triggers.map((t, i) => (
                        <div key={i} className="text-xs px-2 py-1 rounded bg-slate-50 text-slate-600 font-mono">
                          {t.type === 'state' && `${t.field} ${t.op} ${t.value}`}
                          {t.type === 'behavioral' && `${t.behavior} on ${t.targetElement} (${t.threshold})`}
                          {t.type === 'metric' && `${t.metric} ${t.op} ${t.value}`}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-orbital-border-light">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              <Eye size={14} /> {expanded ? 'Collapse' : 'Details'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/suggestions/${suggestion.id}`)}>
              <Pencil size={14} /> Edit
            </Button>
            <div className="flex-1" />
            {suggestion.status !== 'dismissed' && (
              <Button variant="ghost" size="sm" onClick={() => dismissSuggestion(suggestion.id)}>
                <X size={14} /> Dismiss
              </Button>
            )}
            {suggestion.status !== 'accepted' && (
              <Button size="sm" onClick={() => acceptSuggestion(suggestion.id)}>
                <Check size={14} /> Accept
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function SuggestionsPage() {
  const { suggestions, isGenerating, generateSuggestions, completeSuggestions } = useStore();
  const [genMsgIndex, setGenMsgIndex] = useState(0);

  useEffect(() => {
    if (suggestions.length === 0 && !isGenerating) {
      generateSuggestions();
    }
  }, []);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setGenMsgIndex((i) => (i + 1) % generatingMessages.length);
    }, 800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const accepted = suggestions.filter((s) => s.status === 'accepted');
  const active = suggestions.filter((s) => s.status !== 'dismissed');
  const dismissed = suggestions.filter((s) => s.status === 'dismissed');

  return (
    <div>
      <PageHeader
        title="Drafts"
        subtitle={suggestions.length > 0 ? `${suggestions.length} recommendations based on your goals, UI structure, and documentation` : 'Generating personalized recommendations...'}
        actions={
          accepted.length > 0 ? (
            <Button onClick={completeSuggestions}>
              <Check size={16} /> Finalize ({accepted.length} accepted)
            </Button>
          ) : undefined
        }
      />

      {isGenerating ? (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 size={40} className="text-orbital-primary animate-spin" />
              <Sparkles size={16} className="text-orbital-primary absolute top-0 right-0" />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={genMsgIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-sm text-orbital-text-muted"
              >
                {generatingMessages[genMsgIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </Card>
      ) : (
        <>
          <RateLimitsCard />

          <div className="space-y-4">
            {active.map((sug) => <SuggestionCard key={sug.id} suggestion={sug} />)}
            {dismissed.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-orbital-text-muted uppercase tracking-wide mb-3">Dismissed ({dismissed.length})</h3>
                <div className="space-y-3">
                  {dismissed.map((sug) => <SuggestionCard key={sug.id} suggestion={sug} />)}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
