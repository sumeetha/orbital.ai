import { useNavigate } from 'react-router-dom';
import { BookOpen, MousePointerClick, MessageSquare, Sparkles, Check, ArrowRight, Activity } from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import { PageHeader } from '../../components/PageHeader';
import { useStore } from '../../store';

const journeySteps = [
  { key: 'knowledge' as const, label: 'Upload product knowledge', icon: BookOpen, path: '/knowledge' },
  { key: 'annotation' as const, label: 'Annotate your product', icon: MousePointerClick, path: '/annotate' },
  { key: 'setup' as const, label: 'Define goals and instructions', icon: MessageSquare, path: '/setup' },
  { key: 'suggestions' as const, label: 'Review AI drafts', icon: Sparkles, path: '/suggestions' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const journeyComplete = useStore((s) => s.journeyComplete);
  const capturedElements = useStore((s) => s.capturedElements);
  const suggestions = useStore((s) => s.suggestions);
  const accepted = suggestions.filter((s) => s.status === 'accepted');

  const completedCount = Object.values(journeyComplete).filter(Boolean).length;
  const firstIncomplete = journeySteps.find((s) => !journeyComplete[s.key]);

  return (
    <div>
      <PageHeader title="Welcome back, Sarah" subtitle="Set up Orbital AI for MailFlow" />

      <div className="grid grid-cols-3 gap-6">
        {/* Setup Checklist */}
        <div className="col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Setup Progress</h2>
              <Badge color={completedCount === 4 ? 'green' : 'blue'}>{completedCount}/4 complete</Badge>
            </div>
            <div className="space-y-3">
              {journeySteps.map((step, i) => {
                const complete = journeyComplete[step.key];
                const isNext = step === firstIncomplete;
                return (
                  <button
                    key={step.key}
                    onClick={() => navigate(step.path)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-colors ${
                      complete ? 'bg-emerald-50/50' : isNext ? 'bg-orbital-primary/5 border border-orbital-primary/20' : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      complete ? 'bg-orbital-success text-white' : isNext ? 'bg-orbital-primary text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {complete ? <Check size={20} /> : <step.icon size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${complete ? 'text-orbital-success' : 'text-orbital-text-dark'}`}>
                        Step {i + 1}: {step.label}
                      </div>
                      <div className="text-xs text-orbital-text-muted mt-0.5">
                        {complete ? 'Completed' : isNext ? 'Up next' : 'Not started'}
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-orbital-text-muted" />
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Active Drafts */}
          {suggestions.length > 0 && (
            <Card className="p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Active Drafts</h2>
                <Badge color="blue">{accepted.length} accepted / {suggestions.length} total</Badge>
              </div>
              <div className="space-y-2">
                {suggestions.slice(0, 4).map((sug) => (
                  <div key={sug.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <Badge color={sug.actionType === 'tour' ? 'blue' : sug.actionType === 'nudge' ? 'amber' : 'violet'}>
                      {sug.actionType}
                    </Badge>
                    <span className="text-sm flex-1 truncate">{sug.title}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Semantic Map Summary */}
          {capturedElements.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MousePointerClick size={16} className="text-orbital-primary" />
                Semantic Map
              </h3>
              <div className="text-3xl font-bold text-orbital-text-dark">{capturedElements.length}</div>
              <div className="text-xs text-orbital-text-muted mt-1">
                elements across {new Set(capturedElements.map((e) => e.hotspot.page)).size} pages
              </div>
              <button
                onClick={() => navigate('/annotate')}
                className="mt-3 text-xs text-orbital-primary hover:underline"
              >
                View full map
              </button>
            </Card>
          )}

          {/* Activity Log */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity size={16} className="text-orbital-primary" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {journeyComplete.knowledge && (
                <div className="text-xs text-orbital-text-muted flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orbital-success mt-1.5 shrink-0" />
                  Knowledge base updated — 6 sources ingested
                </div>
              )}
              {journeyComplete.annotation && (
                <div className="text-xs text-orbital-text-muted flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orbital-success mt-1.5 shrink-0" />
                  Annotation complete — {capturedElements.length} elements mapped
                </div>
              )}
              {journeyComplete.setup && (
                <div className="text-xs text-orbital-text-muted flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orbital-success mt-1.5 shrink-0" />
                  Goals and metrics configured
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="text-xs text-orbital-text-muted flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orbital-info mt-1.5 shrink-0" />
                  {suggestions.length} engagement drafts generated
                </div>
              )}
              {!journeyComplete.knowledge && (
                <div className="text-xs text-orbital-text-muted italic">No activity yet. Start by uploading product knowledge.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
